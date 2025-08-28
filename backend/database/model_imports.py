"""
Model imports file to ensure all models are loaded in the correct order.
This file should be imported after all individual model files are defined.
"""

# Import base models first
from .models import (
    Base,
    User,
    PortalInvite,
    ChatSession,
    ChatMessage,
    Admin,
    Appointment,
    CustomerChangeRequest,
    Invoice,
    RecurringPayment,
    Job,
    TimeEntry,
    FileUpload,
    CreditTransaction,
    Video,
    StripeCustomer
)

# Import credit models
from ..models.credit_models import (
    CreditPackage,
    UserSubscription,
    CreditDispute,
    CreditPromotion
)

# Import cross-app models
from ..models.cross_app_models import (
    AppIntegration,
    CrossAppSession,
    AppCreditUsage
)

# Import email models
from ..models.email_account import EmailAccount

# Export all models
__all__ = [
    # Base models
    'Base',
    'User',
    'PortalInvite',
    'ChatSession',
    'ChatMessage',
    'Admin',
    'Appointment',
    'CustomerChangeRequest',
    'Invoice',
    'RecurringPayment',
    'Job',
    'TimeEntry',
    'FileUpload',
    'CreditTransaction',
    'Video',
    'StripeCustomer',
    
    # Credit models
    'CreditPackage',
    'UserSubscription',
    'CreditDispute',
    'CreditPromotion',
    
    # Cross-app models
    'AppIntegration',
    'CrossAppSession',
    'AppCreditUsage',
    
    # Email models
    'EmailAccount'
]
