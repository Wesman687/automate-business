# Credit System SDK - Simple Integration Guide

**Just copy `credit_sdk.py` to your project and you're ready to go!**

## 🚀 **Quick Start (2 minutes)**

1. **Copy the file**: `credit_sdk.py` → your project
2. **Install dependency**: `pip install sqlalchemy psycopg2-binary`
3. **Add decorator**: `@consume_credits(5, "Your Service")`
4. **Done!** Credits are automatically handled

## 📝 **Usage Examples**

### **Example 1: AI Chat Service**
```python
from credit_sdk import consume_credits

@consume_credits(5, "AI Chat Service")
def chat_with_ai(user_id: int, message: str):
    return ai_service.chat(message)

# Usage - credits automatically consumed!
result = chat_with_ai(user_id=123, message="Hello AI!")
```

### **Example 2: File Processing**
```python
from credit_sdk import consume_credits

@consume_credits(10, "File Processing")
def process_file(user_id: int, file_path: str):
    return file_processor.process(file_path)

# Usage - 10 credits automatically consumed!
result = process_file(user_id=123, file_path="data.csv")
```

### **Example 3: Manual Control**
```python
from credit_sdk import CreditSDK

def complex_service(user_id: int, data: dict):
    credit_sdk = CreditSDK("YOUR_DATABASE_URL")
    
    if credit_sdk.can_afford(user_id, 20):
        result = execute_service(data)
        credit_sdk.consume_credits(user_id, 20, "Complex Service")
        return result
    else:
        raise Exception("Not enough credits")
```

## 🔧 **Setup**

### **1. Copy the file**
```bash
cp credit_sdk.py your-project/
```

### **2. Install dependencies**
```bash
pip install sqlalchemy psycopg2-binary
```

### **3. Update database URL**
In `credit_sdk.py`, change:
```python
credit_sdk = CreditSDK("YOUR_DATABASE_URL_HERE")
```
To:
```python
credit_sdk = CreditSDK("postgresql://user:pass@localhost/your_db")
```

### **4. Use decorators**
```python
@consume_credits(5, "Your Service")
def your_service(user_id: int, data: dict):
    return process_data(data)
```

## 🎯 **Available Decorators**

| Decorator | What it does | Best for |
|-----------|--------------|-----------|
| `@consume_credits(5, "Service")` | Consumes credits before execution | Most services |
| `@require_credits(5, "Service")` | Checks credits without consuming | Pre-execution validation |

## 📊 **Credit Guidelines**

- **AI Chat**: 5 credits per message
- **File Processing**: 10 credits per file
- **Data Analysis**: 20 credits per analysis
- **Workflow Execution**: 15 credits per workflow

## 🛡️ **Error Handling**

```python
try:
    result = your_service(user_id, data)
except Exception as e:
    if "Not enough credits" in str(e):
        return {"error": "insufficient_credits", "message": "Please buy more credits"}
    else:
        return {"error": "service_error", "message": str(e)}
```

## 🔍 **Check Credit Balance**

```python
from credit_sdk import CreditSDK

credit_sdk = CreditSDK("YOUR_DATABASE_URL")
balance = credit_sdk.get_balance(user_id)
print(f"User has {balance} credits")
```

## 📋 **What You Get**

✅ **Automatic credit consumption** - Just add decorators  
✅ **Credit validation** - Users can't use services without credits  
✅ **Transaction logging** - Every credit usage is tracked  
✅ **Error handling** - Graceful handling of insufficient credits  
✅ **Simple integration** - One file, minimal setup  

## 🚨 **Important Notes**

1. **Database URL**: Update `YOUR_DATABASE_URL_HERE` in the decorators
2. **User ID**: Your functions must accept `user_id` as first parameter
3. **Dependencies**: Only needs `sqlalchemy` and `psycopg2-binary`
4. **Database**: Must have `credits_transactions` table with columns: `user_id`, `amount`, `description`, `transaction_type`, `transaction_metadata`, `created_at`

## 🎉 **That's it!**

Copy `credit_sdk.py`, add decorators to your functions, and credits are automatically handled. No complex setup, no multiple files - just one file that does everything!

---

**Questions?** Check the examples in the file or ask in the repository!
