# Enhanced Credits System Documentation

## Overview

The Enhanced Credits System is a comprehensive solution for managing user credits, subscriptions, and financial operations in the Streamline AI platform. Each credit equals $0.10, providing a flexible and scalable way to monetize automation services.

## 🏗️ Architecture

### Core Components

1. **Credit Service** (`backend/services/credit_service.py`)
   - Manages credit balance operations
   - Handles credit transactions
   - Provides credit validation and reporting

2. **Database Models** (`backend/models/credit_models.py`)
   - `CreditPackage`: Subscription package definitions
   - `UserSubscription`: Active user subscriptions
   - `CreditDispute`: Credit dispute management
   - `CreditPromotion`: Promotional offers and discounts

3. **API Endpoints**
   - `/api/credits/*` - User credit operations
   - `/api/admin/credits/*` - Admin credit management
   - `/api/disputes/*` - Dispute handling

4. **Frontend Components**
   - `CreditsDashboard` - User credit overview
   - Credit management hooks and services
   - TypeScript interfaces and types

## 💳 Credit System Features

### Pricing Model
- **Base Rate**: $0.10 per credit
- **Subscription Discounts**: Package subscribers get discounted rates
- **Bulk Discounts**: Volume-based pricing for large purchases

### Subscription Packages
1. **Starter Package** - $19.99/month
   - 200 credits per month
   - Basic automation tools
   - Email support

2. **Professional Package** - $49.99/month
   - 600 credits per month
   - Advanced automation tools
   - Priority support
   - API access

3. **Enterprise Package** - $99.99/month
   - 1500 credits per month
   - Premium automation tools
   - 24/7 support
   - Custom integrations
   - Dedicated account manager

### Credit Operations
- **Credit Addition**: Admin manual addition, subscription allocation, purchases
- **Credit Deduction**: Service consumption, admin removal
- **Balance Validation**: Prevents negative balances
- **Transaction History**: Complete audit trail

## 🔧 Technical Implementation

### Database Schema

#### Enhanced User Model
```sql
-- Added to users table
ALTER TABLE users ADD COLUMN credit_status VARCHAR(50) DEFAULT 'active';
```

#### New Tables
```sql
-- Credit packages
CREATE TABLE credit_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    credit_amount INTEGER NOT NULL,
    credit_rate DECIMAL(10,4) DEFAULT 0.1000,
    features JSON,
    is_active BOOLEAN DEFAULT true
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    package_id INTEGER REFERENCES credit_packages(id),
    status subscription_status DEFAULT 'active',
    start_date TIMESTAMP NOT NULL,
    next_billing_date TIMESTAMP NOT NULL,
    monthly_credit_limit INTEGER NOT NULL
);

-- Credit disputes
CREATE TABLE credit_disputes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    transaction_id VARCHAR REFERENCES credits_transactions(id),
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status dispute_status DEFAULT 'pending'
);

-- Credit promotions
CREATE TABLE credit_promotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10,4) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);
```

### API Endpoints

#### User Credit Endpoints
- `GET /api/credits/balance` - Get current credit balance
- `GET /api/credits/summary` - Get comprehensive credit summary
- `GET /api/credits/transactions` - Get transaction history
- `POST /api/credits/purchase/validate` - Validate credit purchase
- `POST /api/credits/purchase` - Purchase credits
- `GET /api/credits/rate` - Get credit rate
- `GET /api/credits/packages` - Get subscription packages

#### Admin Credit Endpoints
- `POST /api/admin/credits/add` - Add credits to user
- `POST /api/admin/credits/remove` - Remove credits from user
- `POST /api/admin/credits/pause` - Pause credit service
- `POST /api/admin/credits/resume` - Resume credit service
- `GET /api/admin/credits/user/{user_id}/balance` - Get user balance
- `GET /api/admin/credits/user/{user_id}/transactions` - Get user transactions
- `GET /api/admin/credits/user/{user_id}/summary` - Get user summary
- `GET /api/admin/credits/system/summary` - Get system summary
- `GET /api/admin/credits/users/status` - Get users credit status

#### Dispute Endpoints
- `POST /api/disputes/submit` - Submit credit dispute
- `GET /api/disputes/my-disputes` - Get user disputes
- `GET /api/disputes/{dispute_id}` - Get dispute details
- `GET /api/disputes/admin/queue` - Admin dispute queue
- `PUT /api/disputes/admin/{dispute_id}/review` - Review dispute
- `POST /api/disputes/admin/{dispute_id}/resolve` - Resolve dispute
- `GET /api/disputes/admin/statistics` - Dispute statistics

