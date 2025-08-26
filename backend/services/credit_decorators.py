#!/usr/bin/env python3
"""
Credit System Decorators - Easy integration for other services

These decorators allow services to automatically handle credit consumption
without modifying their core logic.
"""

import functools
import logging
from typing import Callable, Optional, Dict, Any, Union
from .credit_client import CreditClient, InsufficientCreditsError

logger = logging.getLogger(__name__)


def consume_credits(
    credits: int,
    description: str,
    user_id_param: str = 'user_id',
    metadata_param: Optional[str] = None,
    fail_silently: bool = False
):
    """
    Decorator to consume credits before executing a service.
    
    Args:
        credits: Number of credits to consume
        description: Description of what the credits are for
        user_id_param: Name of the parameter containing user_id
        metadata_param: Optional name of parameter containing metadata
        fail_silently: If True, continue execution even if credits fail
        
    Usage:
        @consume_credits(5, "AI Chat Service")
        def chat_with_ai(user_id: int, message: str):
            # This will automatically consume 5 credits before execution
            return ai_service.chat(message)
            
        @consume_credits(10, "File Processing", metadata_param='file_info')
        def process_file(user_id: int, file_info: dict):
            # This will consume 10 credits and include file_info as metadata
            return file_processor.process(file_info)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract user_id from parameters
            if user_id_param in kwargs:
                user_id = kwargs[user_id_param]
            elif user_id_param in func.__code__.co_varnames:
                param_index = func.__code__.co_varnames.index(user_id_param)
                if param_index < len(args):
                    user_id = args[param_index]
                else:
                    raise ValueError(f"user_id parameter '{user_id_param}' not found")
            else:
                raise ValueError(f"user_id parameter '{user_id_param}' not found in function signature")
            
            # Extract metadata if specified
            metadata = None
            if metadata_param and metadata_param in kwargs:
                metadata = kwargs[metadata_param]
            
            # Consume credits
            try:
                with CreditClient() as client:
                    client.consume_credits(user_id, credits, description, metadata)
                    logger.info(f"Consumed {credits} credits from user {user_id} for {description}")
            except InsufficientCreditsError as e:
                if fail_silently:
                    logger.warning(f"Credit consumption failed for user {user_id}: {e}")
                else:
                    raise e
            except Exception as e:
                if fail_silently:
                    logger.error(f"Credit consumption error for user {user_id}: {e}")
                else:
                    raise e
            
            # Execute the original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def require_credits(
    credits: int,
    description: str,
    user_id_param: str = 'user_id'
):
    """
    Decorator to check if user has enough credits before execution.
    Does not consume credits - just validates availability.
    
    Args:
        credits: Number of credits required
        description: Description of what the credits are for
        user_id_param: Name of the parameter containing user_id
        
    Usage:
        @require_credits(5, "AI Chat Service")
        def chat_with_ai(user_id: int, message: str):
            # This will check if user has 5 credits before execution
            return ai_service.chat(message)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract user_id from parameters
            if user_id_param in kwargs:
                user_id = kwargs[user_id_param]
            elif user_id_param in func.__code__.co_varnames:
                param_index = func.__code__.co_varnames.index(user_id_param)
                if param_index < len(args):
                    user_id = args[param_index]
                else:
                    raise ValueError(f"user_id parameter '{user_id_param}' not found")
            else:
                raise ValueError(f"user_id parameter '{user_id_param}' not found in function signature")
            
            # Check if user can afford
            with CreditClient() as client:
                if not client.can_afford(user_id, credits):
                    raise InsufficientCreditsError(
                        f"User {user_id} doesn't have enough credits for {description}. "
                        f"Required: {credits}, Available: {client.get_user_balance(user_id)}"
                    )
            
            # Execute the original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def credit_aware(
    credits: int,
    description: str,
    user_id_param: str = 'user_id',
    metadata_param: Optional[str] = None
):
    """
    Decorator that provides credit information to the function.
    The function receives credit_info as a keyword argument.
    
    Args:
        credits: Number of credits that will be consumed
        description: Description of what the credits are for
        user_id_param: Name of the parameter containing user_id
        metadata_param: Optional name of parameter containing metadata
        
    Usage:
        @credit_aware(5, "AI Chat Service")
        def chat_with_ai(user_id: int, message: str, credit_info: dict):
            # credit_info contains: {'credits': 5, 'description': 'AI Chat Service', 'user_id': 123}
            print(f"About to consume {credit_info['credits']} credits")
            return ai_service.chat(message)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract user_id from parameters
            if user_id_param in kwargs:
                user_id = kwargs[user_id_param]
            elif user_id_param in func.__code__.co_varnames:
                param_index = func.__code__.co_varnames.index(user_id_param)
                if param_index < len(args):
                    user_id = args[param_index]
                else:
                    raise ValueError(f"user_id parameter '{user_id_param}' not found")
            else:
                raise ValueError(f"user_id parameter '{user_id_param}' not found in function signature")
            
            # Create credit info
            credit_info = {
                'credits': credits,
                'description': description,
                'user_id': user_id,
                'can_afford': False,
                'current_balance': 0
            }
            
            # Check credit status
            with CreditClient() as client:
                credit_info['can_afford'] = client.can_afford(user_id, credits)
                credit_info['current_balance'] = client.get_user_balance(user_id)
            
            # Add credit_info to kwargs
            kwargs['credit_info'] = credit_info
            
            # Execute the original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def batch_credit_consumption(
    credit_calculator: Callable,
    description_template: str,
    user_id_param: str = 'user_id'
):
    """
    Decorator for services that consume credits based on dynamic calculation.
    
    Args:
        credit_calculator: Function that calculates credits needed
        description_template: Template for description (use {credits} placeholder)
        user_id_param: Name of the parameter containing user_id
        
    Usage:
        def calculate_chat_credits(message_length: int) -> int:
            return max(1, message_length // 100)  # 1 credit per 100 characters
            
        @batch_credit_consumption(calculate_chat_credits, "AI Chat ({credits} credits)")
        def chat_with_ai(user_id: int, message: str):
            # Credits will be calculated based on message length
            return ai_service.chat(message)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract user_id from parameters
            if user_id_param in kwargs:
                user_id = kwargs[user_id_param]
            elif user_id_param in func.__code__.co_varnames:
                param_index = func.__code__.co_varnames.index(user_id_param)
                if param_index < len(args):
                    user_id = args[param_index]
                else:
                    raise ValueError(f"user_id parameter '{user_id_param}' not found")
            else:
                raise ValueError(f"user_id parameter '{user_id_param}' not found in function signature")
            
            # Calculate credits needed
            credits_needed = credit_calculator(*args, **kwargs)
            description = description_template.format(credits=credits_needed)
            
            # Consume credits
            with CreditClient() as client:
                client.consume_credits(user_id, credits_needed, description)
                logger.info(f"Consumed {credits_needed} credits from user {user_id} for {description}")
            
            # Execute the original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


# Example usage decorators for common services
def ai_chat_credits(message_param: str = 'message'):
    """
    Decorator specifically for AI chat services.
    Consumes credits based on message length.
    """
    def calculate_credits(*args, **kwargs):
        message = kwargs.get(message_param) or args[0] if args else ""
        return max(1, len(message) // 100)  # 1 credit per 100 characters
    
    return batch_credit_consumption(
        calculate_credits,
        "AI Chat Service ({credits} credits)",
        'user_id'
    )


def file_processing_credits(file_size_param: str = 'file_size'):
    """
    Decorator specifically for file processing services.
    Consumes credits based on file size.
    """
    def calculate_credits(*args, **kwargs):
        file_size = kwargs.get(file_size_param) or args[0] if args else 0
        return max(1, file_size // (1024 * 1024))  # 1 credit per MB
    
    return batch_credit_consumption(
        calculate_credits,
        "File Processing ({credits} credits)",
        'user_id'
    )


def workflow_execution_credits(steps_param: str = 'steps'):
    """
    Decorator specifically for workflow execution services.
    Consumes credits based on number of steps.
    """
    def calculate_credits(*args, **kwargs):
        steps = kwargs.get(steps_param) or args[0] if args else 1
        return max(1, steps // 5)  # 1 credit per 5 steps
    
    return batch_credit_consumption(
        calculate_credits,
        "Workflow Execution ({credits} credits)",
        'user_id'
    )
