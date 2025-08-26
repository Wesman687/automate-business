# Stripe Integration Documentation

This document provides comprehensive information about the Stripe payment integration implemented in the Automate platform.

## Overview

The Stripe integration provides secure payment processing for both one-time payments and recurring subscriptions, with automatic credit management and comprehensive financial tracking.

## Features

- **Secure Payment Processing**: Stripe Elements integration for PCI-compliant card handling
- **Subscription Management**: Create, manage, and cancel subscriptions
- **Credit System Integration**: Automatic credit allocation on successful payments
- **Webhook Handling**: Secure webhook processing for payment events
- **Admin Financial Dashboard**: Comprehensive financial overview and reporting
- **Customer Portal**: Self-service subscription management
- **Idempotency**: Prevents duplicate payment processing

## Architecture

### Backend Components

- **Stripe Service** (`backend/services/stripe_service.py`): Core payment processing logic
- **Financial Service** (`backend/services/financial_service.py`): Credit and financial management
- **Stripe Models** (`backend/database/stripe_models.py`): Database models for Stripe entities
- **API Endpoints** (`backend/api/stripe.py`, `backend/api/financial.py`): REST API for payment operations
- **Idempotency Manager** (`backend/utils/idempotency.py`): Prevents duplicate operations

### Frontend Components

- **Payment Form** (`frontend/components/PaymentForm/`): Secure card input form
- **Subscription Manager** (`frontend/components/SubscriptionManager/`): Subscription management UI
- **Admin Financial Dashboard** (`frontend/components/AdminFinancialDashboard/`): Financial overview
- **Stripe Service** (`frontend/services/stripe.ts`): Frontend API client
- **Type Definitions** (`frontend/types/stripe.ts`): TypeScript interfaces

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_API_VERSION=2023-10-16

# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/your_portal_url
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
pip install stripe==8.8.0
```

**Frontend:**
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. Database Migration

Run the database migrations to create the Stripe tables:

```bash
cd backend
alembic revision -m "add_stripe_tables"
alembic upgrade head
```

### 4. Webhook Configuration

1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to your environment variables

## API Endpoints

### Stripe Endpoints

- `POST /api/stripe/create-checkout-session` - Create Stripe Checkout session
- `POST /api/stripe/create-subscription` - Create subscription
- `DELETE /api/stripe/subscriptions/{id}` - Cancel subscription
- `GET /api/stripe/customer-portal` - Get customer portal URL
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/stripe/products` - Get available products
- `GET /api/stripe/subscriptions/{user_id}` - Get user subscriptions

### Financial Endpoints

- `GET /api/financial/credits/{user_id}` - Get user credit balance
- `POST /api/financial/credits/{user_id}/add` - Add credits (admin)
- `POST /api/financial/credits/{user_id}/spend` - Spend credits
- `GET /api/financial/subscriptions/{user_id}/summary` - Get subscription summary
- `GET /api/financial/admin/dashboard` - Admin financial dashboard

## Usage Examples

### Creating a Checkout Session

```typescript
import { stripeService } from '../services/stripe';

const checkoutData = {
  user_id: 123,
  price_id: 'price_1234567890',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
  mode: 'subscription'
};

const result = await stripeService.createCheckoutSession(checkoutData);
if (result.success) {
  window.location.href = result.data.url;
}
```

### Processing a Payment

```typescript
import PaymentForm from '../components/PaymentForm';

<PaymentForm
  amount={2500} // $25.00 in cents
  currency="USD"
  onSuccess={(paymentResult) => {
    console.log('Payment successful:', paymentResult);
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
  description="Premium Plan Subscription"
/>
```

### Managing Subscriptions

```typescript
import SubscriptionManager from '../components/SubscriptionManager';

<SubscriptionManager userId={123} />
```

## Security Features

### PCI Compliance
- **No sensitive data storage**: Card information is never stored in our database
- **Stripe Elements**: Secure card input using Stripe's PCI-compliant components
- **Tokenization**: All payment data is tokenized by Stripe

