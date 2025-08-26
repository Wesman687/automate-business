# Backend API Endpoints

## Overview

This document outlines the backend API endpoints for the Atuomate Web application, including the enhanced financial system and Stripe integration.

## Base URL

```
http://localhost:8000/api
```

## Financial API Endpoints

### Financial Overview & Dashboard

#### GET /financial/overview
Get financial overview and statistics for admins with period-based filtering.

**Query Parameters:**
- `period` (optional): Period in days. Options: `30`, `90`, `365`. Default: `30`

**Response:**
```json
{
  "overview": {
    "total_users": 150,
    "total_credits": 5000,
    "active_subscriptions": 45,
    "total_subscription_revenue": 2500.00
  },
  "monthly_stats": {
    "credits_spent": 1200,
    "credits_added": 1800,
    "net_change": 600
  },
  "recent_transactions": [
    {
      "id": "tx_123",
      "user_email": "user@example.com",
      "amount": 100,
      "description": "Credit purchase",
      "created_at": "2024-01-15T10:30:00Z",
      "type": "credit"
    }
  ]
}
```

#### GET /financial/reports
Generate comprehensive financial reports for admins.

**Query Parameters:**
- `report_type` (optional): Report type. Options: `summary`, `detailed`, `custom`. Default: `summary`
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format

#### GET /financial/transactions
Get all financial transactions with advanced filtering and sorting for admins.

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `transaction_type` (optional): Filter by transaction type (`credit` or `debit`)
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format
- `limit` (optional): Number of transactions to return. Default: 100
- `offset` (optional): Number of transactions to skip. Default: 0
- `sort_by` (optional): Sort field. Options: `created_at`, `amount`, `user_email`. Default: `created_at`
- `sort_order` (optional): Sort order. Options: `asc`, `desc`. Default: `desc`

### Admin Credit Management

#### GET /financial/admin/credits/users/{user_id}
Get detailed credit information for a specific user (admin only).

**Path Parameters:**
- `user_id`: User ID

#### GET /financial/admin/credits/users/{user_id}/transactions
Get credit transactions for a specific user (admin only).

**Path Parameters:**
- `user_id`: User ID

**Query Parameters:**
- `limit` (optional): Number of transactions to return. Default: 100
- `offset` (optional): Number of transactions to skip. Default: 0

### Customer Billing

#### GET /financial/customer/billing
Get comprehensive customer billing information including invoices, subscriptions, disputes, and payment methods.

**Response:**
```json
{
  "invoices": [...],
  "subscriptions": [...],
  "disputes": [...],
  "credit_balance": 500,
  "payment_methods": [...]
}
```

### Disputes

#### POST /financial/disputes
Create a new credit dispute with detailed information.

**Request Body:**
```json
{
  "transaction_id": "tx_123",
  "reason": "Service not delivered",
  "description": "I did not receive the service I paid for",
  "requested_refund": 100
}
```

#### GET /financial/disputes
Get user's disputes with full lifecycle tracking.

### Credits Management

#### GET /financial/credits/balance
Get credit balance for a user (admin can view other users).

**Query Parameters:**
- `user_id` (optional): User ID (admin only)

#### GET /financial/credits/{user_id}
Get credit balance and transaction history for a user.

#### POST /financial/credits/{user_id}/add
Add credits to a user's account (admin only).

#### POST /financial/credits/{user_id}/spend
Spend credits from a user's account.

### Subscriptions

#### GET /financial/subscriptions/{user_id}/summary
Get subscription summary for a user.

#### POST /financial/subscriptions/{subscription_id}/renewal
Process subscription renewal and add credits (admin only).

### Legacy Endpoints

#### GET /financial/admin/dashboard
Legacy endpoint for financial dashboard data (maintained for backward compatibility).

## Stripe API Endpoints

### Checkout & Payments

#### POST /stripe/create-checkout-session
Create a Stripe checkout session for credit purchases.

