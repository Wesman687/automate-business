# Email Notification System

## Overview

The system automatically sends email notifications to the sales team when customers submit their information through the chatbot.

## Development vs Production

### Development Mode (Local)
- **Default behavior**: Emails are NOT actually sent
- **What happens**: Console logs show what would be sent
- **Environment**: `ENVIRONMENT=development` (or not set)
- **Purpose**: Safe testing without sending real emails

### Production Mode (Server)
- **Behavior**: Real emails are sent via SMTP
- **Environment**: `ENVIRONMENT=production` or `ENVIRONMENT=prod`
- **Requirements**: All SMTP credentials must be configured

## Configuration

### Environment Variables

```bash
# Set environment mode
ENVIRONMENT=development  # or 'production'

# Email server settings (production only)
SMTP_SERVER=mail.stream-lineai.com
SMTP_PORT=587
SMTP_USE_TLS=true

# Email accounts (production only)
SALES_EMAIL=sales@stream-lineai.com
SALES_PASSWORD=your_sales_password
```

## Email Content

When a customer submits information, the sales team receives:

- **Subject**: "🚀 New Lead: [Customer Name] from [Company]"
- **Content**: 
  - Customer information (name, email, company, phone)
  - Chat session details
  - Direct link to view conversation history
  - Professional HTML formatting

## Testing

### Local Development
```bash
# Test customer submission
curl -X POST http://localhost:8005/api/save-customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "session_id": "test-session-123",
    "name": "Test User",
    "company": "Test Company"
  }'
```

Result: Console shows what would be sent, no actual email sent.

### Production
Same API call, but with `ENVIRONMENT=production` - real email sent to sales team.

## Files Involved

- `backend/services/email_service.py` - Email sending logic
- `backend/api/customers.py` - Sales notification trigger
- `backend/.env` - Environment configuration

## Switching to Production

1. Set `ENVIRONMENT=production` in `.env` file
2. Configure all SMTP email credentials
3. Deploy to production server
4. Test with real email addresses
