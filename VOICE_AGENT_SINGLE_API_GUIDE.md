# Voice Agent Single API Integration Guide

## Overview
The voice agent system has been optimized for Twilio integration using a single API endpoint with intent-based routing. This simplifies the workflow and provides consistent speak responses optimized for voice interactions.

## Architecture

### Single Endpoint Design
- **Endpoint**: `POST /api/voice/agent`
- **Purpose**: Handle all voice agent interactions through intent-based routing
- **Benefits**: 
  - Simplified Twilio webhook configuration
  - Consistent response format
  - Better error handling
  - Optimized speak responses for TTS

### Intent-Based System
The system supports the following intents:

#### Customer Management
- `find_or_create_customer` - Find existing or create new customer
- `get_customer_appointments` - List customer's upcoming appointments

#### Appointment Management
- `schedule_appointment` - Book new appointments with conflict checking
- `reschedule_appointment` - Move existing appointments
- `cancel_appointment` - Cancel appointments
- `available_slots` - Check available time slots

#### Job Management
- `jobs_lookup` - Get customer's active projects/jobs
- `create_change_request` - Submit change requests for existing jobs
- `list_change_requests` - View customer's change requests

## Request Format

```json
{
  "intent": "schedule_appointment",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "555-123-4567",
  "preferred_date": "2025-08-15",
  "preferred_time": "2:30 PM",
  "duration_minutes": 60,
  "appointment_type": "consultation"
}
```

### Common Fields
- `intent` (required): The action to perform
- `name`, `email`, `phone`: Customer identification (at least one required)
- `company`, `notes`: Optional customer details

### Intent-Specific Fields

#### Appointments
- `preferred_date`: "YYYY-MM-DD", "today", "tomorrow", or "MM/DD/YYYY"
- `preferred_time`: "2:30 PM", "14:30", etc.
- `duration_minutes`: Appointment length (default: 30)
- `appointment_type`: Type of appointment (default: "consultation")

#### Jobs & Change Requests
- `job_title`: Specific job to target
- `change_title`: Title for the change request
- `change_description`: Detailed description
- `priority`: "low", "normal", "high", "urgent"
- `session_id`: Optional session tracking

## Response Format

All responses include:
- `speak`: Optimized text for Text-to-Speech conversion
- Data objects: `customer`, `appointment`, `jobs`, etc.
- `error`: Error code for handling different scenarios
- `options`: For disambiguation when multiple choices exist

```json
{
  "speak": "Great, I found John Smith. Would you like to book a time?",
  "customer": {
    "id": 123,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "555-123-4567"
  },
  "error": null
}
```

## Twilio Integration

### Webhook Setup
Configure your Twilio voice application to POST to:
```
https://your-domain.com/api/voice/agent
```

### Request Processing Flow
1. **Speech-to-Text**: Twilio converts voice to text
2. **Intent Detection**: Your system determines the intent from the speech
3. **API Call**: Single POST to `/api/voice/agent` with intent and parameters
4. **Response Processing**: Use the `speak` field for TTS response
5. **Data Handling**: Process returned data objects as needed

### Error Handling
The system provides specific error codes for common scenarios:
- `not_found`: Customer not found
- `missing_date`: Date required for scheduling
- `outside_hours`: Time outside business hours
- `conflict`: Appointment time conflict
- `no_active_jobs`: No active projects for change requests

### Sample Twilio Function
```javascript
exports.handler = function(context, event, callback) {
    const axios = require('axios');
    
    // Extract speech text and determine intent
    const speechText = event.SpeechResult;
    const intent = determineIntent(speechText); // Your intent detection logic
    
    // Extract parameters from speech
    const params = extractParameters(speechText, intent);
    
    // Call voice agent API
    axios.post('https://your-domain.com/api/voice/agent', {
        intent: intent,
        ...params
    })
    .then(response => {
        const twiml = new Twilio.twiml.VoiceResponse();
        twiml.say(response.data.speak);
        
        // Handle any follow-up actions based on response data
        
        callback(null, twiml);
    })
    .catch(error => {
        const twiml = new Twilio.twiml.VoiceResponse();
        twiml.say("I'm sorry, I encountered an error. Please try again.");
        callback(null, twiml);
    });
};
```

## Optimization Features

### TTS-Optimized Responses
- Clear, conversational language
- Proper pronunciation hints
- Appropriate pauses and rhythm
- Natural voice flow

### Business Logic
- Automatic conflict detection
- Business hours enforcement
- Customer record management
- Email notifications for change requests

### Error Recovery
- Graceful error handling
- Alternative suggestions
- Clear next steps
- Fallback responses

## Testing

Use the provided test suite to validate all intents:
```bash
python test_voice_agent_single_api.py
```

## Production Deployment

1. Ensure all environment variables are set
2. Configure email notifications
3. Set up proper authentication
4. Configure Twilio webhooks
5. Test with real voice interactions

## Security

- API authentication via Authorization header
- Input validation and sanitization
- Rate limiting recommended
- HTTPS required for production
