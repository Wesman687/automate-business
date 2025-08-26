#!/usr/bin/env python3
"""
Credit System Integration Examples

This file shows how other applications and services can integrate
with the credit system using the SDK and decorators.
"""

from typing import Dict, Any, List
from .credit_client import CreditClient, quick_credit_check, quick_credit_consumption
from .credit_decorators import (
    consume_credits, 
    require_credits, 
    credit_aware, 
    ai_chat_credits,
    file_processing_credits,
    workflow_execution_credits
)


# ============================================================================
# EXAMPLE 1: AI Chat Service Integration
# ============================================================================

class AIChatService:
    """Example AI Chat service that integrates with the credit system."""
    
    @consume_credits(5, "AI Chat Service")
    def chat_with_ai(self, user_id: int, message: str) -> str:
        """
        Chat with AI - automatically consumes 5 credits.
        
        The @consume_credits decorator handles:
        - Checking if user has enough credits
        - Consuming credits before execution
        - Logging the transaction
        - Rolling back if execution fails
        """
        # Your AI logic here
        ai_response = f"AI Response to: {message}"
        return ai_response
    
    @ai_chat_credits('message')
    def smart_chat_with_ai(self, user_id: int, message: str) -> str:
        """
        Smart AI Chat - credits based on message length.
        
        The @ai_chat_credits decorator:
        - Calculates credits based on message length (1 credit per 100 chars)
        - Automatically consumes the calculated credits
        - Provides dynamic credit consumption
        """
        # Your AI logic here
        ai_response = f"Smart AI Response to: {message}"
        return ai_response
    
    @require_credits(10, "AI Chat Service")
    def premium_chat_with_ai(self, user_id: int, message: str) -> str:
        """
        Premium AI Chat - checks credits but doesn't consume them.
        
        The @require_credits decorator:
        - Only checks if user has enough credits
        - Does NOT consume credits
        - Useful for services that need credit validation but handle consumption separately
        """
        # Your AI logic here
        ai_response = f"Premium AI Response to: {message}"
        
        # You might consume credits here based on some condition
        if len(message) > 1000:
            with CreditClient() as client:
                client.consume_credits(user_id, 5, "Premium AI Chat - Long Message")
        
        return ai_response


# ============================================================================
# EXAMPLE 2: File Processing Service Integration
# ============================================================================

class FileProcessingService:
    """Example file processing service that integrates with the credit system."""
    
    @file_processing_credits('file_size')
    def process_file(self, user_id: int, file_path: str, file_size: int) -> Dict[str, Any]:
        """
        Process a file - credits based on file size.
        
        The @file_processing_credits decorator:
        - Calculates credits based on file size (1 credit per MB)
        - Automatically consumes the calculated credits
        - Provides file-specific credit consumption
        """
        # Your file processing logic here
        result = {
            'status': 'processed',
            'file_path': file_path,
            'file_size': file_size,
            'processing_time': '2.5s'
        }
        return result
    
    @consume_credits(2, "File Upload")
    def upload_file(self, user_id: int, file_path: str, metadata: Dict[str, Any]) -> str:
        """
        Upload a file - fixed credit consumption.
        
        The @consume_credits decorator:
        - Consumes exactly 2 credits
        - Includes metadata in the transaction
        - Handles credit validation automatically
        """
        # Your file upload logic here
        file_id = f"file_{user_id}_{hash(file_path)}"
        return file_id


# ============================================================================
# EXAMPLE 3: Workflow Execution Service Integration
# ============================================================================

