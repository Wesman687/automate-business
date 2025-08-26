from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from database.models import User, CreditTransaction
from models.credit_models import CreditPackage, UserSubscription
from models.cross_app_models import AppIntegration, AppCreditUsage, AppStatus
from schemas.cross_app import AppPermission
from services.cross_app_auth_service import CrossAppAuthService
from services.stripe_service import StripeService
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import logging
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class CrossAppCreditService:
    """Service for managing credits for cross-app users"""
    
    def __init__(self, db: Session):
        self.db = db
        self.cross_app_auth = CrossAppAuthService(db)
        self.stripe_service = StripeService(db)
    
    def check_credit_balance(self, session_token: str, app_id: str, 
                           required_credits: Optional[int] = None) -> Dict[str, Any]:
        """Check user's credit balance and available packages"""
        
        # Validate session and get user info
        user_data = self.cross_app_auth.validate_cross_app_token(session_token, app_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token"
            )
        
        # Check permission
        if not self.cross_app_auth.check_user_permission(session_token, app_id, AppPermission.READ_CREDITS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to read credit information"
            )
        
        # Get user's current credit balance
        user = self.db.query(User).filter(User.id == user_data["user_id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        current_credits = user.credits
        can_consume = current_credits >= (required_credits or 0)
        
        # Get available credit packages
        available_packages = self._get_available_credit_packages()
        
        return {
            "user_id": user.id,
            "current_credits": current_credits,
            "can_consume": can_consume,
            "required_credits": required_credits,
            "available_packages": available_packages
        }
    
    def consume_credits(self, session_token: str, app_id: str, credits: int, 
                       service: str, description: Optional[str] = None,
                       metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Consume credits for a service"""
        
        # Validate session and get user info
        user_data = self.cross_app_auth.validate_cross_app_token(session_token, app_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token"
            )
        
        # Check permission
        if not self.cross_app_auth.check_user_permission(session_token, app_id, AppPermission.CONSUME_CREDITS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to consume credits"
            )
        
        # Validate credit amount
        if credits <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Credit amount must be positive"
            )
        
        # Get user and check balance
        user = self.db.query(User).filter(User.id == user_data["user_id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.credits < credits:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. Required: {credits}, Available: {user.credits}"
            )
        
        # Create credit transaction
        transaction = CreditTransaction(
            user_id=user.id,
            amount=-credits,  # Negative for consumption
            transaction_type="consumption",
            description=description or f"Credits consumed for {service}",
            metadata={
                "service": service,
                "app_id": app_id,
                "cross_app": True,
                **(metadata or {})
            }
        )
        
        # Update user credit balance
        user.credits -= credits
        
        # Update app credit usage
        self._update_app_credit_usage(user.id, app_id, credits, 0)
        
        # Commit all changes
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        
        logger.info(f"Consumed {credits} credits for user {user.id} in app {app_id} for service {service}")
        
        return {
            "success": True,
            "credits_consumed": credits,
            "remaining_credits": user.credits,
            "transaction_id": str(transaction.id),
            "error": None
        }
    
    async def purchase_credits(self, session_token: str, app_id: str, 
                        package_id: Optional[int] = None, credits: int = 0,
                        return_url: str = "") -> Dict[str, Any]:
        """Create a credit purchase flow for cross-app users"""
        
        # Validate session and get user info
        user_data = self.cross_app_auth.validate_cross_app_token(session_token, app_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token"
            )
        
        # Check permission
        if not self.cross_app_auth.check_user_permission(session_token, app_id, AppPermission.PURCHASE_CREDITS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to purchase credits"
            )
        
        # Get app integration
        app = self.cross_app_auth.validate_app_integration(app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App integration not found"
            )
        
        # Get user
        user = self.db.query(User).filter(User.id == user_data["user_id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Determine credit package and amount
        if package_id:
            # Use specific package
            package = self.db.query(CreditPackage).filter(
                and_(
                    CreditPackage.id == package_id,
                    CreditPackage.is_active == True
                )
            ).first()
            
            if not package:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Credit package not found"
                )
            
            credits = package.credit_amount
            price_id = package.stripe_price_id
        else:
            # Custom credit amount
            if credits <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Credit amount must be positive"
                )
            
            # Find appropriate package for custom amount or create one-time purchase
            package = self._find_package_for_credits(credits)
            price_id = package.stripe_price_id if package else None
        
        if not price_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pricing available for this credit amount"
            )
        
        # Create Stripe checkout session
        try:
            checkout_data = await self.stripe_service.create_checkout_session(
                user_id=user.id,
                price_id=price_id,
                success_url=f"{return_url}?success=true&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{return_url}?canceled=true",
                mode="payment",
                metadata={
                    "app_id": app_id,
                    "cross_app": True,
                    "credits": credits,
                    "package_id": package_id
                }
            )
            
            return {
                "checkout_url": checkout_data["url"],
                "session_id": checkout_data["session_id"],
                "expires_at": datetime.utcnow() + timedelta(hours=1)  # Stripe sessions expire in 1 hour
            }
            
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create checkout session"
            )
    
    def get_credit_packages(self, session_token: str, app_id: str) -> List[Dict[str, Any]]:
        """Get available credit packages for the app"""
        
        # Validate session
        user_data = self.cross_app_auth.validate_cross_app_token(session_token, app_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token"
            )
        
        # Check permission
        if not self.cross_app_auth.check_user_permission(session_token, app_id, AppPermission.READ_CREDITS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to read credit packages"
            )
        
        packages = self._get_available_credit_packages()
        return packages
    
    def get_user_subscriptions(self, session_token: str, app_id: str) -> List[Dict[str, Any]]:
        """Get user's active subscriptions"""
        
        # Validate session
        user_data = self.cross_app_auth.validate_cross_app_token(session_token, app_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token"
            )
        
        # Check permission
        if not self.cross_app_auth.check_user_permission(session_token, app_id, AppPermission.MANAGE_SUBSCRIPTIONS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to manage subscriptions"
            )
        
        # Get user's subscriptions
        subscriptions = self.db.query(UserSubscription).filter(
            and_(
                UserSubscription.user_id == user_data["user_id"],
                UserSubscription.status.in_(["active", "trial"])
            )
        ).all()
        
        return [
            {
                "id": sub.id,
                "package_name": sub.package.name,
                "status": sub.status.value,
                "monthly_credit_limit": sub.monthly_credit_limit,
                "current_month_credits": sub.current_month_credits,
                "rollover_credits": sub.rollover_credits,
                "next_billing_date": sub.next_billing_date,
                "stripe_subscription_id": sub.stripe_subscription_id
            }
            for sub in subscriptions
        ]
    
    def _get_available_credit_packages(self) -> List[Dict[str, Any]]:
        """Get all available credit packages"""
        packages = self.db.query(CreditPackage).filter(
            CreditPackage.is_active == True
        ).order_by(CreditPackage.sort_order, CreditPackage.monthly_price).all()
        
        return [
            {
                "id": pkg.id,
                "name": pkg.name,
                "description": pkg.description,
                "monthly_price": float(pkg.monthly_price),
                "credit_amount": pkg.credit_amount,
                "credit_rate": float(pkg.credit_rate),
                "features": pkg.features or [],
                "is_featured": pkg.is_featured,
                "stripe_price_id": pkg.stripe_price_id
            }
            for pkg in packages
        ]
    
    def _find_package_for_credits(self, credits: int) -> Optional[CreditPackage]:
        """Find a package that matches the requested credit amount"""
        package = self.db.query(CreditPackage).filter(
            and_(
                CreditPackage.credit_amount == credits,
                CreditPackage.is_active == True
            )
        ).first()
        
        return package
    
    def _update_app_credit_usage(self, user_id: int, app_id: int, 
                                credits_consumed: int, credits_purchased: int):
        """Update app credit usage statistics"""
        
        usage = self.db.query(AppCreditUsage).filter(
            and_(
                AppCreditUsage.user_id == user_id,
                AppCreditUsage.app_id == app_id
            )
        ).first()
        
        if usage:
            usage.credits_consumed += credits_consumed
            usage.credits_purchased += credits_purchased
            
            if credits_consumed > 0:
                usage.last_consumption = datetime.utcnow()
            if credits_purchased > 0:
                usage.last_purchase = datetime.utcnow()
        else:
            # This shouldn't happen as it should be created during authentication
            logger.warning(f"App credit usage record not found for user {user_id} in app {app_id}")
    
    def handle_credit_purchase_webhook(self, session_id: str, app_id: str, 
                                     credits: int, user_id: int) -> bool:
        """Handle successful credit purchase from Stripe webhook"""
        
        try:
            # Get user
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.error(f"User {user_id} not found for credit purchase webhook")
                return False
            
            # Add credits to user
            user.credits += credits
            
            # Create credit transaction
            transaction = CreditTransaction(
                user_id=user.id,
                amount=credits,
                transaction_type="purchase",
                description=f"Credits purchased through cross-app integration (App: {app_id})",
                metadata={
                    "app_id": app_id,
                    "cross_app": True,
                    "stripe_session_id": session_id,
                    "webhook": True
                }
            )
            
            # Update app credit usage
            self._update_app_credit_usage(user.id, app_id, 0, credits)
            
            # Commit changes
            self.db.add(transaction)
            self.db.commit()
            
            logger.info(f"Successfully processed credit purchase webhook: {credits} credits for user {user_id} in app {app_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing credit purchase webhook: {str(e)}")
            self.db.rollback()
            return False
