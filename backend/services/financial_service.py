"""
Financial service for managing invoices, payments, and financial operations
"""
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta

from models import User, CreditTransaction
from models.credit_models import CreditDispute
from services.base_service import BaseService
from services.stripe_service import StripeService
from services.email_service import EmailService

logger = logging.getLogger(__name__)


class FinancialService:
    """Service for managing financial operations and credit system"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_credit_details(self, user_id: int) -> Dict[str, Any]:
        """Get detailed credit information for a specific user (admin only)"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Get recent transactions
            transactions = self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(desc(CreditTransaction.created_at)).limit(50).all()
            
            # Get subscription information
            subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.user_id == user_id
            ).all()
            
            # Calculate totals
            total_earned = self._calculate_total_earned(user_id)
            total_spent = self._calculate_total_spent(user_id)
            
            # Format transaction data
            transaction_data = []
            for tx in transactions:
                transaction_data.append({
                    "id": tx.id,
                    "amount": tx.amount,
                    "description": tx.description,
                    "created_at": tx.created_at.isoformat(),
                    "type": "credit" if tx.amount > 0 else "debit",
                    "job_id": tx.job_id,
                    "subscription_id": tx.subscription_id,
                    "stripe_payment_intent_id": tx.stripe_payment_intent_id
                })
            
            # Format subscription data
            subscription_data = []
            for sub in subscriptions:
                subscription_data.append({
                    "id": sub.id,
                    "stripe_subscription_id": sub.stripe_subscription_id,
                    "product_name": sub.product_name,
                    "status": sub.status,
                    "amount": sub.amount,
                    "currency": sub.currency,
                    "interval": sub.interval,
                    "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
                    "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
                    "created_at": sub.created_at.isoformat() if sub.created_at else None
                })
            
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "credits": user.credits,
                    "credit_status": user.credit_status,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                },
                "credits": {
                    "current_balance": user.credits,
                    "total_earned": total_earned,
                    "total_spent": total_spent,
                    "net_change": total_earned - total_spent
                },
                "subscriptions": subscription_data,
                "recent_transactions": transaction_data,
                "summary": {
                    "active_subscriptions": len([s for s in subscriptions if s.status == "active"]),
                    "total_transactions": len(transactions),
                    "last_transaction_date": transactions[0].created_at.isoformat() if transactions else None
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting user credit details: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def get_customer_billing(self, user_id: int) -> Dict[str, Any]:
        """Get customer billing information including invoices, subscriptions, and disputes"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Get user's credit balance
            credit_balance = user.credits
            
            # Get user's subscriptions
            subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.user_id == user_id
            ).all()
            
            # Get user's credit transactions (for invoices)
            transactions = self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(desc(CreditTransaction.created_at)).all()
            
            # Get user's disputes
            disputes = self.db.query(CreditDispute).filter(
                CreditDispute.user_id == user_id
            ).order_by(desc(CreditDispute.created_at)).all()
            
            # Format subscription data
            subscription_data = []
            for sub in subscriptions:
                subscription_data.append({
                    "id": sub.id,
                    "product_name": sub.product_name,
                    "status": sub.status,
                    "amount": sub.amount,
                    "currency": sub.currency,
                    "interval": sub.interval,
                    "interval_count": sub.interval_count,
                    "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
                    "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
                    "next_billing_date": sub.current_period_end.isoformat() if sub.current_period_end else None,
                    "stripe_subscription_id": sub.stripe_subscription_id
                })
            
            # Format transaction data as invoices
            invoice_data = []
            for tx in transactions:
                if tx.stripe_payment_intent_id:  # Only include Stripe transactions
                    invoice_data.append({
                        "id": tx.id,
                        "number": f"INV-{tx.id[:8].upper()}",
                        "amount": abs(tx.amount) * 10,  # Convert credits to cents (1 credit = $0.10)
                        "currency": "USD",
                        "status": "paid" if tx.amount > 0 else "unpaid",
                        "due_date": tx.created_at.isoformat(),
                        "created_at": tx.created_at.isoformat(),
                        "description": tx.description,
                        "stripe_invoice_id": tx.stripe_payment_intent_id
                    })
            
            # Format dispute data
            dispute_data = []
            for dispute in disputes:
                dispute_data.append({
                    "id": dispute.id,
                    "transaction_id": dispute.transaction_id,
                    "reason": dispute.reason,
                    "description": dispute.description,
                    "status": dispute.status,
                    "requested_refund": dispute.requested_refund,
                    "created_at": dispute.created_at.isoformat(),
                    "resolved_at": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
                    "resolution_notes": dispute.resolution_notes
                })
            
            # Mock payment methods (in real implementation, this would come from Stripe)
            payment_methods = [
                {
                    "id": "pm_mock_123",
                    "type": "card",
                    "last4": "4242",
                    "brand": "visa",
                    "exp_month": 12,
                    "exp_year": 2025
                }
            ]
            
            return {
                "invoices": invoice_data,
                "subscriptions": subscription_data,
                "disputes": dispute_data,
                "credit_balance": credit_balance,
                "payment_methods": payment_methods
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting customer billing: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def create_dispute(
        self,
        user_id: int,
        transaction_id: str,
        reason: str,
        description: str,
        requested_refund: int = 0
    ) -> Dict[str, Any]:
        """Create a new credit dispute"""
        try:
            # Verify transaction exists
            transaction = self.db.query(CreditTransaction).filter(
                CreditTransaction.id == transaction_id
            ).first()
            
            if not transaction:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Transaction not found"
                )
            
            # Verify user owns the transaction
            if transaction.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only dispute your own transactions"
                )
            
            # Create dispute
            dispute = CreditDispute(
                user_id=user_id,
                transaction_id=transaction_id,
                reason=reason,
                description=description,
                requested_refund=requested_refund,
                status="pending"
            )
            
            self.db.add(dispute)
            self.db.commit()
            
            logger.info(f"Created dispute {dispute.id} for transaction {transaction_id}")
            
            return {
                "success": True,
                "message": "Dispute created successfully",
                "dispute_id": dispute.id,
                "status": "pending"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating dispute: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def get_user_disputes(self, user_id: int) -> Dict[str, Any]:
        """Get disputes for a user"""
        try:
            disputes = self.db.query(CreditDispute).filter(
                CreditDispute.user_id == user_id
            ).order_by(desc(CreditDispute.created_at)).all()
            
            dispute_data = []
            for dispute in disputes:
                dispute_data.append({
                    "id": dispute.id,
                    "transaction_id": dispute.transaction_id,
                    "reason": dispute.reason,
                    "description": dispute.description,
                    "status": dispute.status,
                    "requested_refund": dispute.requested_refund,
                    "created_at": dispute.created_at.isoformat(),
                    "resolved_at": dispute.resolved_at.isoformat() if dispute.resolved_at else None,
                    "resolution_notes": dispute.resolution_notes
                })
            
            return {
                "disputes": dispute_data,
                "total": len(dispute_data)
            }
            
        except Exception as e:
            logger.error(f"Error getting user disputes: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def get_user_credits(self, user_id: int) -> Dict[str, Any]:
        """Get current credit balance and transaction history for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Get recent transactions
            transactions = self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(desc(CreditTransaction.created_at)).limit(10).all()
            
            transaction_data = []
            for tx in transactions:
                transaction_data.append({
                    "id": tx.id,
                    "amount": tx.amount,
                    "description": tx.description,
                    "created_at": tx.created_at,
                    "type": "credit" if tx.amount > 0 else "debit"
                })
            
            return {
                "current_balance": user.credits,
                "total_earned": self._calculate_total_earned(user_id),
                "total_spent": self._calculate_total_spent(user_id),
                "recent_transactions": transaction_data
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting user credits: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def add_credits(
        self,
        user_id: int,
        amount: int,
        description: str,
        transaction_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Add credits to a user's account"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            if amount <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Credit amount must be positive"
                )
            
            # Generate transaction ID if not provided
            if not transaction_id:
                transaction_id = f"credit_{user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
            
            # Check if transaction already exists
            existing_tx = self.db.query(CreditTransaction).filter(
                CreditTransaction.id == transaction_id
            ).first()
            
            if existing_tx:
                logger.warning(f"Transaction {transaction_id} already exists, skipping")
                return {
                    "success": True,
                    "message": "Credits already added",
                    "transaction_id": transaction_id,
                    "new_balance": user.credits
                }
            
            # Create credit transaction
            credit_transaction = CreditTransaction(
                id=transaction_id,
                user_id=user_id,
                amount=amount,
                description=description
            )
            
            self.db.add(credit_transaction)
            
            # Update user credits
            user.credits += amount
            
            self.db.commit()
            
            logger.info(f"Added {amount} credits to user {user_id}. New balance: {user.credits}")
            
            return {
                "success": True,
                "message": f"Successfully added {amount} credits",
                "transaction_id": transaction_id,
                "new_balance": user.credits,
                "amount_added": amount
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adding credits: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def spend_credits(
        self,
        user_id: int,
        amount: int,
        description: str,
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Spend credits from a user's account"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            if amount <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Credit amount must be positive"
                )
            
            if user.credits < amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient credits. Required: {amount}, Available: {user.credits}"
                )
            
            # Generate transaction ID
            transaction_id = f"debit_{user_id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
            
            # Create debit transaction (negative amount)
            debit_transaction = CreditTransaction(
                id=transaction_id,
                user_id=user_id,
                amount=-amount,  # Negative for spending
                description=description,
                job_id=job_id
            )
            
            self.db.add(debit_transaction)
            
            # Update user credits
            user.credits -= amount
            
            self.db.commit()
            
            logger.info(f"Spent {amount} credits from user {user_id}. New balance: {user.credits}")
            
            return {
                "success": True,
                "message": f"Successfully spent {amount} credits",
                "transaction_id": transaction_id,
                "new_balance": user.credits,
                "amount_spent": amount
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error spending credits: {str(e)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def get_subscription_summary(self, user_id: int) -> Dict[str, Any]:
        """Get subscription summary for a user"""
        try:
            subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.user_id == user_id
            ).all()
            
            active_subscriptions = []
            total_monthly_cost = 0
            
            for sub in subscriptions:
                if sub.status == "active":
                    active_subscriptions.append({
                        "id": sub.id,
                        "stripe_subscription_id": sub.stripe_subscription_id,
                        "product_name": sub.product_name,
                        "amount": sub.amount,
                        "currency": sub.currency,
                        "interval": sub.interval,
                        "interval_count": sub.interval_count,
                        "current_period_start": sub.current_period_start,
                        "current_period_end": sub.current_period_end,
                        "next_billing_date": sub.current_period_end
                    })
                    
                    # Calculate monthly cost
                    if sub.interval == "month":
                        total_monthly_cost += sub.amount
                    elif sub.interval == "year":
                        total_monthly_cost += sub.amount / 12
                    elif sub.interval == "week":
                        total_monthly_cost += sub.amount * 4.33  # Average weeks per month
            
            return {
                "active_subscriptions": active_subscriptions,
                "total_monthly_cost": round(total_monthly_cost, 2),
                "subscription_count": len(active_subscriptions)
            }
            
        except Exception as e:
            logger.error(f"Error getting subscription summary: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def get_financial_dashboard(self, admin_user: User, period: str = '30') -> Dict[str, Any]:
        """Get financial dashboard data for admins with period filtering"""
        try:
            if not admin_user.is_admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin access required"
                )
            
            # Convert period to days
            period_days = int(period) if period.isdigit() else 30
            
            # Get total users and credits
            total_users = self.db.query(User).count()
            total_credits = self.db.query(func.sum(User.credits)).scalar() or 0
            
            # Get recent credit transactions
            recent_transactions = self.db.query(CreditTransaction).order_by(
                desc(CreditTransaction.created_at)
            ).limit(20).all()
            
            # Get subscription statistics
            active_subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.status == "active"
            ).count()
            
            total_subscription_revenue = self.db.query(
                func.sum(StripeSubscription.amount)
            ).filter(
                StripeSubscription.status == "active"
            ).scalar() or 0
            
            # Get period-based credit usage
            period_days_ago = datetime.now(timezone.utc) - timedelta(days=period_days)
            period_credits_spent = self.db.query(
                func.sum(func.abs(CreditTransaction.amount))
            ).filter(
                and_(
                    CreditTransaction.amount < 0,
                    CreditTransaction.created_at >= period_days_ago
                )
            ).scalar() or 0
            
            period_credits_added = self.db.query(
                func.sum(CreditTransaction.amount)
            ).filter(
                and_(
                    CreditTransaction.amount > 0,
                    CreditTransaction.created_at >= period_days_ago
                )
            ).scalar() or 0
            
            transaction_data = []
            for tx in recent_transactions:
                user = self.db.query(User).filter(User.id == tx.user_id).first()
                transaction_data.append({
                    "id": tx.id,
                    "user_email": user.email if user else "Unknown",
                    "amount": tx.amount,
                    "description": tx.description,
                    "created_at": tx.created_at,
                    "type": "credit" if tx.amount > 0 else "debit"
                })
            
            return {
                "overview": {
                    "total_users": total_users,
                    "total_credits": total_credits,
                    "active_subscriptions": active_subscriptions,
                    "total_subscription_revenue": round(total_subscription_revenue, 2)
                },
                "monthly_stats": {
                    "credits_spent": period_credits_spent,
                    "credits_added": period_credits_added,
                    "net_change": period_credits_added - period_credits_spent
                },
                "recent_transactions": transaction_data
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting financial dashboard: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def generate_financial_report(
        self,
        report_type: str = 'summary',
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate financial reports for admins"""
        try:
            # Parse dates if provided
            start_dt = None
            end_dt = None
            
            if start_date:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            if end_date:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            
            # Build query filters
            filters = []
            if start_dt:
                filters.append(CreditTransaction.created_at >= start_dt)
            if end_dt:
                filters.append(CreditTransaction.created_at <= end_dt)
            
            # Get transactions based on filters
            query = self.db.query(CreditTransaction)
            if filters:
                query = query.filter(and_(*filters))
            
            transactions = query.order_by(desc(CreditTransaction.created_at)).all()
            
            # Calculate report data
            total_credits_added = sum(tx.amount for tx in transactions if tx.amount > 0)
            total_credits_spent = sum(abs(tx.amount) for tx in transactions if tx.amount < 0)
            net_change = total_credits_added - total_credits_spent
            
            # Get user statistics
            total_users = self.db.query(User).count()
            active_users = self.db.query(User).filter(User.credits > 0).count()
            
            # Get subscription statistics
            active_subscriptions = self.db.query(StripeSubscription).filter(
                StripeSubscription.status == "active"
            ).count()
            
            report_data = {
                "report_type": report_type,
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "summary": {
                    "total_transactions": len(transactions),
                    "total_credits_added": total_credits_added,
                    "total_credits_spent": total_credits_spent,
                    "net_change": net_change
                },
                "users": {
                    "total_users": total_users,
                    "active_users": active_users,
                    "active_subscriptions": active_subscriptions
                },
                "transactions": [
                    {
                        "id": tx.id,
                        "user_id": tx.user_id,
                        "amount": tx.amount,
                        "description": tx.description,
                        "created_at": tx.created_at.isoformat(),
                        "type": "credit" if tx.amount > 0 else "debit"
                    }
                    for tx in transactions[:100]  # Limit to 100 for summary
                ]
            }
            
            if report_type == 'detailed':
                # Add more detailed information
                report_data["detailed_stats"] = {
                    "transactions_by_type": self._get_transactions_by_type(transactions),
                    "top_users": self._get_top_users_by_credits(),
                    "daily_totals": self._get_daily_totals(transactions)
                }
            
            return report_data
            
        except Exception as e:
            logger.error(f"Error generating financial report: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def get_financial_transactions(
        self,
        user_id: Optional[int] = None,
        transaction_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get financial transactions with filtering for admins"""
        try:
            # Build query filters
            filters = []
            
            if user_id:
                filters.append(CreditTransaction.user_id == user_id)
            
            if transaction_type:
                if transaction_type == 'credit':
                    filters.append(CreditTransaction.amount > 0)
                elif transaction_type == 'debit':
                    filters.append(CreditTransaction.amount < 0)
            
            if start_date:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                filters.append(CreditTransaction.created_at >= start_dt)
            
            if end_date:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                filters.append(CreditTransaction.created_at <= end_dt)
            
            # Build and execute query
            query = self.db.query(CreditTransaction)
            if filters:
                query = query.filter(and_(*filters))
            
            total_count = query.count()
            transactions = query.order_by(desc(CreditTransaction.created_at)).offset(offset).limit(limit).all()
            
            # Format transaction data
            transaction_data = []
            for tx in transactions:
                user = self.db.query(User).filter(User.id == tx.user_id).first()
                transaction_data.append({
                    "id": tx.id,
                    "user_id": tx.user_id,
                    "user_email": user.email if user else "Unknown",
                    "amount": tx.amount,
                    "description": tx.description,
                    "created_at": tx.created_at.isoformat(),
                    "type": "credit" if tx.amount > 0 else "debit",
                    "job_id": tx.job_id
                })
            
            return {
                "transactions": transaction_data,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + limit < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting financial transactions: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )
    
    async def process_subscription_renewal(
        self,
        subscription_id: str,
        user_id: int,
        credits_to_add: int
    ) -> Dict[str, Any]:
        """Process subscription renewal and add credits"""
        try:
            # Add credits for subscription renewal
            result = await self.add_credits(
                user_id=user_id,
                amount=credits_to_add,
                description=f"Subscription renewal credits: {subscription_id}",
                transaction_id=f"sub_renewal_{subscription_id}_{datetime.now(timezone.utc).strftime('%Y%m%d')}"
            )
            
            # Update subscription next billing date
            subscription = self.db.query(StripeSubscription).filter(
                StripeSubscription.stripe_subscription_id == subscription_id
            ).first()
            
            if subscription:
                # Calculate next billing period
                if subscription.interval == "month":
                    subscription.current_period_start = subscription.current_period_end
                    subscription.current_period_end = subscription.current_period_end + timedelta(days=30)
                elif subscription.interval == "year":
                    subscription.current_period_start = subscription.current_period_end
                    subscription.current_period_end = subscription.current_period_end + timedelta(days=365)
                
                self.db.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing subscription renewal: {str(e)}")
            raise
    
    def _calculate_total_earned(self, user_id: int) -> int:
        """Calculate total credits earned by a user"""
        result = self.db.query(func.sum(CreditTransaction.amount)).filter(
            and_(
                CreditTransaction.user_id == user_id,
                CreditTransaction.amount > 0
            )
        ).scalar()
        return result or 0
    
    def _calculate_total_spent(self, user_id: int) -> int:
        """Calculate total credits spent by a user"""
        result = self.db.query(func.sum(func.abs(CreditTransaction.amount))).filter(
            and_(
                CreditTransaction.user_id == user_id,
                CreditTransaction.amount < 0
            )
        ).scalar()
        return result or 0
    
    def _get_transactions_by_type(self, transactions: List[CreditTransaction]) -> Dict[str, int]:
        """Get transaction count by type"""
        credit_count = sum(1 for tx in transactions if tx.amount > 0)
        debit_count = sum(1 for tx in transactions if tx.amount < 0)
        
        return {
            "credit": credit_count,
            "debit": debit_count
        }
    
    def _get_top_users_by_credits(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by credit balance"""
        users = self.db.query(User).order_by(desc(User.credits)).limit(limit).all()
        
        return [
            {
                "id": user.id,
                "email": user.email,
                "credits": user.credits,
                "credit_status": user.credit_status
            }
            for user in users
        ]
    
    def _get_daily_totals(self, transactions: List[CreditTransaction]) -> List[Dict[str, Any]]:
        """Get daily credit totals"""
        daily_totals = {}
        
        for tx in transactions:
            date_str = tx.created_at.strftime('%Y-%m-%d')
            if date_str not in daily_totals:
                daily_totals[date_str] = {"credits": 0, "debits": 0}
            
            if tx.amount > 0:
                daily_totals[date_str]["credits"] += tx.amount
            else:
                daily_totals[date_str]["debits"] += abs(tx.amount)
        
        return [
            {
                "date": date,
                "credits_added": totals["credits"],
                "credits_spent": totals["debits"],
                "net_change": totals["credits"] - totals["debits"]
            }
            for date, totals in sorted(daily_totals.items(), reverse=True)
        ]
