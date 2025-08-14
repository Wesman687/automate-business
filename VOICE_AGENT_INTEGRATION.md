# Voice Agent Integration Guide for Ultravox + Twilio

This guide shows you how to integrate your StreamlineAI backend with Ultravox and Twilio for voice agent capabilities.

## 🎯 Available Voice Agent Endpoints

Your backend now includes these voice-optimized endpoints:

### Customer Management
- `POST /api/voice/customers/lookup` - Find customer by email, phone, or name
- `POST /api/voice/customers/create` - Create new customer from voice input

### Job Information  
- `GET /api/voice/jobs/customer/{customer_id}` - Get customer's jobs
- `POST /api/voice/jobs/lookup` - Lookup jobs by customer info

### Change Requests
- `POST /api/voice/change-requests/create` - Submit change request for customer's job
- `GET /api/voice/change-requests/customer/{customer_id}` - Get customer's change requests

### Appointment Management  
- `GET /api/voice/appointments/available-slots` - Get available time slots
- `POST /api/voice/appointments/schedule` - Schedule appointment with conflict checking
- `GET /api/voice/appointments/customer/{customer_id}` - Get customer appointments
- `PUT /api/voice/appointments/{appointment_id}/reschedule` - Reschedule appointment
- `DELETE /api/voice/appointments/{appointment_id}` - Cancel appointment

### Admin Management
- `GET /api/admin/overview` - Comprehensive dashboard with appointments, jobs, and change requests
- `GET /api/admin/jobs` - All jobs management
- `GET /api/admin/change-requests` - All change requests  
- `PUT /api/admin/change-requests/{id}` - Update change request status

## 🛠️ Integration Examples

### 1. Ultravox Function Definitions

```json
{
  "functions": [
    {
      "name": "lookup_customer",
      "description": "Look up existing customer by email, phone, or name",
      "parameters": {
        "type": "object",
        "properties": {
          "email": {"type": "string", "description": "Customer email address"},
          "phone": {"type": "string", "description": "Customer phone number"},
          "name": {"type": "string", "description": "Customer name"}
        }
      }
    },
    {
      "name": "create_customer", 
      "description": "Create a new customer record",
      "parameters": {
        "type": "object",
        "properties": {
          "name": {"type": "string", "description": "Customer name"},
          "email": {"type": "string", "description": "Customer email"},
          "phone": {"type": "string", "description": "Customer phone"},
          "company": {"type": "string", "description": "Customer company"}
        },
        "required": ["name"]
      }
    },
    {
      "name": "get_available_slots",
      "description": "Get available appointment slots for a date",
      "parameters": {
        "type": "object", 
        "properties": {
          "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
          "duration": {"type": "integer", "description": "Duration in minutes", "default": 30}
        },
        "required": ["date"]
      }
    },
    {
      "name": "lookup_customer_jobs",
      "description": "Look up current jobs/projects for a customer",
      "parameters": {
        "type": "object",
        "properties": {
          "email": {"type": "string", "description": "Customer email address"},
          "phone": {"type": "string", "description": "Customer phone number"},
          "name": {"type": "string", "description": "Customer name"}
        }
      }
    },
    {
      "name": "create_change_request",
      "description": "Submit a change request for a customer's project",
      "parameters": {
        "type": "object",
        "properties": {
          "customer_email": {"type": "string", "description": "Customer email"},
          "customer_phone": {"type": "string", "description": "Customer phone"},
          "customer_name": {"type": "string", "description": "Customer name"},
          "job_title": {"type": "string", "description": "Project title (optional)"},
          "change_title": {"type": "string", "description": "Brief title for the change"},
          "change_description": {"type": "string", "description": "Detailed description of requested change"},
          "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"], "default": "medium"}
        },
        "required": ["change_title", "change_description"]
      }
    },
      "description": "Schedule an appointment for a customer",
      "parameters": {
        "type": "object",
        "properties": {
          "customer_email": {"type": "string", "description": "Customer email"},
          "customer_phone": {"type": "string", "description": "Customer phone"},
          "customer_name": {"type": "string", "description": "Customer name"},
          "preferred_date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
          "preferred_time": {"type": "string", "description": "Time like '2:30 PM' or '14:30'"},
          "duration_minutes": {"type": "integer", "description": "Duration in minutes", "default": 30},
          "notes": {"type": "string", "description": "Appointment notes"}
        },
        "required": ["preferred_date", "preferred_time"]
      }
    }
  ]
}
```

### 2. Ultravox Function Implementations