class WorkflowExecutionService:
    """Example workflow execution service that integrates with the credit system."""
    
    @workflow_execution_credits('steps')
    def execute_workflow(self, user_id: int, workflow_id: str, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute a workflow - credits based on number of steps.
        
        The @workflow_execution_credits decorator:
        - Calculates credits based on workflow complexity (1 credit per 5 steps)
        - Automatically consumes the calculated credits
        - Provides workflow-specific credit consumption
        """
        # Your workflow execution logic here
        result = {
            'workflow_id': workflow_id,
            'steps_executed': len(steps),
            'status': 'completed',
            'execution_time': '15.2s'
        }
        return result
    
    @credit_aware(5, "Workflow Validation")
    def validate_workflow(self, user_id: int, workflow_data: Dict[str, Any], credit_info: Dict[str, Any]) -> bool:
        """
        Validate a workflow - provides credit information.
        
        The @credit_aware decorator:
        - Provides credit information to the function
        - Does NOT consume credits
        - Useful for services that need to know about credit status
        """
        # You can access credit information
        print(f"User {credit_info['user_id']} has {credit_info['current_balance']} credits")
        print(f"This validation would cost {credit_info['credits']} credits")
        
        # Your validation logic here
        is_valid = len(workflow_data.get('steps', [])) > 0
        return is_valid


# ============================================================================
# EXAMPLE 4: Manual Credit Management
# ============================================================================

class ManualCreditService:
    """Example service that manually manages credits for complex scenarios."""
    
    def complex_ai_analysis(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complex AI analysis with manual credit management.
        
        This approach gives you full control over:
        - When credits are consumed
        - How many credits are consumed
        - Error handling and rollback
        """
        try:
            # Calculate credits needed based on data complexity
            data_size = len(str(data))
            complexity_score = data.get('complexity', 1)
            credits_needed = max(1, (data_size // 1000) * complexity_score)
            
            # Check if user can afford
            with CreditClient() as client:
                if not client.can_afford(user_id, credits_needed):
                    raise Exception(f"Not enough credits. Need: {credits_needed}")
                
                # Start the analysis
                analysis_result = self._perform_analysis(data)
                
                # If analysis succeeds, consume credits
                client.consume_credits(
                    user_id, 
                    credits_needed, 
                    "Complex AI Analysis",
                    {
                        'data_size': data_size,
                        'complexity_score': complexity_score,
                        'analysis_type': 'complex'
                    }
                )
                
                return analysis_result
                
        except Exception as e:
            # Handle errors and potentially rollback credits
            print(f"Analysis failed: {e}")
            raise
    
    def _perform_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform the actual AI analysis."""
        # Your AI analysis logic here
        return {
            'status': 'completed',
            'insights': ['insight1', 'insight2'],
            'confidence': 0.95
        }


# ============================================================================
# EXAMPLE 5: Batch Operations with Credit Management
# ============================================================================

class BatchProcessingService:
    """Example service for batch operations with credit management."""
    
    def process_multiple_files(self, user_id: int, files: List[Dict[str, Any]]) -> List[str]:
        """
        Process multiple files with batch credit management.
        
        This approach:
        - Calculates total credits needed upfront
        - Validates user can afford the entire batch
        - Processes all files or none
        - Provides atomic credit consumption
        """
        # Calculate total credits needed
        total_credits = sum(max(1, file['size'] // (1024 * 1024)) for file in files)
        
        # Check if user can afford the entire batch
        if not quick_credit_check(user_id, total_credits):
            raise Exception(f"Not enough credits for batch. Need: {total_credits}")
        
        try:
            results = []
            
            # Process each file
            for file in files:
                file_result = self._process_single_file(file)
                results.append(file_result)
            
            # If all files processed successfully, consume credits
            quick_credit_consumption(
                user_id, 
                total_credits, 
                f"Batch File Processing ({len(files)} files)",
                {'file_count': len(files), 'total_size': sum(f['size'] for f in files)}
            )
            
            return results
            
        except Exception as e:
            # If any file fails, no credits are consumed
            print(f"Batch processing failed: {e}")
            raise
    
    def _process_single_file(self, file: Dict[str, Any]) -> str:
        """Process a single file."""
        # Your file processing logic here
        return f"processed_{file['name']}"


# ============================================================================
# EXAMPLE 6: Credit Status Monitoring
# ============================================================================

class CreditMonitoringService:
    """Example service for monitoring credit usage and status."""
    
    def get_user_credit_status(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive credit status for a user."""
        from .credit_client import get_user_credit_status
        return get_user_credit_status(user_id)
    
    def monitor_credit_usage(self, user_id: int, service_name: str) -> Dict[str, Any]:
        """
        Monitor credit usage for a specific service.
        
        This approach:
        - Provides real-time credit status
        - Helps with user experience decisions
        - Enables proactive credit management
        """
        with CreditClient() as client:
            balance = client.get_user_balance(user_id)
            summary = client.get_credit_summary(user_id)
            
            # Determine if user needs credit warning
            low_credit_warning = balance < 50
            critical_credit_warning = balance < 10
            
            return {
                'current_balance': balance,
                'low_credit_warning': low_credit_warning,
                'critical_credit_warning': critical_credit_warning,
                'monthly_usage': summary.get('monthly_spent', 0),
                'monthly_cost': summary.get('monthly_cost', 0),
                'can_afford_common_services': {
                    'ai_chat': client.can_afford(user_id, 5),
                    'file_processing': client.can_afford(user_id, 10),
                    'workflow_execution': client.can_afford(user_id, 20)
                }
            }


# ============================================================================
# USAGE PATTERNS SUMMARY
# ============================================================================

"""
CREDIT SYSTEM INTEGRATION PATTERNS:

1. AUTOMATIC CONSUMPTION (Recommended for most cases):
   @consume_credits(5, "Service Description")
   def my_service(user_id: int, ...):
       # Credits automatically consumed before execution
       pass

2. DYNAMIC CONSUMPTION (For variable credit costs):
   @ai_chat_credits('message')
   def chat_service(user_id: int, message: str):
       # Credits calculated and consumed based on message length
       pass

3. CREDIT VALIDATION ONLY (For complex scenarios):
   @require_credits(10, "Service Description")
   def my_service(user_id: int, ...):
       # Only checks if user can afford, doesn't consume
       pass

4. MANUAL MANAGEMENT (For complex business logic):
   with CreditClient() as client:
       if client.can_afford(user_id, credits):
           result = execute_service()
           client.consume_credits(user_id, credits, "Description")
           return result

5. QUICK OPERATIONS (For simple checks):
   if quick_credit_check(user_id, 5):
       quick_credit_consumption(user_id, 5, "Service")
       return execute_service()

6. BATCH OPERATIONS (For multiple items):
   total_credits = calculate_total_credits(items)
   if quick_credit_check(user_id, total_credits):
       results = process_all_items(items)
       quick_credit_consumption(user_id, total_credits, "Batch Service")
       return results

BEST PRACTICES:
- Use decorators for simple, fixed-credit services
- Use manual management for complex, variable-credit services
- Always handle insufficient credits gracefully
- Include meaningful descriptions and metadata
- Use batch operations when possible to reduce transaction overhead
- Monitor credit usage for user experience improvements
"""
