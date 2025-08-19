"""
Google Calendar integration service for StreamlineAI
This service handles automatic syncing of appointments to Google Calendar
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

class GoogleCalendarService:
    """
    Google Calendar integration service with full API integration
    """
    
    def __init__(self):
        self.enabled = os.getenv('GOOGLE_CALENDAR_ENABLED', 'true').lower() == 'true'
        self.credentials_file = 'streamline-oauthcredentials.json'
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        self.redirect_uri = 'https://server.stream-lineai.com/auth/google/callback'
        
    def get_authorization_url(self) -> str:
        """
        Get the authorization URL for Google OAuth
        """
        try:
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=self.scopes,
                redirect_uri=self.redirect_uri
            )
            
            auth_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            
            return auth_url
            
        except Exception as e:
            logger.error(f"Error getting authorization URL: {str(e)}")
            return ""
    
    def exchange_code_for_tokens(self, authorization_code: str) -> Optional[Dict]:
        """
        Exchange authorization code for access and refresh tokens
        """
        try:
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=self.scopes,
                redirect_uri=self.redirect_uri
            )
            
            flow.fetch_token(code=authorization_code)
            
            credentials = flow.credentials
            
            return {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': credentials.expiry.isoformat() if credentials.expiry else None
            }
            
        except Exception as e:
            logger.error(f"Error exchanging authorization code: {str(e)}")
            return None
    
    def get_calendar_service(self, access_token: str, refresh_token: str):
        """
        Get authenticated Google Calendar service
        """
        try:
            # Load client secrets
            with open(self.credentials_file, 'r') as f:
                client_config = json.load(f)
            
            credentials = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri=client_config['web']['token_uri'],
                client_id=client_config['web']['client_id'],
                client_secret=client_config['web']['client_secret'],
                scopes=self.scopes
            )
            
            # Refresh token if needed
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
            
            service = build('calendar', 'v3', credentials=credentials)
            return service, credentials
            
        except Exception as e:
            logger.error(f"Error creating calendar service: {str(e)}")
            return None, None
        
    def generate_calendar_link(self, appointment_data: Dict[str, Any]) -> str:
        """
        Generate a Google Calendar event link for the appointment
        This creates a pre-filled "Add to Calendar" URL
        """
        try:
            # Extract appointment details
            title = appointment_data.get('title', 'StreamlineAI Appointment')
            description = appointment_data.get('description', '')
            notes = appointment_data.get('notes', '')
            customer_name = appointment_data.get('customer_name', 'Customer')
            customer_email = appointment_data.get('customer_email', '')
            meeting_type = appointment_data.get('meeting_type', 'video_call')
            duration_minutes = appointment_data.get('duration_minutes', 60)
            
            # Create datetime objects
            appointment_date = appointment_data.get('appointment_date')
            appointment_time = appointment_data.get('appointment_time')
            
            if isinstance(appointment_date, str):
                appointment_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
            if isinstance(appointment_time, str):
                appointment_time = datetime.strptime(appointment_time, '%H:%M:%S').time()
                
            # Combine date and time
            if appointment_time:
                start_datetime = datetime.combine(appointment_date, appointment_time)
            else:
                start_datetime = datetime.combine(appointment_date, datetime.min.time().replace(hour=9))
                
            end_datetime = start_datetime + timedelta(minutes=duration_minutes)
            
            # Format for Google Calendar (YYYYMMDDTHHMMSSZ)
            start_time = start_datetime.strftime('%Y%m%dT%H%M%S')
            end_time = end_datetime.strftime('%Y%m%dT%H%M%S')
            
            # Build event description
            event_description = f"{description}\\n\\n"
            event_description += f"Meeting Type: {meeting_type.replace('_', ' ').title()}\\n"
            event_description += f"Duration: {duration_minutes} minutes\\n"
            event_description += f"Customer: {customer_name}\\n"
            if notes:
                event_description += f"Notes: {notes}\\n"
            event_description += "\\nCreated by StreamlineAI"
            
            # Generate Google Calendar URL
            base_url = "https://calendar.google.com/calendar/render"
            params = [
                "action=TEMPLATE",
                f"text={self._url_encode(title)}",
                f"dates={start_time}/{end_time}",
                f"details={self._url_encode(event_description)}",
                f"location={self._url_encode('StreamlineAI Meeting')}"
            ]
            
            # Add attendee if email is available
            if customer_email:
                params.append(f"add={self._url_encode(customer_email)}")
                
            calendar_url = f"{base_url}?{'&'.join(params)}"
            
            logger.info(f"Generated Google Calendar link for appointment: {title}")
            return calendar_url
            
        except Exception as e:
            logger.error(f"Error generating Google Calendar link: {str(e)}")
            return ""
    
    def _url_encode(self, text: str) -> str:
        """URL encode text for Google Calendar URLs"""
        import urllib.parse
        return urllib.parse.quote(str(text))
    
    async def create_calendar_event(self, appointment_data: Dict[str, Any]) -> Optional[str]:
        """
        Create a calendar event (currently generates calendar link)
        Returns calendar link if successful, None if failed
        """
        if not self.enabled:
            logger.info("Google Calendar integration is disabled")
            return None
            
        # Generate calendar link for now
        calendar_link = self.generate_calendar_link(appointment_data)
        
        if calendar_link:
            logger.info(f"Google Calendar link generated: {calendar_link}")
            return calendar_link
        
        return None
    
    async def create_real_calendar_event(self, appointment_data: Dict[str, Any], access_token: str, refresh_token: str) -> Optional[str]:
        """
        Create a real calendar event using stored OAuth tokens
        This method would be used when you have user's OAuth tokens
        """
        try:
            service, credentials = self.get_calendar_service(access_token, refresh_token)
            if not service:
                logger.error("Failed to create calendar service")
                return None
            
            # Parse appointment data
            title = appointment_data.get('title', 'StreamlineAI Appointment')
            description = appointment_data.get('description', '')
            customer_name = appointment_data.get('customer_name', 'Customer')
            customer_email = appointment_data.get('customer_email', '')
            
            # Create datetime
            appointment_date = appointment_data.get('appointment_date')
            appointment_time = appointment_data.get('appointment_time')
            duration_minutes = appointment_data.get('duration_minutes', 60)
            
            if isinstance(appointment_date, str):
                appointment_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
            if isinstance(appointment_time, str):
                appointment_time = datetime.strptime(appointment_time, '%H:%M:%S').time()
            
            start_datetime = datetime.combine(appointment_date, appointment_time)
            end_datetime = start_datetime + timedelta(minutes=duration_minutes)
            
            # Create event
            event = {
                'summary': title,
                'description': description,
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'America/New_York',
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'America/New_York',
                },
                'attendees': [
                    {'email': customer_email}
                ] if customer_email else [],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 15},
                    ],
                },
            }
            
            # Insert event
            created_event = service.events().insert(calendarId='primary', body=event).execute()
            
            logger.info(f"Created Google Calendar event: {created_event['id']}")
            return created_event['id']
            
        except HttpError as error:
            logger.error(f"Google Calendar API error: {error}")
            return None
        except Exception as e:
            logger.error(f"Error creating calendar event: {str(e)}")
            return None
    
    async def update_calendar_event(self, event_id: str, appointment_data: Dict[str, Any]) -> bool:
        """
        Update a calendar event (placeholder for future OAuth implementation)
        """
        if not self.enabled:
            return False
            
        logger.info(f"Would update Google Calendar event: {event_id}")
        # In a full implementation, this would update the existing event
        return True
    
    async def delete_calendar_event(self, event_id: str) -> bool:
        """
        Delete a calendar event (placeholder for future OAuth implementation)
        """
        if not self.enabled:
            return False
            
        logger.info(f"Would delete Google Calendar event: {event_id}")
        # In a full implementation, this would delete the event
        return True

# Global instance
google_calendar_service = GoogleCalendarService()
