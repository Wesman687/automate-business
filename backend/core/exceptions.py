"""
Core exception classes for the application
"""

class InsufficientCreditsError(Exception):
    """Raised when a user doesn't have enough credits for an operation"""
    pass

class UserNotFoundError(Exception):
    """Raised when a user cannot be found"""
    pass

class CreditServiceError(Exception):
    """Raised when there's an error in the credit service"""
    pass

class TransactionError(Exception):
    """Raised when there's an error in a transaction"""
    pass

class InvalidAmountError(Exception):
    """Raised when an invalid amount is provided"""
    pass

class DisputeError(Exception):
    """Raised when there's an error with disputes"""
    pass

class ValidationError(Exception):
    """Raised when validation fails"""
    pass
