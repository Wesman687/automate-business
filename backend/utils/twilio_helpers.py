"""
Twilio Integration Helper Functions for Voice Agent Single API
Provides utilities for processing speech input and generating TML responses
"""

from typing import Dict, Any, Optional, List
import re
from datetime import datetime, timedelta

class TwilioVoiceHelper:
    """Helper class for Twilio voice integration with the Voice Agent API"""
    
    # Intent keywords mapping
    INTENT_KEYWORDS = {
        "schedule_appointment": [
            "book", "schedule", "appointment", "meeting", "time", "date", 
            "reserve", "set up", "plan", "arrange"
        ],
        "get_customer_appointments": [
            "my appointments", "upcoming", "scheduled", "when", "what time",
            "check my", "view my", "show my"
        ],
        "reschedule_appointment": [
            "reschedule", "change", "move", "different time", "different date",
            "switch", "update"
        ],
        "delete_appointment": [
            "cancel", "delete", "remove", "unbook", "not coming"
        ],
        "jobs_lookup": [
            "projects", "jobs", "work", "status", "progress", "what's",
            "current", "active", "my job"
        ],
        "create_change_request": [
            "change", "modify", "update", "different", "request", "want to",
            "can you", "add", "remove", "fix"
        ],
        "list_change_requests": [
            "change requests", "my requests", "pending", "status", "what requests"
        ],
        "available_slots": [
            "available", "free", "open", "when can", "what times", "slots"
        ]
    }
    
    @staticmethod
    def extract_intent(speech_text: str) -> str:
        """Extract intent from speech text"""
        text_lower = speech_text.lower()
        
        # Check for each intent's keywords
        for intent, keywords in TwilioVoiceHelper.INTENT_KEYWORDS.items():
            if any(keyword in text_lower for keyword in keywords):
                return intent
        
        # Default to customer lookup if no specific intent found
        return "find_or_create_customer"
    
    @staticmethod
    def extract_date(speech_text: str) -> Optional[str]:
        """Extract date from speech text"""
        text_lower = speech_text.lower()
        
        # Common date patterns
        if "today" in text_lower:
            return datetime.now().strftime("%Y-%m-%d")
        if "tomorrow" in text_lower:
            return (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Day of week patterns
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        for i, day in enumerate(days):
            if day in text_lower:
                # Find next occurrence of this day
                today = datetime.now()
                days_ahead = (i - today.weekday()) % 7
                if days_ahead == 0:  # Today is the day
                    days_ahead = 7  # Get next week's
                target_date = today + timedelta(days=days_ahead)
                return target_date.strftime("%Y-%m-%d")
        
        # MM/DD or MM/DD/YYYY patterns
        date_match = re.search(r"(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?", speech_text)
        if date_match:
            month, day, year = date_match.groups()
            year = year or str(datetime.now().year)
            try:
                return f"{year}-{int(month):02d}-{int(day):02d}"
            except ValueError:
                pass
        
        return None
    
    @staticmethod
    def extract_time(speech_text: str) -> Optional[str]:
        """Extract time from speech text"""
        text_lower = speech_text.lower()
        
        # Time patterns with AM/PM
        time_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", text_lower)
        if time_match:
            hour, minute, period = time_match.groups()
            hour = int(hour)
            minute = int(minute or 0)
            
            if period == "pm" and hour != 12:
                hour += 12
            elif period == "am" and hour == 12:
                hour = 0
                
            return f"{hour:02d}:{minute:02d}"
        
        # 24-hour format
        time_match = re.search(r"(\d{1,2}):(\d{2})", speech_text)
        if time_match:
            hour, minute = time_match.groups()
            return f"{int(hour):02d}:{int(minute):02d}"
        
        # Common time expressions
        time_expressions = {
            "morning": "09:00",
            "afternoon": "14:00", 
            "evening": "18:00",
            "noon": "12:00",
            "midnight": "00:00"
        }
        
        for expr, time_val in time_expressions.items():
            if expr in text_lower:
                return time_val
        
        return None
    
    @staticmethod
    def extract_customer_info(speech_text: str) -> Dict[str, Optional[str]]:
        """Extract customer information from speech"""
        # Simple extraction - could be enhanced with NLP
        email_match = re.search(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", speech_text)
        phone_match = re.search(r"(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})", speech_text)
        
        return {
            "email": email_match.group(1) if email_match else None,
            "phone": phone_match.group(1) if phone_match else None,
            "name": None  # Would need more sophisticated NLP for name extraction
        }
    
    @staticmethod
    def build_api_request(speech_text: str, session_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Build complete API request from speech text"""
        session_data = session_data or {}
        
        intent = TwilioVoiceHelper.extract_intent(speech_text)
        customer_info = TwilioVoiceHelper.extract_customer_info(speech_text)
        
        # Base request
        request = {
            "intent": intent,
            "session_id": session_data.get("session_id")
        }
        
        # Add customer info from speech or session
        for field in ["name", "email", "phone"]:
            value = customer_info.get(field) or session_data.get(field)
            if value:
                request[field] = value
        
        # Add intent-specific parameters
        if intent in ["schedule_appointment", "reschedule_appointment"]:
            date = TwilioVoiceHelper.extract_date(speech_text)
            time = TwilioVoiceHelper.extract_time(speech_text)
            if date:
                request["preferred_date"] = date
            if time:
                request["preferred_time"] = time
        
        if intent == "create_change_request":
            # Extract change details (simplified)
            request["change_title"] = "Voice Request"
            request["change_description"] = speech_text
        
        return request

def generate_twiml_response(api_response: Dict[str, Any], 
                          continue_conversation: bool = True) -> str:
    """Generate TwiML response from Voice Agent API response"""
    speak_text = api_response.get("speak", "I'm sorry, I didn't understand that.")
    
    # Handle errors gracefully
    error = api_response.get("error")
    if error:
        if error == "not_found":
            speak_text += " Could you provide your email address?"
        elif error == "missing_date":
            speak_text += " Please tell me what day you'd prefer."
        elif error == "outside_hours":
            alternatives = api_response.get("alternatives", [])
            if alternatives:
                speak_text += f" Would {alternatives[0]} work instead?"
    
    # Build TwiML
    twiml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Response>'
    ]
    
    # Add the speak response
    twiml_parts.append(f'<Say voice="alice">{speak_text}</Say>')
    
    # Continue conversation if needed
    if continue_conversation and not api_response.get("error"):
        twiml_parts.append('<Gather input="speech" timeout="5" speechTimeout="auto">')
        twiml_parts.append('<Say voice="alice">Is there anything else I can help you with?</Say>')
        twiml_parts.append('</Gather>')
    
    twiml_parts.append('</Response>')
    
    return '\n'.join(twiml_parts)

# Example Twilio function for integration
TWILIO_FUNCTION_EXAMPLE = '''
const axios = require('axios');

exports.handler = function(context, event, callback) {
    const speechText = event.SpeechResult || event.Body || '';
    const sessionId = event.From; // Use phone number as session ID
    
    // Get existing session data
    const sessionData = {
        session_id: sessionId,
        name: context.CUSTOMER_NAME,
        email: context.CUSTOMER_EMAIL,
        phone: event.From
    };
    
    // Build API request (you'd implement the helper functions)
    const apiRequest = buildApiRequest(speechText, sessionData);
    
    // Call Voice Agent API
    axios.post('https://your-domain.com/api/voice/agent', apiRequest, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_SECRET'
        }
    })
    .then(response => {
        const twimlResponse = generateTwimlResponse(response.data);
        
        // Store session data if customer info was found
        const customer = response.data.customer;
        if (customer) {
            context.CUSTOMER_NAME = customer.name;
            context.CUSTOMER_EMAIL = customer.email;
        }
        
        callback(null, twimlResponse);
    })
    .catch(error => {
        console.error('Voice Agent API Error:', error);
        
        const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, I'm having trouble right now. Please try again later.</Say>
</Response>`;
        
        callback(null, errorTwiml);
    });
};
'''
