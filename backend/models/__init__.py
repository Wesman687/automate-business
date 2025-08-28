# Models package initialization
# This file makes the models directory a Python package

# Import all models to ensure they are registered with SQLAlchemy
from .user_models import *
from .payment_models import *
from .credit_models import *
from .credit_transaction_models import *
from .automation_models import *
from .file_models import *
from .cross_app_models import *
from .email_account import *
from .stripe_models import *

# Re-export commonly used models
__all__ = [
    # User models
    'User',
    'UserType',
    'UserStatus',
    'PortalInvite',
    'ChatSession',
    'ChatMessage',
    'Admin',
    
    # Payment models
    'Invoice',
    'InvoiceStatus',
    'RecurringPayment',
    'PaymentStatus',
    'TimeEntry',
    
    # Credit models
    'CreditPackage',
    'UserSubscription', 
    'CreditDispute',
    'CreditPromotion',
    'CreditTransaction',
    'TransactionType',
    'TransactionStatus',
    
    # Automation models
    'Job',
    'JobStatus',
    'JobPriority',
    'CustomerChangeRequest',
    'Video',
    'Appointment',
    'AppointmentStatus',
    
    # File models
    'FileUpload',
    
    # Cross-app models
    'AppIntegration',
    'CrossAppSession',
    'AppCreditUsage',
    'AppStatus',
    'CrossAppSessionStatus',
    'AppPermission',
    
    # Email models
    'EmailAccount',
    
    # Stripe models
    'StripeCustomer',
    'StripeSubscription',
    'StripePaymentIntent',
    'StripePaymentMethod',
    'StripeWebhookEvent',
    'StripeProduct'
]