```javascript
// Function implementations for Ultravox
const functions = {
  async lookup_customer(params) {
    const response = await fetch(`${BACKEND_URL}/api/voice/customers/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  },

  async create_customer(params) {
    const response = await fetch(`${BACKEND_URL}/api/voice/customers/create`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  },

  async get_available_slots(params) {
    const url = new URL(`${BACKEND_URL}/api/voice/appointments/available-slots`);
    url.searchParams.append('date', params.date);
    if (params.duration) url.searchParams.append('duration', params.duration);
    
    const response = await fetch(url);
    return await response.json();
  },

  async lookup_customer_jobs(params) {
    const response = await fetch(`${BACKEND_URL}/api/voice/jobs/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  },

  async create_change_request(params) {
    const response = await fetch(`${BACKEND_URL}/api/voice/change-requests/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  },
    const response = await fetch(`${BACKEND_URL}/api/voice/appointments/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  }
};
```

### 3. Voice Agent Conversation Flow Examples

#### Customer Lookup Flow
```
User: "Hi, I'd like to schedule an appointment"
Agent: "I'd be happy to help! Can you provide your email address?"
User: "john@example.com"
Agent: [calls lookup_customer] "Great! I found your record, John Smith. What date works for you?"
```

#### New Customer Flow  
```
User: "I'm a new customer, I need to schedule a consultation"
Agent: "Welcome! I'll need some basic information. What's your name?"
User: "Jane Doe"
Agent: "And your email address?"
User: "jane@company.com"
Agent: [calls create_customer] "Perfect! I've created your record. Now, what date would you prefer?"
```

#### Appointment Scheduling Flow
```
User: "I'd like to schedule for next Tuesday"
Agent: [calls get_available_slots with date] "I have these times available on Tuesday: 10 AM, 2 PM, and 4 PM. Which works best?"
User: "2 PM would be perfect"
Agent: [calls schedule_appointment] "Excellent! I've scheduled your appointment for Tuesday at 2 PM. You'll receive a confirmation email shortly."
```

#### Change Request Flow
```
User: "I need to update my website's contact form"
Agent: [calls lookup_customer_jobs] "I see you have an active website project. What specifically would you like changed about the contact form?"
User: "I want to add a dropdown for service types"
Agent: [calls create_change_request] "I've submitted your change request to add a service type dropdown to your contact form. Our tech team will review it and provide an estimate within 24 hours."
```

#### Job Information Flow
```
User: "What's the status of my current projects?"
Agent: [calls lookup_customer_jobs] "You have 2 active projects: 'E-commerce Website' at 75% complete and 'Email Automation' at 30% complete. Would you like details on either project?"
User: "Tell me about the email automation"
Agent: "Your email automation project is currently in progress. Is there anything you'd like to modify or add to this project?"
```
```
User: "Can I book Monday at 10 AM?"
Agent: [calls schedule_appointment] "That time is already booked, but I have these alternatives: Monday at 11 AM, Monday at 2 PM, or Tuesday at 10 AM. Which would you prefer?"
User: "Monday at 11 AM works"
Agent: [calls schedule_appointment with new time] "Perfect! Booked for Monday at 11 AM."
```

## 🔧 Backend Configuration

Make sure your backend environment variables are set:

```bash
# .env file
BACKEND_HOST=localhost
BACKEND_PORT=8005
BACKEND_URL=http://localhost:8005

# Email configuration (for appointment confirmations)
SMTP_SERVER=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password

# Google Calendar (optional)
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📞 Twilio Integration

### Webhook Configuration
Set your Twilio webhook URL to your Ultravox endpoint that handles the voice functions.

### Phone Number Setup
```javascript
// Twilio Voice webhook handler
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();
  
  // Connect to Ultravox for AI handling
  twiml.connect().stream({
    url: 'wss://your-ultravox-endpoint/stream',
    track: 'inbound_track'
  });
  
  res.type('text/xml');
  res.send(twiml.toString());
});
```

## 🎯 Key Features

### Smart Customer Recognition
- Email lookup (most reliable)
- Phone number fuzzy matching  
- Name-based search with partial matching
- Automatic customer creation for new callers

### Intelligent Appointment Scheduling  
- Real-time conflict checking
- Alternative time suggestions
- Business hours validation (9 AM - 5 PM, weekdays)
- Automatic email confirmations
- Google Calendar integration ready

### Voice-Optimized Responses
- Simplified data structures for TTS
- Human-readable time formats
- Clear error messages
- Contextual conversation flow

### Error Handling
- Graceful fallbacks for API errors
- User-friendly error messages  
- Automatic retries for transient failures
- Comprehensive logging

## 🚀 Testing Your Integration

1. **Start your backend**: `uvicorn main:app --host localhost --port 8005`
2. **Test endpoints** with curl or Postman
3. **Configure Ultravox** with the function definitions above
4. **Set up Twilio** webhook to your Ultravox endpoint
5. **Make test calls** to verify the flow

## 📋 Example API Responses

### Customer Lookup Response
```json
{
  "found": true,
  "customer_id": 123,
  "name": "John Smith", 
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "message": "Found customer: John Smith"
}
```

### Available Slots Response  
```json
{
  "available": true,
  "message": "Found 8 available slots for Tuesday, August 15",
  "slots": [
    {"time": "9:00 AM", "datetime": "2025-08-15T09:00:00", "readable": "9:00 AM"},
    {"time": "9:30 AM", "datetime": "2025-08-15T09:30:00", "readable": "9:30 AM"}
  ],
  "date": "2025-08-15"
}
```

### Appointment Schedule Response (Success)
```json
{
  "success": true,
  "message": "Great! I've scheduled your appointment for Tuesday, August 15 at 2:00 PM. You'll receive a confirmation email shortly.",
  "appointment_id": 456,
  "scheduled_time": "Tuesday, August 15 at 2:00 PM",
  "customer_id": 123
}
```

### Appointment Schedule Response (Conflict)
```json
{
  "success": false,  
  "message": "That time slot is already booked. Here are some available alternatives: Tuesday at 2:30 PM, Tuesday at 3:00 PM. Would you like to book one of these times instead?",
  "alternative_times": [
    "Tuesday, August 15 at 2:30 PM",
    "Tuesday, August 15 at 3:00 PM"
  ],
  "customer_id": 123
}
```

## 🔐 Security Considerations

- API endpoints don't require authentication for voice agents (designed for public access)
- Input validation on all parameters
- Phone number sanitization  
- Rate limiting recommended for production
- Audit logging for all voice agent actions

Your voice agent integration is now ready! The backend provides robust customer management and appointment scheduling with intelligent conflict resolution. 🎉
