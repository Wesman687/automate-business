# Models package initialization
# This file makes the models directory a Python package

# Import all models to ensure they are registered with SQLAlchemy
from .credit_models import *
from .cross_app_models import *
from .email_account import *

# Re-export commonly used models
__all__ = [
    # Credit models
    'CreditPackage',
    'UserSubscription', 
    'CreditDispute',
    'CreditPromotion',
    
    # Cross-app models
    'AppIntegration',
    'CrossAppSession',
    'AppCreditUsage',
    'AppStatus',
    'CrossAppSessionStatus',
    'AppPermission',
    
    # Email models
    'EmailAccount'
]