### Frontend Integration

#### TypeScript Types
```typescript
interface CreditBalance {
  user_id: number;
  current_credits: number;
  credit_status: string;
  subscription?: UserSubscription;
  next_billing_date?: string;
}

interface CreditTransaction {
  id: string;
  user_id: number;
  amount: number;
  description: string;
  transaction_type: TransactionType;
  created_at: string;
}
```

#### React Hooks
```typescript
const {
  balance,
  summary,
  transactionHistory,
  isLoading,
  error,
  refreshBalance,
  purchaseCredits
} = useCredits();
```

#### Service Layer
```typescript
// Get credit balance
const balance = await creditsService.getBalance();

// Purchase credits
const transaction = await creditsService.purchaseCredits(
  amount,
  description,
  stripePaymentIntentId
);
```

## 🚀 Getting Started

### 1. Database Migration
```bash
# Run the migration to create new tables
alembic upgrade head
```

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

### 3. Frontend Integration
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Test the System
```bash
# Run the credit system test
python test_credits_system.py
```

## 📊 Usage Examples

### Adding Credits (Admin)
```python
from services.credit_service import CreditService

credit_service = CreditService(db)
transaction = credit_service.add_credits(
    user_id=123,
    amount=1000,
    description="Bonus credits for early adopter",
    transaction_type="admin"
)
```

### Spending Credits (Service)
```python
# Check if user has sufficient credits
if user.credits >= required_credits:
    transaction = credit_service.spend_credits(
        user_id=user.id,
        amount=required_credits,
        description="AI video generation service",
        job_id=job_id
    )
else:
    raise InsufficientCreditsError("Not enough credits")
```

### Submitting a Dispute
```typescript
const dispute = await disputesService.submitDispute({
  user_id: currentUser.id,
  transaction_id: transactionId,
  reason: "Service not delivered",
  description: "The AI video was never generated despite credits being deducted",
  requested_refund: 50
});
```

## 🔒 Security & Validation

### Credit Validation
- Prevents negative credit balances
- Validates credit amounts before operations
- Ensures idempotent transactions

### Admin Access Control
- Admin-only endpoints require `isAdmin` privilege
- All credit modifications are logged
- Audit trail for compliance

### Input Validation
- Pydantic schemas for request validation
- SQL injection prevention
- XSS protection in frontend

## 📈 Monitoring & Reporting

### Credit Metrics
- Total credits in system
- Credit distribution by user
- Monthly credit consumption
- Revenue tracking

### Dispute Analytics
- Dispute resolution time
- Common dispute reasons
- Credit refund statistics
- Admin performance metrics

## 🔄 Integration Points

### Stripe Integration
- Subscription billing
- One-time credit purchases
- Webhook handling for payments
- Customer portal integration

### Automation Services
- Credit validation before service execution
- Automatic credit deduction on completion
- Service cost tracking
- Usage analytics

### Email Notifications
- Low credit warnings
- Subscription renewal reminders
- Dispute status updates
- Payment confirmations

## 🧪 Testing

### Backend Tests
```bash
# Run credit system tests
pytest tests/test_credit_service.py

# Run API endpoint tests
pytest tests/test_credits_api.py
```

### Frontend Tests
```bash
# Run component tests
npm test -- CreditsDashboard

# Run service tests
npm test -- credits
```

### Integration Tests
```bash
# Test complete credit flow
python test_credits_integration.py
```

## 🚨 Troubleshooting

### Common Issues

1. **Credit Balance Not Updating**
   - Check database transaction logs
   - Verify credit service is running
   - Check for database connection issues

2. **Dispute Not Showing in Admin Queue**
   - Verify dispute status is 'pending'
   - Check admin permissions
   - Verify database relationships

3. **Subscription Credits Not Adding**
   - Check Stripe webhook configuration
   - Verify subscription status
   - Check credit service logs

### Debug Commands
```bash
# Test credit system components
python test_credits_system.py

# Check database schema
alembic current

# View API documentation
# Navigate to /docs in your browser
```

## 📚 Additional Resources

- [Credit System API Documentation](./api/credits.md)
- [Admin Credit Management Guide](./admin/credits.md)
- [Dispute Resolution Workflow](./disputes/workflow.md)
- [Stripe Integration Guide](./stripe/integration.md)
- [Frontend Component Library](./frontend/components.md)

## 🤝 Contributing

When contributing to the credit system:

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Follow security best practices

## 📄 License

This enhanced credits system is part of the Streamline AI platform and follows the same licensing terms.
