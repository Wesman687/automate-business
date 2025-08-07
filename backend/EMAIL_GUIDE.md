# Email Service Development Guide

## Important: Email Testing Strategy

### 🚨 **Local Development Approach**
**For local testing, we send requests to the production server!**

- ✅ **Local Development**: Calls production server for email features
- ✅ **Production Server**: `https://server.stream-lineai.com` - Handles actual emails
- ❌ **Local Backend**: Email service logs locally but cannot send real emails

### 📧 **Email Testing Endpoints**

#### Frontend Behavior:
- **Contact Form**: Always uses `https://server.stream-lineai.com/api/contact`
- **Password Reset**: Always uses `https://server.stream-lineai.com/email/forgot-password`
- **Reset Confirmation**: Always uses `https://server.stream-lineai.com/email/reset-password`

#### Server Down Handling:
- **Contact Form**: Shows "Contact server is currently down. Please email us directly at sales@stream-lineai.com"
- **Password Reset**: Shows "Email server is currently down. Please try again later or contact tech@stream-lineai.com for assistance."

### 🔧 **Development Testing**

#### Method 1: Use Production Server (Recommended)
```bash
# Frontend automatically calls production server for email features
# If server is down, shows helpful error messages
npm run dev  # Frontend will call production for emails
```

#### Method 2: Test Email Flow Locally
```bash
# Use the test endpoint to get reset links without sending emails
curl -X POST "http://localhost:8005/email/test-forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "wesman687@gmail.com"}'

# Returns: 
# {
#   "message": "Test mode - here's the reset link that would be emailed",
#   "reset_link": "https://stream-lineai.com/reset-password?token=abc123...",
#   "token": "abc123...",
#   "test_mode": true
# }
```

#### Method 3: Local Email Logging
```bash
# Backend logs email content in development mode
python main.py  # Check console for email logs
```

### 🚀 **Production Deployment**

#### Email Environment Variables Required:
```bash
ENVIRONMENT=production
SMTP_SERVER=mail.stream-lineai.com
SMTP_PORT=587
SMTP_USE_TLS=true
NO_REPLY_EMAIL=no-reply@stream-lineai.com
NO_REPLY_PASSWORD=your_password
SALES_EMAIL=sales@stream-lineai.com
SALES_PASSWORD=your_password
TECH_EMAIL=tech@stream-lineai.com
TECH_PASSWORD=your_password
```

### 📝 **Email Features**

#### Available Email Functions:
- ✅ **Contact Form**: Customer inquiries → sales@stream-lineai.com
- ✅ **Password Reset**: Secure token-based password reset
- ✅ **Admin Notifications**: System notifications via no-reply
- ✅ **HTML Templates**: Professional email templates with branding

#### Email Security:
- 🔐 **Token-based reset**: 1-hour expiration, single-use tokens
- 🔐 **Rate limiting**: Prevents spam (implement if needed)
- 🔐 **Email validation**: Pydantic EmailStr validation
- 🔐 **Environment separation**: Dev logs, prod sends

### 🛠️ **Troubleshooting**

#### Common Development Issues:
1. **"Email server is down"** → Production server is offline, try again later
2. **"Contact server is down"** → Use direct email: sales@stream-lineai.com
3. **"Token expired"** → Password reset tokens expire in 1 hour, request new one
4. **CORS errors** → Expected when calling production from localhost

#### Testing Flow:
1. **Start local frontend**: `npm run dev` (port 3002)
2. **Test password reset**: Uses production server automatically
3. **Check email**: Real emails sent to your inbox
4. **Test locally**: Use `/email/test-forgot-password` for development

#### Error Messages Guide:
- ✅ **"Password reset email sent!"** → Email actually sent via production
- ❌ **"Email server is currently down"** → Production server unavailable
- ❌ **"Invalid or expired reset token"** → Token issue, request new reset

### 📋 **Testing Checklist**

#### Local Development Testing:
- [ ] Frontend calls production server for emails
- [ ] Error messages show when server is down
- [ ] Test endpoint returns reset links
- [ ] Password reset flow works end-to-end
- [ ] Contact form gracefully handles server issues

#### Production Testing:
- [ ] Actual emails are received
- [ ] HTML templates render correctly
- [ ] Reset links work properly
- [ ] Contact form submissions reach sales team
- [ ] No CORS issues in production