### Webhook Security
- **Signature verification**: All webhooks are verified using Stripe's signing secret
- **Idempotency**: Prevents duplicate processing of webhook events
- **Event logging**: All webhook events are logged for audit purposes

### Data Protection
- **Encrypted storage**: Sensitive data is encrypted at rest
- **Access control**: Financial data access is restricted to authorized users
- **Audit logging**: All financial operations are logged with timestamps

## Credit System Integration

### Automatic Credit Allocation
- **One-time payments**: Credits added immediately on successful payment
- **Subscriptions**: Credits added on each successful billing cycle
- **Configurable amounts**: Credit amounts can be configured per product/plan

### Credit Management
- **Wallet system**: Real-time credit balance tracking
- **Transaction ledger**: Immutable record of all credit transactions
- **Balance validation**: Prevents negative credit balances
- **Idempotent operations**: Safe retry mechanisms for credit operations

## Testing

### Test Cards
Use Stripe's test card numbers for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Webhook Testing
Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

### Test Environment
- Use test API keys for development
- Test webhook endpoints with Stripe CLI
- Verify credit allocation and subscription creation

## Monitoring and Alerts

### Webhook Monitoring
- Monitor webhook delivery success rates
- Alert on webhook failures
- Track webhook processing times

### Payment Monitoring
- Monitor payment success/failure rates
- Alert on unusual payment patterns
- Track subscription churn rates

### Credit System Monitoring
- Monitor credit balance changes
- Alert on negative balance attempts
- Track credit usage patterns

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Verify webhook secret is correct
   - Check webhook endpoint URL
   - Ensure webhook is configured in Stripe dashboard

2. **Payment intent creation failed**
   - Verify Stripe API key is correct
   - Check amount format (must be in cents)
   - Ensure currency is supported

3. **Credits not added after payment**
   - Check webhook processing logs
   - Verify webhook event handling
   - Check database transaction logs

### Debug Mode
Enable debug logging by setting:

```bash
STRIPE_DEBUG=true
```

### Log Analysis
Check logs for:
- Webhook processing errors
- Payment intent creation failures
- Credit allocation errors
- Database transaction failures

## Production Deployment

### Security Checklist
- [ ] Use live Stripe API keys
- [ ] Configure production webhook endpoints
- [ ] Enable webhook signature verification
- [ ] Set up monitoring and alerting
- [ ] Configure SSL/TLS for all endpoints
- [ ] Set up database backups

### Performance Optimization
- **Database indexing**: Ensure proper indexes on Stripe-related tables
- **Connection pooling**: Configure database connection pooling
- **Caching**: Implement caching for frequently accessed data
- **Async processing**: Use background tasks for webhook processing

### Scaling Considerations
- **Horizontal scaling**: Design for multiple application instances
- **Database sharding**: Plan for database growth
- **Webhook queuing**: Implement webhook processing queues
- **Rate limiting**: Configure appropriate rate limits

## Support and Maintenance

### Regular Tasks
- Monitor webhook delivery rates
- Review failed payment reports
- Update Stripe API versions
- Review security logs
- Backup financial data

### Updates and Upgrades
- Keep Stripe SDK updated
- Monitor Stripe API changes
- Test webhook handling after updates
- Update documentation as needed

## Compliance and Legal

### Data Retention
- Financial transaction records: 7 years
- Webhook event logs: 1 year
- User payment history: Account lifetime

### Privacy Considerations
- Follow GDPR requirements for EU users
- Implement data deletion requests
- Provide payment data export functionality
- Maintain audit trails for compliance

### Regulatory Compliance
- PCI DSS compliance (handled by Stripe)
- Financial reporting requirements
- Tax compliance for different jurisdictions
- Anti-money laundering (AML) considerations

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

## Contact

For technical support or questions about the Stripe integration:
- **Development Team**: [team@stream-lineai.com]
- **Stripe Support**: [support@stripe.com]
- **Documentation Issues**: Create an issue in the project repository
