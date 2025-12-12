# Whatnot Autoprint Integration Guide

This guide explains how to integrate the **Whatnot Autoprint** program with the Stream-line AI Automate platform's core services: **Database**, **Authentication Server**, and **Stripe Services**.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Integration](#database-integration)
4. [Authentication Server Integration](#authentication-server-integration)
5. [Stripe Services Integration](#stripe-services-integration)
6. [Complete Integration Example](#complete-integration-example)
7. [Production Checklist](#production-checklist)

---

## Overview

The Whatnot Autoprint program can leverage three core services from the Automate platform:

1. **Database**: PostgreSQL database with user management, credit system, and transaction tracking
2. **Authentication Server**: Cross-app authentication system for secure user access
3. **Stripe Services**: Payment processing for credit purchases and subscriptions

### Architecture Flow

```
Whatnot Autoprint App
    ↓
[Authentication] → Verify user credentials
    ↓
[Database] → Check credit balance, store transactions
    ↓
[Service Execution] → Process autoprint job
    ↓
[Database] → Deduct credits, log transaction
    ↓
[Stripe] → Handle payments if credits needed
```

---

## Prerequisites

### 1. Environment Setup

Ensure you have access to:
- **Database URL**: PostgreSQL connection string
- **API Base URL**: `https://api.stream-lineai.com` (or your API domain)
- **App Integration**: Registered app integration with API key (via admin panel)

### 2. Required Environment Variables

```bash
# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database

# API Configuration
API_BASE_URL=https://api.stream-lineai.com
APP_ID=your_app_id_here
API_KEY=your_api_key_here

# Stripe (if using direct Stripe integration)
STRIPE_SECRET_KEY=sk_test_xxx  # or sk_live_xxx for production
STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # or pk_live_xxx for production
```

### 3. Python Dependencies

```bash
pip install sqlalchemy psycopg2-binary requests stripe python-dotenv
```

---

## Database Integration

### Overview

The database uses PostgreSQL with SQLAlchemy ORM. Key tables include:
- `users` - User accounts and credit balances
- `credits_transactions` - Credit transaction history
- `app_integrations` - Cross-app integration records
- `stripe_customers` - Stripe customer data
- `stripe_subscriptions` - Subscription records

### Option 1: Using the Credit SDK (Recommended)

The simplest way to interact with the credit system is using the provided `CreditSDK`:

```python
from credit_sdk import CreditSDK
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize SDK
credit_sdk = CreditSDK(os.getenv("DATABASE_URL"))

# Check user's credit balance
user_id = 123
balance = credit_sdk.get_balance(user_id)
print(f"User has {balance} credits")

# Check if user can afford a service
if credit_sdk.can_afford(user_id, 5):
    # Execute your autoprint service
    result = process_autoprint_job(user_id, print_data)
    
    # Consume credits after successful execution
    credit_sdk.consume_credits(
        user_id=user_id,
        credits=5,
        description="Whatnot Autoprint Job",
        metadata={"job_id": result.job_id, "pages": result.page_count}
    )
else:
    raise Exception("Insufficient credits. Please purchase more credits.")

# Add credits (admin only, or via Stripe webhook)
credit_sdk.add_credits(
    user_id=user_id,
    credits=100,
    description="Credit purchase via Stripe",
    admin_id=None  # Set if admin is adding credits
)
```

### Option 2: Direct Database Access

For more control, you can access the database directly:

```python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

# Setup database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# Get user credit balance
def get_user_credits(user_id: int) -> int:
    with Session() as session:
        result = session.execute(
            text("""
                SELECT COALESCE(SUM(amount), 0) 
                FROM credits_transactions 
                WHERE user_id = :user_id
            """),
            {"user_id": user_id}
        )
        return int(result.scalar() or 0)

# Consume credits
def consume_credits(user_id: int, credits: int, description: str) -> bool:
    with Session() as session:
        # Check balance first
        balance = get_user_credits(user_id)
        if balance < credits:
            return False
        
        # Create transaction
        session.execute(
            text("""
                INSERT INTO credits_transactions 
                (user_id, amount, description, transaction_type, created_at)
                VALUES (:user_id, :amount, :description, 'service', NOW())
            """),
            {
                "user_id": user_id,
                "amount": -credits,  # Negative for consumption
                "description": description
            }
        )
        session.commit()
        return True
```

### Key Database Models

**User Model** (`users` table):
- `id` - Primary key
- `email` - User email
- `credits` - Current credit balance (cached, calculated from transactions)
- `user_type` - Type of user (customer, admin, etc.)
- `is_active` - Account status

**CreditTransaction Model** (`credits_transactions` table):
- `id` - Primary key
- `user_id` - Foreign key to users
- `amount` - Credit amount (positive for additions, negative for consumption)
- `description` - Transaction description
- `transaction_type` - Type: 'service', 'credit_addition', 'purchase', etc.
- `created_at` - Timestamp

---

## Authentication Server Integration

### Overview

The authentication server provides cross-app authentication using JWT tokens. Users authenticate once and can access multiple integrated apps.

### Step 1: Register Your App

Before using authentication, your app must be registered in the admin panel:

1. Go to `/admin/cross-app` (requires admin access)
2. Click "Add New App"
3. Fill in:
   - **App Name**: "Whatnot Autoprint"
   - **App Domain**: Your app's domain
   - **Permissions**: Select required permissions:
     - `read_user_info` - Read user information
     - `read_credits` - Check credit balance
     - `consume_credits` - Deduct credits for services
     - `purchase_credits` - Initiate credit purchases
4. Save the **App ID** and **API Key** provided

### Step 2: Authenticate Users

```python
import requests
import os

API_BASE_URL = os.getenv("API_BASE_URL", "https://api.stream-lineai.com")
APP_ID = os.getenv("APP_ID")
API_KEY = os.getenv("API_KEY")

def authenticate_user(email: str, password: str, app_user_id: str = None):
    """
    Authenticate a user for cross-app access.
    
    Args:
        email: User's email address
        password: User's password
        app_user_id: Optional app-specific user ID
    
    Returns:
        dict with session_token, user info, and permissions
    """
    response = requests.post(
        f"{API_BASE_URL}/api/cross-app/auth",
        json={
            "app_id": APP_ID,
            "email": email,
            "password": password,
            "app_user_id": app_user_id,
            "app_metadata": {
                "app_name": "Whatnot Autoprint",
                "version": "1.0.0"
            }
        },
        headers={
            "Content-Type": "application/json",
            "X-API-Key": API_KEY  # Optional, for additional security
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Authentication failed: {response.json().get('detail', 'Unknown error')}")

# Usage
try:
    auth_result = authenticate_user("user@example.com", "password123")
    session_token = auth_result["session_token"]
    user_info = auth_result["user"]
    permissions = auth_result["permissions"]
    
    print(f"Authenticated: {user_info['email']}")
    print(f"User ID: {user_info['user_id']}")
    print(f"Permissions: {permissions}")
    
except Exception as e:
    print(f"Authentication error: {e}")
```

### Step 3: Validate Session Token

```python
def validate_token(session_token: str):
    """Validate a session token and get user info"""
    response = requests.post(
        f"{API_BASE_URL}/api/cross-app/validate-token",
        json={
            "session_token": session_token,
            "app_id": APP_ID
        },
        headers={
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Usage
token_data = validate_token(session_token)
if token_data and token_data["valid"]:
    user_id = token_data["user"]["user_id"]
    # Proceed with service
else:
    # Token expired or invalid, re-authenticate
    pass
```

### Step 4: Check Credits via API

```python
def check_credits(session_token: str, required_credits: int = None):
    """Check user's credit balance via API"""
    response = requests.post(
        f"{API_BASE_URL}/api/cross-app/credits/check",
        json={
            "session_token": session_token,
            "app_id": APP_ID,
            "required_credits": required_credits
        },
        headers={
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to check credits: {response.json().get('detail')}")

# Usage
credit_info = check_credits(session_token, required_credits=5)
if credit_info["has_sufficient_credits"]:
    balance = credit_info["current_balance"]
    print(f"User has {balance} credits, sufficient for service")
else:
    print(f"Insufficient credits. Need {required_credits}, have {credit_info['current_balance']}")
```

### Step 5: Consume Credits via API

```python
def consume_credits_api(session_token: str, credits: int, service: str, description: str = None):
    """Consume credits via API"""
    response = requests.post(
        f"{API_BASE_URL}/api/cross-app/credits/consume",
        json={
            "session_token": session_token,
            "app_id": APP_ID,
            "credits": credits,
            "service": service,
            "description": description or f"{service} usage",
            "metadata": {
                "app_name": "Whatnot Autoprint"
            }
        },
        headers={
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to consume credits: {response.json().get('detail')}")

# Usage
try:
    result = consume_credits_api(
        session_token=session_token,
        credits=5,
        service="autoprint",
        description="Whatnot Autoprint Job #12345"
    )
    print(f"Credits consumed. New balance: {result['new_balance']}")
except Exception as e:
    print(f"Error: {e}")
```

---

## Stripe Services Integration

### Overview

Stripe integration handles payment processing for credit purchases. You can either:
1. **Use the API endpoints** (recommended) - Let the platform handle Stripe
2. **Direct Stripe integration** - Handle Stripe directly in your app

### Option 1: Using API Endpoints (Recommended)

This approach lets the platform handle all Stripe complexity:

```python
def create_checkout_session(user_id: int, price_id: str, success_url: str, cancel_url: str):
    """Create a Stripe checkout session via API"""
    response = requests.post(
        f"{API_BASE_URL}/api/stripe/create-checkout-session",
        json={
            "price_id": price_id,  # Stripe price ID (e.g., "price_1234567890")
            "success_url": success_url,  # Where to redirect after success
            "cancel_url": cancel_url,  # Where to redirect if cancelled
            "mode": "payment"  # or "subscription" for recurring
        },
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {session_token}"  # User's session token
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to create checkout: {response.json().get('detail')}")

# Usage
checkout = create_checkout_session(
    user_id=user_id,
    price_id="price_1234567890",  # Get from Stripe dashboard or API
    success_url="https://yourapp.com/payment/success",
    cancel_url="https://yourapp.com/payment/cancel"
)

# Redirect user to checkout URL
checkout_url = checkout["url"]
print(f"Redirect user to: {checkout_url}")
```

### Option 2: Direct Stripe Integration

For more control, integrate Stripe directly:

```python
import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_payment_intent(amount: int, currency: str = "usd", user_id: int = None):
    """Create a payment intent for credit purchase"""
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents (e.g., 2500 = $25.00)
            currency=currency,
            metadata={
                "user_id": str(user_id),
                "app_name": "Whatnot Autoprint"
            }
        )
        return intent
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")

def handle_webhook(payload: str, signature: str):
    """Handle Stripe webhook events"""
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
        
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            user_id = payment_intent["metadata"].get("user_id")
            amount = payment_intent["amount"]
            
            # Add credits to user account
            credits_to_add = amount // 100  # Convert cents to credits (1:1 ratio, adjust as needed)
            # Use credit_sdk or API to add credits
            credit_sdk.add_credits(
                user_id=int(user_id),
                credits=credits_to_add,
                description=f"Credit purchase via Stripe - Payment {payment_intent['id']}"
            )
            
        return {"status": "success"}
    except ValueError as e:
        raise Exception(f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        raise Exception(f"Invalid signature: {e}")
```

### Getting Available Products

```python
def get_available_products():
    """Get available credit packages/products"""
    response = requests.get(
        f"{API_BASE_URL}/api/stripe/products",
        headers={
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get products: {response.json().get('detail')}")

# Usage
products = get_available_products()
for product in products:
    print(f"{product['name']}: {product['description']}")
    for price in product.get('prices', []):
        print(f"  - ${price['amount']/100:.2f} for {price['credits']} credits")
```

---

## Complete Integration Example

Here's a complete example showing how to integrate all three services:

```python
"""
Whatnot Autoprint Service - Complete Integration Example
"""
import os
import requests
from credit_sdk import CreditSDK
from dotenv import load_dotenv

load_dotenv()

class WhatnotAutoprintService:
    def __init__(self):
        self.api_base = os.getenv("API_BASE_URL", "https://api.stream-lineai.com")
        self.app_id = os.getenv("APP_ID")
        self.api_key = os.getenv("API_KEY")
        self.credit_sdk = CreditSDK(os.getenv("DATABASE_URL"))
        self.session_token = None
        self.user_id = None
    
    def authenticate(self, email: str, password: str):
        """Authenticate user"""
        response = requests.post(
            f"{self.api_base}/api/cross-app/auth",
            json={
                "app_id": self.app_id,
                "email": email,
                "password": password,
                "app_metadata": {"app_name": "Whatnot Autoprint"}
            },
            headers={"Content-Type": "application/json", "X-API-Key": self.api_key}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.session_token = data["session_token"]
            self.user_id = data["user"]["user_id"]
            return True
        else:
            raise Exception(f"Authentication failed: {response.json().get('detail')}")
    
    def process_autoprint_job(self, print_data: dict, credits_required: int = 5):
        """Process an autoprint job with credit checking and consumption"""
        # Check credits
        if not self.credit_sdk.can_afford(self.user_id, credits_required):
            # Get credit balance for error message
            balance = self.credit_sdk.get_balance(self.user_id)
            raise Exception(
                f"Insufficient credits. Required: {credits_required}, Available: {balance}. "
                "Please purchase more credits."
            )
        
        # Process the print job (your business logic here)
        try:
            # Your autoprint processing code
            result = self._execute_print_job(print_data)
            
            # Consume credits after successful execution
            success = self.credit_sdk.consume_credits(
                user_id=self.user_id,
                credits=credits_required,
                description=f"Whatnot Autoprint Job - {result['job_id']}",
                metadata={
                    "job_id": result["job_id"],
                    "pages": result.get("page_count", 1),
                    "print_type": result.get("print_type", "standard")
                }
            )
            
            if not success:
                # Log error but don't fail the job (credits already checked)
                print(f"Warning: Failed to consume credits for job {result['job_id']}")
            
            return result
            
        except Exception as e:
            # Job failed, don't consume credits
            raise Exception(f"Print job failed: {str(e)}")
    
    def _execute_print_job(self, print_data: dict):
        """Execute the actual print job (implement your logic here)"""
        # Your print processing code
        return {
            "job_id": "job_12345",
            "page_count": 1,
            "print_type": "standard",
            "status": "completed"
        }
    
    def get_credit_balance(self):
        """Get current credit balance"""
        return self.credit_sdk.get_balance(self.user_id)
    
    def purchase_credits(self, price_id: str, success_url: str, cancel_url: str):
        """Initiate credit purchase via Stripe"""
        response = requests.post(
            f"{self.api_base}/api/stripe/create-checkout-session",
            json={
                "price_id": price_id,
                "success_url": success_url,
                "cancel_url": cancel_url,
                "mode": "payment"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.session_token}"
            }
        )
        
        if response.status_code == 200:
            return response.json()["url"]  # Checkout URL
        else:
            raise Exception(f"Failed to create checkout: {response.json().get('detail')}")


# Usage Example
if __name__ == "__main__":
    service = WhatnotAutoprintService()
    
    # Authenticate
    try:
        service.authenticate("user@example.com", "password123")
        print("✅ Authentication successful")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        exit(1)
    
    # Check balance
    balance = service.get_credit_balance()
    print(f"💰 Current credit balance: {balance}")
    
    # Process a print job
    try:
        print_data = {
            "content": "Hello, World!",
            "format": "pdf"
        }
        result = service.process_autoprint_job(print_data, credits_required=5)
        print(f"✅ Print job completed: {result['job_id']}")
    except Exception as e:
        print(f"❌ Print job failed: {e}")
        
        # If insufficient credits, offer to purchase
        if "Insufficient credits" in str(e):
            checkout_url = service.purchase_credits(
                price_id="price_1234567890",
                success_url="https://yourapp.com/success",
                cancel_url="https://yourapp.com/cancel"
            )
            print(f"💳 Purchase credits: {checkout_url}")
```

---

## Production Checklist

Before deploying to production:

### Database
- [ ] Use production PostgreSQL database (not localhost)
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Test database connection from production environment
- [ ] Verify all required tables exist

### Authentication
- [ ] Register app in production admin panel
- [ ] Store API keys securely (environment variables, not in code)
- [ ] Implement token refresh logic
- [ ] Handle authentication errors gracefully
- [ ] Set up logging for authentication events

### Stripe
- [ ] Switch to live Stripe API keys (`sk_live_*` and `pk_live_*`)
- [ ] Configure production webhook endpoint
- [ ] Test webhook signature verification
- [ ] Set up webhook event monitoring
- [ ] Configure proper error handling for failed payments
- [ ] Test checkout flow end-to-end

### Security
- [ ] Use HTTPS for all API calls
- [ ] Never log sensitive data (passwords, tokens, credit card info)
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Use parameterized queries (SQL injection prevention)
- [ ] Set up monitoring and alerting

### Testing
- [ ] Test authentication flow
- [ ] Test credit checking and consumption
- [ ] Test payment processing
- [ ] Test error scenarios (insufficient credits, failed payments)
- [ ] Load test critical paths
- [ ] Test webhook handling

---

## API Endpoints Reference

### Authentication Endpoints

- `POST /api/cross-app/auth` - Authenticate user
- `POST /api/cross-app/validate-token` - Validate session token
- `POST /api/cross-app/credits/check` - Check credit balance
- `POST /api/cross-app/credits/consume` - Consume credits

### Stripe Endpoints

- `POST /api/stripe/create-checkout-session` - Create checkout session
- `GET /api/stripe/products` - Get available products
- `GET /api/stripe/user-subscriptions` - Get user subscriptions
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Financial Endpoints

- `GET /api/financial/credits/balance` - Get credit balance
- `GET /api/financial/credits/{user_id}` - Get user credit info
- `POST /api/financial/credits/{user_id}/add` - Add credits (admin)
- `POST /api/financial/credits/{user_id}/spend` - Spend credits

For complete API documentation, see: `ai_docs/docs/backend-api-endpoints.md`

---

## Support & Resources

- **API Documentation**: `ai_docs/docs/backend-api-endpoints.md`
- **Stripe Integration Guide**: `ai_docs/docs/STRIPE_INTEGRATION.md`
- **Cross-App Admin Guide**: `ai_docs/docs/cross-app-admin-guide.md`
- **Credit SDK**: `backend/credit_sdk.py`

---

## Next Steps

1. **Set up your development environment** with the required environment variables
2. **Register your app** in the admin panel to get App ID and API Key
3. **Test authentication** with a test user account
4. **Implement credit checking** before processing jobs
5. **Set up Stripe** for credit purchases
6. **Test the complete flow** end-to-end
7. **Deploy to production** following the checklist above

---

*Last Updated: 2025-01-27*


