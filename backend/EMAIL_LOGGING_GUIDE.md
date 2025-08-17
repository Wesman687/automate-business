# Email System Logging Documentation

## Overview
The email system now includes comprehensive logging using a dedicated `email` logger. All email-related operations are logged with structured messages for easy monitoring and analysis.

## Logger Name
- **Logger:** `email`
- **Usage:** `email_logger = logging.getLogger('email')`

## Log Message Format
All email log messages follow this format:
```
📧 [OPERATION_TYPE] | [Key: Value] | [Key: Value] | ...
```

## Email Operations Logged

### 1. Email Sending
- **EMAIL_SEND_START** - When an email send operation begins
- **EMAIL_SEND_SUCCESS** - When an email is sent successfully  
- **EMAIL_SEND_FAILED** - When an email send operation fails
- **EMAIL_SEND_CC** - When CC recipients are included
- **EMAIL_SEND_BCC** - When BCC recipients are included
- **EMAIL_SEND_ATTACHMENTS** - When attachments are included

### 2. Email Reading
- **EMAIL_READ_START** - When reading emails from accounts begins
- **EMAIL_READ_ACCOUNT_START** - When reading from a specific account starts
- **EMAIL_READ_ACCOUNT_SUCCESS** - When successfully read emails from an account
- **EMAIL_READ_ACCOUNT_FAILED** - When failed to read from an account
- **EMAIL_READ_COMPLETE** - When email reading operation completes

### 3. Email Marking (Read/Unread)
- **EMAIL_MARK_READ_START** - When marking email as read begins
- **EMAIL_MARK_READ_SUCCESS** - When email successfully marked as read
- **EMAIL_MARK_READ_FAILED** - When marking as read fails
- **EMAIL_MARK_UNREAD_START** - When marking email as unread begins
- **EMAIL_MARK_UNREAD_SUCCESS** - When email successfully marked as unread
- **EMAIL_MARK_UNREAD_FAILED** - When marking as unread fails

### 4. Email Retrieval
- **EMAIL_GET_BY_ID_START** - When retrieving specific email begins
- **EMAIL_GET_BY_ID_SUCCESS** - When email successfully retrieved
- **EMAIL_GET_BY_ID_FAILED** - When email retrieval fails
- **EMAIL_GET_BY_ID_ACCOUNT_NOT_FOUND** - When email account not found

### 5. API Operations
- **EMAIL_API_SEND_REQUEST** - API request to send email
- **EMAIL_API_SEND_SUCCESS** - API email send success
- **EMAIL_API_SEND_FAILED** - API email send failure
- **EMAIL_API_SEND_ERROR** - API email send error
- **EMAIL_API_MARK_READ_REQUEST** - API request to mark email as read
- **EMAIL_API_MARK_READ_SUCCESS** - API mark read success
- **EMAIL_API_MARK_READ_NOT_FOUND** - API mark read - email not found
- **EMAIL_API_MARK_READ_ERROR** - API mark read error
- **EMAIL_API_MARK_UNREAD_REQUEST** - API request to mark email as unread
- **EMAIL_API_MARK_UNREAD_SUCCESS** - API mark unread success
- **EMAIL_API_MARK_UNREAD_NOT_FOUND** - API mark unread - email not found
- **EMAIL_API_MARK_UNREAD_ERROR** - API mark unread error
- **EMAIL_API_REPLY_REQUEST** - API request to reply to email
- **EMAIL_API_REPLY_SENDING** - API reply being sent
- **EMAIL_API_REPLY_SUCCESS** - API reply success
- **EMAIL_API_REPLY_FAILED** - API reply failure
- **EMAIL_API_REPLY_ORIGINAL_NOT_FOUND** - API reply - original email not found
- **EMAIL_API_FORWARD_REQUEST** - API request to forward email
- **EMAIL_API_FORWARD_SENDING** - API forward being sent
- **EMAIL_API_FORWARD_SUCCESS** - API forward success
- **EMAIL_API_FORWARD_FAILED** - API forward failure
- **EMAIL_API_FORWARD_ORIGINAL_NOT_FOUND** - API forward - original email not found

## Example Log Messages

### Email Sending
```
2025-08-17 01:00:00 | EMAIL | INFO | 📧 EMAIL_SEND_START | From: tech | To: customer@example.com | Subject: Welcome to our service
2025-08-17 01:00:01 | EMAIL | INFO | 📧 EMAIL_SEND_SUCCESS | From: tech | To: customer@example.com | Subject: Welcome to our service
```

### Email Marking
```
2025-08-17 01:00:00 | EMAIL | INFO | 📧 EMAIL_MARK_READ_START | Email: Tech_12345 | Account: Tech
2025-08-17 01:00:01 | EMAIL | INFO | 📧 EMAIL_MARK_READ_SUCCESS | Email: Tech_12345 | Account: Tech
```

### API Operations
```
2025-08-17 01:00:00 | EMAIL | INFO | 📧 EMAIL_API_SEND_REQUEST | From: sales | To: lead@company.com | Subject: Follow-up on your inquiry
2025-08-17 01:00:01 | EMAIL | INFO | 📧 EMAIL_API_SEND_SUCCESS | From: sales | To: lead@company.com | Subject: Follow-up on your inquiry
```

## Common Log Fields
- **From** - Sending account (tech, sales, no-reply)
- **To** - Recipient email(s)
- **Subject** - Email subject line
- **Email** - Email ID for operations on specific emails
- **Account** - Email account name
- **User** - User performing the operation (for API calls)
- **Error** - Error message for failed operations

## Setting Up Log Monitoring

### 1. File-based Monitoring
The email logger writes to `logs/email.log` by default. You can:
- Set up log rotation (configured for 10MB files, 10 backups)
- Monitor with tools like `tail -f logs/email.log`
- Parse logs with tools like `grep`, `awk`, or log analysis tools

### 2. External Monitoring
You can configure additional handlers:
- **Webhook handler** - Send logs to external services
- **Database handler** - Store logs in database
- **Syslog handler** - Send to system logs
- **SMTP handler** - Email critical alerts

### 3. Log Analysis Examples

**Count email sends per day:**
```bash
grep "EMAIL_SEND_SUCCESS" logs/email.log | grep "$(date +%Y-%m-%d)" | wc -l
```

**Find failed email operations:**
```bash
grep "EMAIL.*FAILED\|EMAIL.*ERROR" logs/email.log
```

**Monitor specific account activity:**
```bash
grep "Account: Tech" logs/email.log
```

**Track API usage:**
```bash
grep "EMAIL_API" logs/email.log | grep "$(date +%Y-%m-%d)"
```

## Integration with Your Monitoring System

To integrate with your existing monitoring:

1. **Add custom handler** to `email_logging_config.yaml`
2. **Parse log messages** using the structured format
3. **Set up alerts** for ERROR level messages
4. **Create dashboards** using log data
5. **Monitor trends** in email activity

The structured logging format makes it easy to:
- Track email delivery rates
- Monitor system performance
- Debug email issues
- Generate usage reports
- Set up automated alerts
