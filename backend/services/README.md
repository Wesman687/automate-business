# Credit System SDK

A comprehensive SDK for integrating the credit system into other applications and services.

## 🚀 Quick Start

```python
from services import consume_credits, quick_credit_check

# Simple credit consumption
@consume_credits(5, "AI Chat Service")
def chat_with_ai(user_id: int, message: str):
    return ai_service.chat(message)

# Quick credit check
if quick_credit_check(user_id, 10):
    # User can afford 10 credits
    result = execute_service()
```

## 📚 Core Components

### 1. CreditClient
The main client for credit system operations.

```python
from services import CreditClient

# Initialize client
with CreditClient() as client:
    # Check balance
    balance = client.get_user_balance(user_id)
    
    # Consume credits
    client.consume_credits(user_id, 5, "Service Description")
    
    # Add credits
    client.add_credits(user_id, 100, "Credit Purchase")
```

### 2. Decorators
Easy-to-use decorators for automatic credit management.

#### @consume_credits
Automatically consumes credits before service execution.

```python
@consume_credits(5, "AI Chat Service")
def chat_with_ai(user_id: int, message: str):
    # 5 credits automatically consumed before execution
    return ai_service.chat(message)
```

#### @require_credits
Checks if user has enough credits without consuming them.

```python
@require_credits(10, "Premium Service")
def premium_service(user_id: int, data: dict):
    # Only checks credit availability
    return process_data(data)
```

#### @credit_aware
Provides credit information to the function.

```python
@credit_aware(5, "Service Description")
def my_service(user_id: int, data: dict, credit_info: dict):
    print(f"User has {credit_info['current_balance']} credits")
    print(f"This service costs {credit_info['credits']} credits")
    return process_data(data)
```

### 3. Dynamic Credit Calculation
For services with variable credit costs.

```python
@ai_chat_credits('message')
def smart_chat(user_id: int, message: str):
    # Credits calculated based on message length (1 per 100 chars)
    return ai_service.chat(message)

@file_processing_credits('file_size')
def process_file(user_id: int, file_size: int):
    # Credits calculated based on file size (1 per MB)
    return file_processor.process(file_size)
```

## 🔧 Integration Patterns

### Pattern 1: Simple Service (Recommended)
```python
@consume_credits(5, "AI Chat Service")
def chat_with_ai(user_id: int, message: str):
    return ai_service.chat(message)
```

### Pattern 2: Complex Service with Manual Control
```python
def complex_service(user_id: int, data: dict):
    # Calculate credits needed
    credits_needed = calculate_credits(data)
    
    with CreditClient() as client:
        if not client.can_afford(user_id, credits_needed):
            raise InsufficientCreditsError("Not enough credits")
        
        # Execute service
        result = execute_service(data)
        
        # Consume credits only if successful
        client.consume_credits(user_id, credits_needed, "Complex Service")
        
        return result
```

### Pattern 3: Batch Operations
```python
def process_multiple_files(user_id: int, files: list):
    # Calculate total credits
    total_credits = sum(calculate_file_credits(f) for f in files)
    
    # Check if user can afford entire batch
    if not quick_credit_check(user_id, total_credits):
        raise Exception("Not enough credits for batch")
    
    try:
        # Process all files
        results = [process_file(f) for f in files]
        
        # Consume credits for entire batch
        quick_credit_consumption(user_id, total_credits, "Batch Processing")
        
        return results
    except Exception:
        # If any file fails, no credits are consumed
        raise
```

## 📊 Credit Calculation Examples

### AI Services
- **Chat**: 1 credit per 100 characters
- **Analysis**: 1 credit per 1KB of data
- **Generation**: 2 credits per 100 characters generated

### File Processing
- **Upload**: 2 credits per file
- **Processing**: 1 credit per MB
- **Conversion**: 3 credits per file

### Workflow Execution
- **Simple**: 1 credit per 5 steps
- **Complex**: 1 credit per step
- **AI-powered**: 2 credits per AI step

## 🛡️ Error Handling

The SDK provides comprehensive error handling:

```python
from services import InsufficientCreditsError

try:
    @consume_credits(5, "Service")
    def my_service(user_id: int):
        return execute_service()
except InsufficientCreditsError as e:
    # Handle insufficient credits
    print(f"Not enough credits: {e}")
except Exception as e:
    # Handle other errors
    print(f"Service error: {e}")
```

## 🔍 Monitoring and Analytics

```python
from services import get_user_credit_status

# Get comprehensive credit status
status = get_user_credit_status(user_id)
print(f"Balance: {status['balance']}")
print(f"Monthly usage: {status['summary']['monthly_spent']}")
print(f"Monthly cost: ${status['summary']['monthly_cost']:.2f}")
```

## 📋 Best Practices

1. **Use decorators for simple services** - They handle everything automatically
2. **Use manual control for complex services** - Gives you full control over when credits are consumed
3. **Always handle insufficient credits gracefully** - Provide clear error messages and suggestions
4. **Include meaningful descriptions** - Helps with tracking and debugging
5. **Use batch operations when possible** - Reduces transaction overhead
6. **Monitor credit usage** - Helps improve user experience

## 🚀 Getting Started

1. **Import the SDK**:
   ```python
   from services import consume_credits, CreditClient
   ```

2. **Add decorator to your service**:
   ```python
   @consume_credits(5, "Your Service")
   def your_service(user_id: int, data: dict):
       return process_data(data)
   ```

3. **Test the integration**:
   ```python
   # This will automatically handle credits
   result = your_service(user_id=123, data={'key': 'value'})
   ```

## 📞 Support

For questions or issues with the credit system SDK:
- Check the examples in `credit_integration_examples.py`
- Review the decorator documentation
- Test with the provided example services

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- Core client, decorators, and examples
- Support for fixed and dynamic credit consumption
- Comprehensive error handling and monitoring
