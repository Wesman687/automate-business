"""
Appointment helper utilities for managing scheduling and availability
"""
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta

from models import Appointment, User
from services.appointment_service import AppointmentService
from services.google_calendar_service import google_calendar_service
from services.email_service import email_service
from api.appointments import send_appointment_confirmation_email, send_appointment_update_email

logger = logging.getLogger(__name__)

class AppointmentHelper:
    """
    Helper class for appointment operations
    Can be used by API endpoints, voice bots, chat bots, etc.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.appointment_service = AppointmentService(db)
    
    async def create_appointment_with_notifications(
        self,
        customer_id: int,
        appointment_date: datetime.date,
        appointment_time: datetime.time,
        duration_minutes: int = 30,
        meeting_type: str = "consultation",
        notes: Optional[str] = None,
        title: str = "Business Consultation",
        description: str = "Automated appointment booking"
    ) -> Dict:
        """
        Create an appointment with automatic email and calendar integration
        Returns appointment data or conflict information
        """
        try:
            # Verify customer exists
            customer = self.db.query(User).filter(
                User.id == customer_id,
                User.user_type == 'customer'
            ).first()
            if not customer:
                return {
                    "success": False,
                    "error": "customer_not_found",
                    "message": "Customer not found"
                }
            
            # Combine date and time
            scheduled_datetime = datetime.combine(appointment_date, appointment_time)
            
            # Check for conflicts
            conflict_result = self.check_appointment_conflicts(
                scheduled_datetime, 
                duration_minutes
            )
            
            if not conflict_result["available"]:
                return {
                    "success": False,
                    "error": "time_conflict",
                    "message": conflict_result["message"],
                    "suggested_times": conflict_result["suggested_times"]
                }
            
            # Create the appointment
            appointment = self.appointment_service.create_appointment(
                customer_id=customer_id,
                scheduled_date=scheduled_datetime,
                appointment_type=meeting_type,
                duration_minutes=duration_minutes,
                customer_notes=notes,
                status="scheduled"
            )
            
            # Create Google Calendar event
            calendar_link = await self._create_calendar_event(
                appointment, customer, title, description
            )
            
            # Send confirmation email
            email_sent = await self._send_confirmation_email(
                appointment, customer, calendar_link
            )
            
            return {
                "success": True,
                "appointment": {
                    "id": appointment.id,
                    "customer_id": appointment.customer_id,
                    "customer_name": customer.name,
                    "customer_email": customer.email,
                    "appointment_date": appointment.scheduled_date.date().isoformat(),
                    "appointment_time": appointment.scheduled_date.time().strftime('%H:%M:%S'),
                    "duration_minutes": appointment.duration_minutes,
                    "meeting_type": appointment.appointment_type,
                    "status": appointment.status,
                    "notes": appointment.customer_notes,
                    "created_at": appointment.created_at.isoformat()
                },
                "calendar_link": calendar_link,
                "email_sent": email_sent
            }
            
        except Exception as e:
            logger.error(f"Error creating appointment: {str(e)}")
            return {
                "success": False,
                "error": "creation_failed",
                "message": f"Failed to create appointment: {str(e)}"
            }
    
    def check_appointment_conflicts(
        self, 
        scheduled_datetime: datetime, 
        duration_minutes: int = 30
    ) -> Dict:
        """
        Check if an appointment time conflicts with existing appointments
        Returns availability status and suggestions if not available
        """
        try:
            available_slots = self.appointment_service.get_available_slots(
                scheduled_datetime, 
                duration_minutes
            )
            
            requested_time = scheduled_datetime.replace(second=0, microsecond=0)
            
            if requested_time in available_slots:
                return {
                    "available": True,
                    "message": "Time slot is available"
                }
            else:
                # Find alternative suggestions
                suggested_times = self._get_alternative_times(
                    scheduled_datetime, 
                    duration_minutes
                )
                
                return {
                    "available": False,
                    "message": f"Time slot on {scheduled_datetime.strftime('%A, %B %d at %I:%M %p')} is not available",
                    "suggested_times": suggested_times
                }
                
        except Exception as e:
            logger.error(f"Error checking conflicts: {str(e)}")
            return {
                "available": False,
                "message": f"Error checking availability: {str(e)}",
                "suggested_times": []
            }
    
    def _get_alternative_times(
        self, 
        preferred_datetime: datetime, 
        duration_minutes: int,
        days_to_check: int = 7,
        max_suggestions: int = 5
    ) -> List[str]:
        """Get alternative appointment times"""
        suggestions = []
        
        for i in range(days_to_check):
            check_date = preferred_datetime + timedelta(days=i)
            available_slots = self.appointment_service.get_available_slots(
                check_date, 
                duration_minutes
            )
            
            for slot in available_slots:
                if len(suggestions) >= max_suggestions:
                    break
                    
                suggestions.append(slot.strftime('%A, %B %d at %I:%M %p'))
            
            if len(suggestions) >= max_suggestions:
                break
        
        return suggestions
    
    async def _create_calendar_event(
        self, 
        appointment: Appointment, 
        customer: User,
        title: str,
        description: str
    ) -> Optional[str]:
        """Create Google Calendar event for appointment"""
        try:
            calendar_data = {
                'title': title,
                'description': description,
                'appointment_date': appointment.scheduled_date.date().isoformat(),
                'appointment_time': appointment.scheduled_date.time().strftime('%H:%M:%S'),
                'duration_minutes': appointment.duration_minutes,
                'meeting_type': appointment.appointment_type,
                'customer_name': customer.name,
                'customer_email': customer.email,
                'notes': appointment.customer_notes
            }
            
            calendar_link = await google_calendar_service.create_calendar_event(calendar_data)
            if calendar_link:
                logger.info(f"Google Calendar link generated for appointment {appointment.id}")
                return calendar_link
            else:
                logger.warning(f"Failed to generate Google Calendar link for appointment {appointment.id}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating calendar event: {str(e)}")
            return None
    
    async def _send_confirmation_email(
        self, 
        appointment: Appointment, 
        customer: User,
        calendar_link: Optional[str] = None
    ) -> bool:
        """Send appointment confirmation email"""
        try:
            if not customer.email:
                logger.warning(f"No email address for customer {customer.name}")
                return False
                
            await send_appointment_confirmation_email(
                customer_name=customer.name,
                customer_email=customer.email,
                appointment_date=appointment.scheduled_date.date(),
                appointment_time=appointment.scheduled_date.time(),
                duration_minutes=appointment.duration_minutes,
                meeting_type=appointment.appointment_type,
                notes=appointment.customer_notes,
                calendar_link=calendar_link
            )
            
            logger.info(f"Confirmation email sent to {customer.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending confirmation email: {str(e)}")
            return False
    
    def get_recommended_times(
        self, 
        days_ahead: int = 7, 
        limit: int = 10
    ) -> List[Dict]:
        """Get recommended appointment times"""
        try:
            recommended = []
            today = datetime.now().date()
            
            # Priority hours (10AM, 2PM are most preferred)
            priority_hours = [10, 14, 15, 11, 16]
            
            for i in range(days_ahead):
                check_date = today + timedelta(days=i)
                check_datetime = datetime.combine(check_date, datetime.min.time())
                
                # Skip weekends
                if check_datetime.weekday() >= 5:
                    continue
                
                available_slots = self.appointment_service.get_available_slots(check_datetime)
                
                for hour in priority_hours:
                    if len(recommended) >= limit:
                        break
                        
                    for slot in available_slots:
                        if slot.hour == hour:
                            recommended.append({
                                "datetime": slot.isoformat(),
                                "date": slot.strftime('%Y-%m-%d'),
                                "time": slot.strftime('%H:%M'),
                                "display_date": slot.strftime('%A, %B %d'),
                                "display_time": slot.strftime('%I:%M %p'),
                                "display_full": slot.strftime('%A, %B %d at %I:%M %p'),
                                "priority": "high" if hour in [10, 14] else "medium"
                            })
                            break
                
                if len(recommended) >= limit:
                    break
            
            return recommended
            
        except Exception as e:
            logger.error(f"Error getting recommended times: {str(e)}")
            return []
    
    def get_customer_upcoming_appointments(self, customer_id: int) -> List[Dict]:
        """Get upcoming appointments for a customer"""
        try:
            appointments = self.appointment_service.get_customer_appointments(customer_id)
            upcoming = []
            
            now = datetime.now()
            
            for apt in appointments:
                if apt.scheduled_date > now and apt.status == "scheduled":
                    upcoming.append({
                        "id": apt.id,
                        "date": apt.scheduled_date.date().isoformat(),
                        "time": apt.scheduled_date.time().strftime('%H:%M'),
                        "display_full": apt.scheduled_date.strftime('%A, %B %d at %I:%M %p'),
                        "duration_minutes": apt.duration_minutes,
                        "meeting_type": apt.appointment_type,
                        "status": apt.status,
                        "notes": apt.customer_notes
                    })
            
            return upcoming
            
        except Exception as e:
            logger.error(f"Error getting customer appointments: {str(e)}")
            return []

# Convenience functions for easy access
async def create_appointment_easy(
    db: Session,
    customer_id: int,
    appointment_date: datetime.date,
    appointment_time: datetime.time,
    duration_minutes: int = 30,
    meeting_type: str = "consultation",
    notes: Optional[str] = None
) -> Dict:
    """
    Easy function to create an appointment with all integrations
    Perfect for voice bots and chat bots
    """
    helper = AppointmentHelper(db)
    return await helper.create_appointment_with_notifications(
        customer_id=customer_id,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        duration_minutes=duration_minutes,
        meeting_type=meeting_type,
        notes=notes
    )

def create_appointment_with_notifications(
    db: Session,
    customer_id: int,
    scheduled_date: datetime,
    duration_minutes: int = 30,
    appointment_type: str = "consultation",
    customer_notes: Optional[str] = None
):
    """
    Standalone function for creating appointments with notifications
    Compatible with voice agent requirements
    """
    from services.appointment_service import AppointmentService
    from models import Appointment
    import uuid
    
    asvc = AppointmentService(db)
    
    # Check if time is available
    if not asvc._is_time_available(scheduled_date, duration_minutes):
        raise ValueError("Time slot not available")
    
    # Create appointment
    appointment = Appointment(
        id=None,  # Will be auto-generated
        customer_id=customer_id,
        scheduled_date=scheduled_date,
        duration_minutes=duration_minutes,
        appointment_type=appointment_type,
        status="scheduled",
        customer_notes=customer_notes,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # TODO: Add email notification here if needed
    # send_appointment_confirmation_email(appointment, customer)
    
    return appointment

def get_available_times_easy(
    db: Session,
    target_date: datetime.date,
    duration_minutes: int = 30
) -> List[str]:
    """
    Easy function to get available times for a date
    Returns simple list of time strings
    """
    helper = AppointmentHelper(db)
    target_datetime = datetime.combine(target_date, datetime.min.time())
    
    available_slots = helper.appointment_service.get_available_slots(
        target_datetime, 
        duration_minutes
    )
    
    return [slot.strftime('%I:%M %p') for slot in available_slots]

def get_next_available_appointment(db: Session, days_ahead: int = 7) -> Optional[str]:
    """
    Get the next available appointment slot
    Returns formatted string or None
    """
    helper = AppointmentHelper(db)
    next_slot = helper.appointment_service.get_next_available_slot(days_ahead)
    
    if next_slot:
        return next_slot.strftime('%A, %B %d at %I:%M %p')
    return None
