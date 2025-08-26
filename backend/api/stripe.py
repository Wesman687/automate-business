"""
Stripe API endpoints for payment processing and subscription management.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging
import stripe

from database import get_db
from services.stripe_service import StripeService
from database.models import User
from schemas.stripe import (
    CheckoutSessionCreate, SubscriptionCreate, CustomerPortalResponse,
    StripeProduct, StripePrice, StripeProductWithPrices, StripeSubscription,
    StripeCustomer, StripePaymentMethod, StripeWebhookEvent
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stripe", tags=["stripe"])


@router.post("/create-checkout-session")
async def create_checkout_session(
    checkout_data: CheckoutSessionCreate,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Create a Stripe checkout session for credit purchase"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.create_checkout_session(
            user_id=current_user.id,
            price_id=checkout_data.price_id,
            success_url=checkout_data.success_url,
            cancel_url=checkout_data.cancel_url
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )


@router.post("/create-subscription")
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Create a subscription for a user (admin only)"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.create_subscription(
            user_id=subscription_data.user_id,
            price_id=subscription_data.price_id,
            description=subscription_data.description
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )


@router.post("/cancel-subscription")
async def cancel_subscription(
    subscription_id: str,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Cancel a subscription"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.cancel_subscription(subscription_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )


@router.get("/customer-portal")
async def get_customer_portal_url(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get Stripe customer portal URL"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.get_customer_portal_url(current_user.id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting customer portal URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer portal URL"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.process_webhook(request)
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process webhook"
        )


@router.get("/products")
async def get_products(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get available Stripe products and prices"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.get_products()
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting products: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get products"
        )


@router.get("/user-subscriptions")
async def get_user_subscriptions(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get user's subscriptions"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.get_user_subscriptions(current_user.id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting user subscriptions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user subscriptions"
        )


@router.post("/create-payment-intent")
async def create_payment_intent(
    payment_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Create a payment intent for one-time payments"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.create_payment_intent(
            user_id=current_user.id,
            amount=payment_data.get('amount'),
            description=payment_data.get('description'),
            payment_method_id=payment_data.get('payment_method_id')
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )


@router.post("/refund")
async def process_refund(
    refund_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Process a refund for a payment (admin only)"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.process_refund(
            payment_intent_id=refund_data.get('payment_intent_id'),
            reason=refund_data.get('reason', 'requested_by_customer'),
            amount=refund_data.get('amount')  # Optional, full refund if not specified
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing refund: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process refund"
        )


@router.get("/customer-billing")
async def get_customer_billing(
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Get customer billing information including invoices, subscriptions, and payment methods"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.get_customer_billing(current_user.id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting customer billing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get customer billing information"
        )


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Download an invoice PDF"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.download_invoice(invoice_id, current_user.id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error downloading invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download invoice"
        )


@router.post("/subscriptions/{subscription_id}/cancel")
async def cancel_subscription_admin(
    subscription_id: str,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="admin")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Cancel a subscription (admin only)"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.cancel_subscription_admin(subscription_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )


@router.post("/subscriptions/{subscription_id}/update")
async def update_subscription(
    subscription_id: str,
    update_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Update a subscription"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.update_subscription(
            subscription_id=subscription_id,
            price_id=update_data.get('price_id'),
            quantity=update_data.get('quantity')
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update subscription"
        )


@router.post("/payment-methods/{payment_method_id}/update")
async def update_payment_method(
    payment_method_id: str,
    update_data: Dict[str, Any] = Body(...),
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Update a payment method"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.update_payment_method(
            payment_method_id=payment_method_id,
            card_data=update_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error updating payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update payment method"
        )


@router.delete("/payment-methods/{payment_method_id}")
async def delete_payment_method(
    payment_method_id: str,
    current_user: User = Depends(lambda: User(id=1, email="test@example.com", user_type="customer")),  # Temporary mock
    db: Session = Depends(get_db)
):
    """Delete a payment method"""
    try:
        stripe_service = StripeService(db)
        result = await stripe_service.delete_payment_method(payment_method_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Error deleting payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete payment method"
        )