**Request Body:**
```json
{
  "price_id": "price_123",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel"
}
```

#### POST /stripe/create-payment-intent
Create a payment intent for one-time payments.

**Request Body:**
```json
{
  "amount": 2500,
  "description": "One-time credit purchase",
  "payment_method_id": "pm_123"
}
```

### Subscription Management

#### POST /stripe/create-subscription
Create a subscription for a user (admin only).

**Request Body:**
```json
{
  "user_id": 1,
  "product_id": "prod_123",
  "price_id": "price_123",
  "description": "Monthly credit plan"
}
```

#### POST /stripe/cancel-subscription
Cancel a subscription.

#### POST /stripe/subscriptions/{subscription_id}/cancel
Cancel a subscription (admin only).

#### POST /stripe/subscriptions/{subscription_id}/update
Update a subscription with new pricing or quantity.

### Customer Portal & Billing

#### GET /stripe/customer-portal
Get Stripe customer portal URL for subscription management.

#### GET /stripe/customer-billing
Get customer billing information directly from Stripe.

#### GET /stripe/invoices/{invoice_id}/download
Download invoice PDFs.

### Products & Pricing

#### GET /stripe/products
Get available Stripe products and pricing information.

#### GET /stripe/user-subscriptions
Get user's subscriptions from the database.

### Payment Methods

#### POST /stripe/payment-methods/{payment_method_id}/update
Update payment method information.

#### DELETE /stripe/payment-methods/{payment_method_id}
Delete a payment method.

### Refunds & Disputes

#### POST /stripe/refund
Process refunds for payments (admin only).

**Request Body:**
```json
{
  "payment_intent_id": "pi_123",
  "reason": "requested_by_customer",
  "amount": 2500
}
```

### Webhooks

#### POST /stripe/webhook
Handle Stripe webhook events for real-time updates.

## Enhanced Credits System

The credits system now includes:

### New Features
- **Transaction Filtering**: Advanced filtering by user, type, date range
- **Sorting & Pagination**: Full transaction list with sorting and pagination
- **Refund Processing**: Direct refund processing through Stripe
- **Dispute Management**: Complete dispute lifecycle tracking
- **Subscription Integration**: Full Stripe subscription management
- **Customer Billing**: Comprehensive billing dashboard for customers

### Database Models
- Enhanced `CreditTransaction` with Stripe integration
- New `CreditDispute` model for dispute tracking
- Stripe-specific models for customers, subscriptions, and payment intents

### Admin Dashboard Features
- **All Transactions View**: Toggle between recent and full transaction list
- **Advanced Filtering**: Filter by user, type, date, with sorting options
- **Manual Subscription Creation**: Create subscriptions for selected customers
- **Refund Processing**: Process refunds directly from transaction list
- **Customer Selection**: Select specific customers for detailed financial view

### Customer Billing Features
- **Invoice Management**: View all invoices with payment options
- **Subscription Overview**: Manage active subscriptions
- **Dispute Submission**: Submit and track credit disputes
- **Payment Methods**: Manage payment methods securely
- **Credit Balance**: Real-time credit balance display

## Authentication & Security

### Current Implementation
- Temporary mock authentication for development
- Admin vs. customer role-based access control
- Secure endpoint validation

### Security Features
- Admin-only access for sensitive operations
- User permission validation
- Secure Stripe integration
- PCI compliance through Stripe

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Development Notes

- All endpoints currently use mock authentication
- Database models include comprehensive Stripe integration
- Credit system is fully integrated with Stripe payments
- Dispute resolution system tracks full lifecycle
- Admin dashboard provides comprehensive financial oversight
- Customer billing system offers full self-service capabilities

## Future Enhancements

- Real authentication system implementation
- Rate limiting for production use
- Webhook signature verification
- Advanced reporting and analytics
- Multi-currency support
- Tax calculation integration
- Automated dispute resolution workflows
