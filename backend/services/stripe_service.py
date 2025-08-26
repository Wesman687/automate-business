"""
Stripe service for payment processing, customer management, and webhook handling.
"""
import stripe
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from config import config
from database.stripe_models import (
    StripeCustomer, StripeSubscription, StripePaymentIntent,
    StripePaymentMethod, StripeWebhookEvent, StripeProduct
)
from database.models import User, CreditTransaction
from utils.idempotency import IdempotencyManager

# Configure Stripe
stripe.api_key = config.STRIPE_SECRET_KEY
stripe.api_version = config.STRIPE_API_VERSION

logger = logging.getLogger(__name__)


class StripeService:
    """Centralized service for all Stripe operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.idempotency_manager = IdempotencyManager()
        self.webhook_secret = config.STRIPE_WEBHOOK_SECRET
    
    async def create_customer(self, user: User, email: str, name: Optional[str] = None) -> StripeCustomer:
        """Create a Stripe customer and link it to a user"""
        try:
            # Check if customer already exists
            existing_customer = self.db.query(StripeCustomer).filter(
                StripeCustomer.user_id == user.id
            ).first()
            
            if existing_customer:
                return existing_customer
            
            # Create Stripe customer
            stripe_customer_data = {
                "email": email,
                "metadata": {
                    "user_id": str(user.id),
                    "user_type": user.user_type
                }
            }
            
            if name:
                stripe_customer_data["name"] = name
            
            stripe_customer = stripe.Customer.create(**stripe_customer_data)
            
            # Store in database
            db_customer = StripeCustomer(
                user_id=user.id,
                stripe_customer_id=stripe_customer.id,
                email=email,
                name=name
            )
            
            self.db.add(db_customer)
            self.db.commit()
            self.db.refresh(db_customer)
            
            logger.info(f"Created Stripe customer {stripe_customer.id} for user {user.id}")
            return db_customer
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating customer: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create customer: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating customer: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def create_checkout_session(
        self,
        user_id: int,
        price_id: str,
        success_url: str,
        cancel_url: str,
        mode: str = "subscription",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a Stripe Checkout session for payments or subscriptions"""
        try:
            # Get or create customer
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            customer = await self.create_customer(user, user.email, user.name)
            
            # Create checkout session
            session_data = {
                "customer": customer.stripe_customer_id,
                "payment_method_types": ["card"],
                "line_items": [{"price": price_id, "quantity": 1}],
                "mode": mode,
                "success_url": success_url,
                "cancel_url": cancel_url,
                "metadata": metadata or {},
                "allow_promotion_codes": True,
                "billing_address_collection": "required",
                "customer_update": {
                    "address": "auto",
                    "name": "auto"
                }
            }
            
            # Add subscription-specific settings
            if mode == "subscription":
                session_data["subscription_data"] = {
                    "metadata": {
                        "user_id": str(user_id)
                    }
                }
            
            checkout_session = stripe.checkout.Session.create(**session_data)
            
            logger.info(f"Created checkout session {checkout_session.id} for user {user_id}")
            return {
                "session_id": checkout_session.id,
                "url": checkout_session.url
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create checkout session: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating checkout session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def create_subscription(
        self,
        user_id: int,
        price_id: str,
        payment_method_id: Optional[str] = None,
        trial_period_days: Optional[int] = None
    ) -> StripeSubscription:
        """Create a subscription for a user"""
        try:
            # Get or create customer
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            customer = await self.create_customer(user, user.email, user.name)
            
            # Get price details
            price = stripe.Price.retrieve(price_id)
            product = stripe.Product.retrieve(price.product)
            
            # Create subscription
            subscription_data = {
                "customer": customer.stripe_customer_id,
                "items": [{"price": price_id}],
                "metadata": {
                    "user_id": str(user_id)
                }
            }
            
            if payment_method_id:
                subscription_data["default_payment_method"] = payment_method_id
            
            if trial_period_days:
                subscription_data["trial_period_days"] = trial_period_days
            
            stripe_subscription = stripe.Subscription.create(**subscription_data)
            
            # Store in database
            db_subscription = StripeSubscription(
                stripe_subscription_id=stripe_subscription.id,
                customer_id=customer.id,
                user_id=user_id,
                status=stripe_subscription.status,
                current_period_start=datetime.fromtimestamp(
                    stripe_subscription.current_period_start, tz=timezone.utc
                ),
                current_period_end=datetime.fromtimestamp(
                    stripe_subscription.current_period_end, tz=timezone.utc
                ),
                interval=price.recurring.interval,
                interval_count=price.recurring.interval_count,
                amount=price.unit_amount / 100,  # Convert from cents
                currency=price.currency,
                product_id=product.id,
                product_name=product.name,
                product_description=product.description
            )
            
            if stripe_subscription.trial_start:
                db_subscription.trial_start = datetime.fromtimestamp(
                    stripe_subscription.trial_start, tz=timezone.utc
                )
            if stripe_subscription.trial_end:
                db_subscription.trial_end = datetime.fromtimestamp(
                    stripe_subscription.trial_end, tz=timezone.utc
                )
            
            self.db.add(db_subscription)
            self.db.commit()
            self.db.refresh(db_subscription)
            
            logger.info(f"Created subscription {stripe_subscription.id} for user {user_id}")
            return db_subscription
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create subscription: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def cancel_subscription(self, subscription_id: str, user_id: int) -> bool:
        """Cancel a subscription"""
        try:
            # Verify ownership
            subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription_id,
                StripeSubscription.user_id == user_id
            ).first()
            
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Subscription not found"
                )
            
            # Cancel in Stripe
            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            
            # Update local status
            subscription.status = "canceled"
            self.db.commit()
            
            logger.info(f"Canceled subscription {subscription_id} for user {user_id}")
            return True
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error canceling subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to cancel subscription: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error canceling subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def get_customer_portal_url(self, user_id: int) -> str:
        """Get customer portal URL for subscription management"""
        try:
            customer = self.db.query(StripeCustomer).filter(
                StripeCustomer.user_id == user_id
            ).first()
            
            if not customer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer not found"
                )
            
            session = stripe.billing_portal.Session.create(
                customer=customer.stripe_customer_id,
                return_url=f"{config.BACKEND_URL}/customer/dashboard"
            )
            
            return session.url
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating portal session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create portal session: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating portal session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def process_webhook(
        self,
        payload: bytes,
        signature: str,
        webhook_secret: str
    ) -> Dict[str, Any]:
        """Process Stripe webhook with signature verification"""
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            
            # Log webhook event
            webhook_event = StripeWebhookEvent(
                stripe_event_id=event.id,
                event_type=event.type,
                api_version=event.api_version,
                created=datetime.fromtimestamp(event.created, tz=timezone.utc),
                data=event.data,
                livemode=event.livemode
            )
            
            self.db.add(webhook_event)
            self.db.commit()
            
            # Process based on event type
            if event.type == "checkout.session.completed":
                await self._handle_checkout_completed(event.data.object)
            elif event.type == "invoice.payment_succeeded":
                await self._handle_payment_succeeded(event.data.object)
            elif event.type == "invoice.payment_failed":
                await self._handle_payment_failed(event.data.object)
            elif event.type == "customer.subscription.updated":
                await self._handle_subscription_updated(event.data.object)
            elif event.type == "customer.subscription.deleted":
                await self._handle_subscription_deleted(event.data.object)
            
            # Mark as processed
            webhook_event.processed = True
            webhook_event.processed_at = datetime.now(timezone.utc)
            self.db.commit()
            
            logger.info(f"Processed webhook event {event.id} of type {event.type}")
            return {"status": "success", "event_id": event.id}
            
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook payload"
            )
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook signature verification failed"
            )
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            # Mark webhook as failed
            if 'webhook_event' in locals():
                webhook_event.processed = True
                webhook_event.error_message = str(e)
                self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def _handle_checkout_completed(self, session: Dict[str, Any]) -> None:
        """Handle successful checkout completion"""
        try:
            customer_id = session.get("customer")
            if not customer_id:
                return
            
            # Find our customer record
            customer = self.db.query(StripeCustomer).filter(
                StripeCustomer.stripe_customer_id == customer_id
            ).first()
            
            if not customer:
                return
            
            # Add credits based on the product purchased
            # This would be configured based on your product pricing
            credits_to_add = self._calculate_credits_from_session(session)
            
            if credits_to_add > 0:
                # Create credit transaction
                credit_transaction = CreditTransaction(
                    id=f"stripe_{session['id']}",
                    user_id=customer.user_id,
                    amount=credits_to_add,
                    description=f"Credits purchased via Stripe checkout: {session['id']}"
                )
                
                self.db.add(credit_transaction)
                
                # Update user credits
                user = self.db.query(User).filter(User.id == customer.user_id).first()
                if user:
                    user.credits += credits_to_add
                
                self.db.commit()
                
                logger.info(f"Added {credits_to_add} credits to user {customer.user_id}")
                
        except Exception as e:
            logger.error(f"Error handling checkout completed: {str(e)}")
            raise
    
    async def _handle_payment_succeeded(self, invoice: Dict[str, Any]) -> None:
        """Handle successful invoice payment"""
        try:
            subscription_id = invoice.get("subscription")
            if not subscription_id:
                return
            
            # Find our subscription record
            subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription_id
            ).first()
            
            if not subscription:
                return
            
            # Add subscription credits
            credits_to_add = self._calculate_credits_from_subscription(subscription)
            
            if credits_to_add > 0:
                # Create credit transaction
                credit_transaction = CreditTransaction(
                    id=f"stripe_sub_{subscription_id}_{invoice['id']}",
                    user_id=subscription.user_id,
                    amount=credits_to_add,
                    description=f"Subscription credits: {subscription.product_name}"
                )
                
                self.db.add(credit_transaction)
                
                # Update user credits
                user = self.db.query(User).filter(User.id == subscription.user_id).first()
                if user:
                    user.credits += credits_to_add
                
                self.db.commit()
                
                logger.info(f"Added {credits_to_add} subscription credits to user {subscription.user_id}")
                
        except Exception as e:
            logger.error(f"Error handling payment succeeded: {str(e)}")
            raise
    
    async def _handle_payment_failed(self, invoice: Dict[str, Any]) -> None:
        """Handle failed invoice payment"""
        try:
            subscription_id = invoice.get("subscription")
            if not subscription_id:
                return
            
            # Find our subscription record
            subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription_id
            ).first()
            
            if not subscription:
                return
            
            # Update subscription status
            subscription.status = "past_due"
            self.db.commit()
            
            logger.info(f"Marked subscription {subscription_id} as past due")
            
        except Exception as e:
            logger.error(f"Error handling payment failed: {str(e)}")
            raise
    
    async def _handle_subscription_updated(self, subscription: Dict[str, Any]) -> None:
        """Handle subscription updates"""
        try:
            # Find our subscription record
            db_subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription["id"]
            ).first()
            
            if not db_subscription:
                return
            
            # Update status and other fields
            db_subscription.status = subscription["status"]
            db_subscription.current_period_start = datetime.fromtimestamp(
                subscription["current_period_start"], tz=timezone.utc
            )
            db_subscription.current_period_end = datetime.fromtimestamp(
                subscription["current_period_end"], tz=timezone.utc
            )
            
            self.db.commit()
            
            logger.info(f"Updated subscription {subscription['id']}")
            
        except Exception as e:
            logger.error(f"Error handling subscription updated: {str(e)}")
            raise
    
    async def _handle_subscription_deleted(self, subscription: Dict[str, Any]) -> None:
        """Handle subscription deletion"""
        try:
            # Find our subscription record
            db_subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription["id"]
            ).first()
            
            if not db_subscription:
                return
            
            # Update status
            db_subscription.status = "canceled"
            self.db.commit()
            
            logger.info(f"Marked subscription {subscription['id']} as canceled")
            
        except Exception as e:
            logger.error(f"Error handling subscription deleted: {str(e)}")
            raise
    
    def _calculate_credits_from_session(self, session: Dict[str, Any]) -> int:
        """Calculate credits to add based on checkout session"""
        # This would be configured based on your product pricing
        # For now, return a default value
        return 100  # Default credits for one-time purchase
    
    def _calculate_credits_from_subscription(self, subscription: StripeSubscription) -> int:
        """Calculate credits to add based on subscription"""
        # This would be configured based on your subscription plans
        # For now, return a default value
        return 50  # Default monthly credits

    async def get_user_subscriptions(self, user_id: int) -> Dict[str, Any]:
        """Get subscriptions for a user"""
        try:
            subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.user_id == user_id
            ).all()
            
            subscription_data = []
            for sub in subscriptions:
                subscription_data.append({
                    "id": sub.id,
                    "stripe_subscription_id": sub.stripe_subscription_id,
                    "status": sub.status,
                    "current_period_start": sub.current_period_start,
                    "current_period_end": sub.current_period_end,
                    "amount": sub.amount,
                    "currency": sub.currency,
                    "product_name": sub.product_name,
                    "interval": sub.interval,
                    "interval_count": sub.interval_count
                })
            
            return {"subscriptions": subscription_data}
            
        except Exception as e:
            logger.error(f"Error getting user subscriptions: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def create_payment_intent(
        self,
        user_id: int,
        amount: int,
        description: str,
        payment_method_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a payment intent for one-time payments"""
        try:
            # Create payment intent in Stripe
            payment_intent_data = {
                "amount": amount,
                "currency": "usd",
                "description": description,
                "metadata": {
                    "user_id": str(user_id),
                    "type": "one_time_payment"
                }
            }
            
            if payment_method_id:
                payment_intent_data["payment_method"] = payment_method_id
                payment_intent_data["confirm"] = True
            
            payment_intent = stripe.PaymentIntent.create(**payment_intent_data)
            
            # Store payment intent in database
            db_payment_intent = StripePaymentIntent(
                id=payment_intent.id,
                user_id=user_id,
                amount=amount,
                currency=payment_intent.currency,
                status=payment_intent.status,
                description=description
            )
            
            self.db.add(db_payment_intent)
            self.db.commit()
            
            return {
                "id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "status": payment_intent.status,
                "amount": payment_intent.amount,
                "currency": payment_intent.currency
            }
            
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment intent"
            )

    async def process_refund(
        self,
        payment_intent_id: str,
        reason: str = "requested_by_customer",
        amount: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process a refund for a payment"""
        try:
            # Process refund in Stripe
            refund_data = {
                "payment_intent": payment_intent_id,
                "reason": reason
            }
            
            if amount:
                refund_data["amount"] = amount
            
            refund = stripe.Refund.create(**refund_data)
            
            # Update payment intent status in database
            db_payment_intent = self.db.query(StripePaymentIntent).filter(
                StripePaymentIntent.id == payment_intent_id
            ).first()
            
            if db_payment_intent:
                db_payment_intent.status = "refunded"
                self.db.commit()
            
            return {
                "id": refund.id,
                "amount": refund.amount,
                "currency": refund.currency,
                "status": refund.status,
                "reason": refund.reason
            }
            
        except Exception as e:
            logger.error(f"Error processing refund: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process refund"
            )

    async def get_customer_billing(self, user_id: int) -> Dict[str, Any]:
        """Get customer billing information from Stripe"""
        try:
            # Get Stripe customer
            stripe_customer = self.db.query(StripeCustomer).filter(
                StripeCustomer.user_id == user_id
            ).first()
            
            if not stripe_customer:
                return {
                    "invoices": [],
                    "subscriptions": [],
                    "payment_methods": []
                }
            
            # Get invoices from Stripe
            invoices = stripe.Invoice.list(customer=stripe_customer.stripe_customer_id, limit=100)
            
            # Get payment methods from Stripe
            payment_methods = stripe.PaymentMethod.list(
                customer=stripe_customer.stripe_customer_id,
                type="card"
            )
            
            # Get subscriptions from database (already handled by FinancialService)
            subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.user_id == user_id
            ).all()
            
            # Format invoice data
            invoice_data = []
            for invoice in invoices.data:
                invoice_data.append({
                    "id": invoice.id,
                    "number": invoice.number,
                    "amount": invoice.amount_due,
                    "currency": invoice.currency,
                    "status": invoice.status,
                    "due_date": invoice.due_date,
                    "created_at": invoice.created,
                    "description": invoice.description or "Invoice",
                    "stripe_invoice_id": invoice.id
                })
            
            # Format payment method data
            payment_method_data = []
            for method in payment_methods.data:
                payment_method_data.append({
                    "id": method.id,
                    "type": method.type,
                    "last4": method.card.last4,
                    "brand": method.card.brand,
                    "exp_month": method.card.exp_month,
                    "exp_year": method.card.exp_year
                })
            
            return {
                "invoices": invoice_data,
                "payment_methods": payment_method_data
            }
            
        except Exception as e:
            logger.error(f"Error getting customer billing: {str(e)}")
            # Return empty data on error
            return {
                "invoices": [],
                "payment_methods": []
            }

    async def download_invoice(self, invoice_id: str, user_id: int) -> Dict[str, Any]:
        """Download an invoice PDF"""
        try:
            # Verify user owns this invoice
            stripe_customer = self.db.query(StripeCustomer).filter(
                StripeCustomer.user_id == user_id
            ).first()
            
            if not stripe_customer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer not found"
                )
            
            # Get invoice from Stripe
            invoice = stripe.Invoice.retrieve(invoice_id)
            
            if invoice.customer != stripe_customer.stripe_customer_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
            
            # Generate invoice PDF
            invoice_pdf = stripe.Invoice.retrieve_pdf(invoice_id)
            
            return {
                "pdf_data": invoice_pdf,
                "filename": f"invoice_{invoice.number}.pdf",
                "content_type": "application/pdf"
            }
            
        except Exception as e:
            logger.error(f"Error downloading invoice: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to download invoice"
            )

    async def cancel_subscription_admin(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a subscription (admin only)"""
        try:
            # Get subscription from database
            subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription_id
            ).first()
            
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Subscription not found"
                )
            
            # Cancel subscription in Stripe
            stripe_subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            
            # Update subscription status in database
            subscription.status = "canceled"
            self.db.commit()
            
            return {
                "message": "Subscription canceled successfully",
                "subscription_id": subscription_id,
                "status": "canceled"
            }
            
        except Exception as e:
            logger.error(f"Error canceling subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel subscription"
            )

    async def update_subscription(
        self,
        subscription_id: str,
        price_id: Optional[str] = None,
        quantity: Optional[int] = None
    ) -> Dict[str, Any]:
        """Update a subscription"""
        try:
            # Get subscription from database
            subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription_id
            ).first()
            
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Subscription not found"
                )
            
            # Update subscription in Stripe
            update_data = {}
            if price_id:
                update_data["items"] = [{
                    "id": subscription.stripe_subscription_id,
                    "price": price_id
                }]
            if quantity:
                update_data["quantity"] = quantity
            
            stripe_subscription = stripe.Subscription.modify(
                subscription_id,
                **update_data
            )
            
            # Update subscription in database
            if price_id:
                subscription.price_id = price_id
            if quantity:
                subscription.quantity = quantity
            
            self.db.commit()
            
            return {
                "message": "Subscription updated successfully",
                "subscription_id": subscription_id,
                "status": stripe_subscription.status
            }
            
        except Exception as e:
            logger.error(f"Error updating subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update subscription"
            )

    async def update_payment_method(
        self,
        payment_method_id: str,
        card_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a payment method"""
        try:
            # Update payment method in Stripe
            stripe.PaymentMethod.modify(
                payment_method_id,
                card=card_data
            )
            
            return {
                "message": "Payment method updated successfully",
                "payment_method_id": payment_method_id
            }
            
        except Exception as e:
            logger.error(f"Error updating payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update payment method"
            )

    async def delete_payment_method(self, payment_method_id: str) -> Dict[str, Any]:
        """Delete a payment method"""
        try:
            # Detach payment method in Stripe
            stripe.PaymentMethod.detach(payment_method_id)
            
            return {
                "message": "Payment method deleted successfully",
                "payment_method_id": payment_method_id
            }
            
        except Exception as e:
            logger.error(f"Error deleting payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete payment method"
            )
