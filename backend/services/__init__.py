# Credit System SDK - Easy integration for other applications

from .credit_client import (
    CreditClient,
    quick_credit_check,
    quick_credit_consumption,
    get_user_credit_status
)

from .credit_decorators import (
    consume_credits,
    require_credits,
    credit_aware,
    batch_credit_consumption,
    ai_chat_credits,
    file_processing_credits,
    workflow_execution_credits
)

from .credit_integration_examples import (
    AIChatService,
    FileProcessingService,
    WorkflowExecutionService,
    ManualCreditService,
    BatchProcessingService,
    CreditMonitoringService
)

# Main SDK exports
__all__ = [
    # Core client
    'CreditClient',
    
    # Quick functions
    'quick_credit_check',
    'quick_credit_consumption',
    'get_user_credit_status',
    
    # Decorators
    'consume_credits',
    'require_credits',
    'credit_aware',
    'batch_credit_consumption',
    'ai_chat_credits',
    'file_processing_credits',
    'workflow_execution_credits',
    
    # Example services
    'AIChatService',
    'FileProcessingService',
    'WorkflowExecutionService',
    'ManualCreditService',
    'BatchProcessingService',
    'CreditMonitoringService'
]

# Version info
__version__ = "1.0.0"
__author__ = "Atuomate Team"
__description__ = "Credit System SDK for easy integration with automation services"
