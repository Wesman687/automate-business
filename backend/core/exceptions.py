class BaseException(Exception):
    """Base exception for the application"""
    pass

class UserNotFoundError(BaseException):
    """Raised when a user is not found"""
    pass

class InsufficientCreditsError(BaseException):
    """Raised when user doesn't have enough credits"""
    pass

class CreditServiceError(BaseException):
    """Raised when there's an error with the credit service"""
    pass

class InvalidAmountError(BaseException):
    """Raised when an invalid amount is provided"""
    pass

class TransactionError(BaseException):
    """Raised when there's an error with a transaction"""
    pass

class SubscriptionError(BaseException):
    """Raised when there's an error with subscriptions"""
    pass

class DisputeError(BaseException):
    """Raised when there's an error with disputes"""
    pass

class StripeError(BaseException):
    """Raised when there's an error with Stripe operations"""
    pass

class ValidationError(BaseException):
    """Raised when validation fails"""
    pass

class AuthenticationError(BaseException):
    """Raised when authentication fails"""
    pass

class AuthorizationError(BaseException):
    """Raised when user doesn't have permission"""
    pass
