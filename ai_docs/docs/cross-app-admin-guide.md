# Cross-App Integration Admin Guide

## Overview

The Cross-App Integration Admin Panel allows administrators to easily manage external applications that integrate with Stream-line AI's authentication and credit system. This guide covers all the features and workflows for managing app integrations.

## Accessing the Admin Panel

- **URL**: `/admin/cross-app` (requires admin privileges)
- **Required Role**: Admin or Super Admin
- **Authentication**: Must be logged in with admin account

## Features

### 1. **View All Integrations**
- See all registered app integrations in a table format
- Filter by status (active, pending, suspended, inactive)
- View key information: App ID, Name, Domain, Status, Permissions, Created Date

### 2. **Create New Integration**
- **Button**: "Add New App" button in the top-right corner
- **Required Fields**:
  - App Name: Human-readable name for the app
  - App Domain: The domain where the app is hosted
  - Permissions: Select from available permission types
- **Optional Fields**:
  - App URL: Full URL to the application
  - Description: Brief description of what the app does
  - Logo URL: Link to the app's logo image
  - Primary Color: Brand color for the app (#hex format)
  - Max Users: Maximum number of users allowed
  - Public App: Whether the app is publicly listed
  - Webhook URL: For receiving notifications
  - Allowed Origins: CORS origins for the app

### 3. **Manage Existing Integrations**

#### **View/Edit Details**
- Click the eye icon (👁️) to view and edit integration details
- Modify any field except App ID (which is permanent)
- Update permissions, URLs, descriptions, etc.

#### **Status Management**
- **Approve**: Change status from "Pending Approval" to "Active"
- **Suspend**: Temporarily disable an active integration
- **Activate**: Re-enable a suspended integration
- **Delete**: Soft delete (sets status to "Inactive")

#### **API Key Management**
- **Regenerate**: Create a new API key for security
- **View**: See the current API key (only shown once after creation/regeneration)
- **Security**: API keys are hashed in the database

### 4. **Permission Types**

| Permission | Description | Use Case |
|------------|-------------|----------|
| `read_user_info` | Read basic user information | User profile display |
| `read_credits` | Check user's credit balance | Show available credits |
| `purchase_credits` | Initiate credit purchases | Credit purchase flow |
| `consume_credits` | Deduct credits for services | Service usage billing |
| `manage_subscriptions` | View/manage subscriptions | Subscription management |
| `read_analytics` | Access usage analytics | Reporting and insights |

## Workflow Examples

### **Adding a New App Integration**

1. **Click "Add New App"**
2. **Fill Required Fields**:
   - App Name: "My Video Generator"
   - App Domain: "myvideogen.com"
   - Permissions: Select `read_credits`, `consume_credits`, `purchase_credits`
3. **Fill Optional Fields**:
   - App URL: "https://myvideogen.com"
   - Description: "AI-powered video generation service"
   - Primary Color: "#FF6B6B"
4. **Click "Create Integration"**
5. **Save the API Key**: The system will show you an API key - save this securely!
6. **Share with Developer**: Provide the App ID and API Key to the app developer

### **Managing an Existing Integration**

1. **View Details**: Click the eye icon (👁️) on any integration
2. **Make Changes**: Update fields as needed
3. **Save Changes**: Click "Update Integration"
4. **Monitor Status**: Watch for any issues or unusual activity

### **Handling Issues**

1. **Suspend Integration**: If an app is misbehaving, suspend it immediately
2. **Investigate**: Check usage statistics and logs
3. **Contact Developer**: Reach out to resolve issues
4. **Reactivate**: Once resolved, activate the integration again

## Security Best Practices

### **API Key Management**
- Never share API keys in public repositories
- Regenerate keys if you suspect they've been compromised
- Use different keys for different environments (dev/staging/prod)

### **Permission Management**
- Grant only the minimum permissions needed
- Regularly review and audit permissions
- Remove unused integrations promptly

### **Monitoring**
- Watch for unusual usage patterns
- Monitor credit consumption rates
- Check for failed authentication attempts

## Troubleshooting

### **Common Issues**

#### **Integration Not Working**
- Check if status is "Active"
- Verify permissions are correctly set
- Ensure domain matches exactly
- Check if API key is valid

#### **Permission Errors**
- Verify the app has the required permissions
- Check if user has sufficient credits (for consume operations)
- Ensure the integration is approved and active

#### **API Key Issues**
- Regenerate the API key if needed
- Ensure the key is being sent in the correct format
- Check if the key has expired (they don't expire, but can be regenerated)

### **Getting Help**

- **Logs**: Check backend logs for detailed error messages
- **Status**: Verify integration status in the admin panel
- **Support**: Contact the development team for complex issues

## Integration Examples

### **Simple App (Read-Only)**
```json
{
  "app_name": "User Dashboard",
  "app_domain": "dashboard.example.com",
  "permissions": ["read_user_info", "read_credits"],
  "is_public": false
}
```

### **Full-Service App**
```json
{
  "app_name": "AI Service Platform",
  "app_domain": "aiservice.com",
  "permissions": [
    "read_user_info",
    "read_credits",
    "consume_credits",
    "purchase_credits",
    "manage_subscriptions"
  ],
  "is_public": true,
  "webhook_url": "https://aiservice.com/webhooks/credits",
  "allowed_origins": ["https://aiservice.com", "https://app.aiservice.com"]
}
```

## API Endpoints Reference

All admin operations use these endpoints:

- `GET /api/admin/cross-app/integrations` - List all integrations
- `POST /api/admin/cross-app/integrations` - Create new integration
- `GET /api/admin/cross-app/integrations/{app_id}` - Get specific integration
- `PUT /api/admin/cross-app/integrations/{app_id}` - Update integration
- `POST /api/admin/cross-app/integrations/{app_id}/approve` - Approve integration
- `POST /api/admin/cross-app/integrations/{app_id}/suspend` - Suspend integration
- `POST /api/admin/cross-app/integrations/{app_id}/activate` - Activate integration
- `POST /api/admin/cross-app/integrations/{app_id}/regenerate-api-key` - New API key
- `GET /api/admin/cross-app/integrations/{app_id}/usage` - Usage statistics
- `DELETE /api/admin/cross-app/integrations/{app_id}` - Delete integration

## Next Steps

1. **Test the System**: Create a test integration to verify everything works
2. **Onboard Developers**: Share this guide with app developers
3. **Monitor Usage**: Keep an eye on integration activity
4. **Scale Up**: Add more integrations as needed

---

**Need Help?** Contact the development team or check the logs for detailed error information.
