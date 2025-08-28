from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Optional
from datetime import datetime, date, time, timedelta
from database import get_db
from models import Appointment, User
from services.appointment_service import AppointmentService
from services.google_calendar_service import google_calendar_service
from services.email_service import email_service
from api.auth import get_current_user
from pydantic import BaseModel
import logging

router = APIRouter(prefix="/appointments")
logger = logging.getLogger(__name__)

async def send_appointment_confirmation_email(
    customer_name: str,
    customer_email: str,
    appointment_date: date,
    appointment_time: time,
    duration_minutes: int,
    meeting_type: str,
    notes: Optional[str] = None,
    calendar_link: Optional[str] = None
):
    """
    Send appointment confirmation email to customer
    """
    try:
        # Format the appointment details
        formatted_date = appointment_date.strftime('%A, %B %d, %Y')
        formatted_time = appointment_time.strftime('%I:%M %p')
        meeting_type_display = meeting_type.replace('_', ' ').title()
        
        # Email subject
        subject = f"Appointment Confirmation - {formatted_date} at {formatted_time}"
        
        # Email body (plain text)
        body = f"""
Dear {customer_name},

Thank you for scheduling an appointment with StreamlineAI! We truly appreciate your business and look forward to working with you to streamline and automate your business processes.

APPOINTMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: {formatted_date}
🕐 Time: {formatted_time}
⏱️  Duration: {duration_minutes} minutes
💻 Meeting Type: {meeting_type_display}
{f'📝 Notes: {notes}' if notes else ''}

WHAT TO EXPECT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
During our consultation, we'll discuss:
• Your current business processes and pain points
• Automation opportunities tailored to your needs
• Custom solutions to increase efficiency and productivity
• Next steps for implementing streamlined workflows

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mark your calendar - We've included an "Add to Calendar" link below
2. Prepare any questions about your business processes
3. Have details about your current workflows ready to discuss

{f'📅 ADD TO YOUR CALENDAR: {calendar_link}' if calendar_link else ''}

We're excited to help transform your business operations and look forward to our upcoming meeting!

If you need to reschedule or have any questions before our appointment, please don't hesitate to reach out.

Best regards,
The StreamlineAI Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
StreamlineAI - Automating Your Success
🌐 Website: https://stream-lineai.com
📧 Email: sales@stream-lineai.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

        # HTML email body
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .header p {{ margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }}
                .content {{ padding: 40px 30px; }}
                .greeting {{ font-size: 18px; color: #333; margin-bottom: 25px; line-height: 1.5; }}
                .section {{ margin: 30px 0; }}
                .section-title {{ font-size: 16px; font-weight: 600; color: #00d4ff; margin-bottom: 15px; border-bottom: 2px solid #00d4ff; padding-bottom: 5px; }}
                .details-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .detail-item {{ display: flex; align-items: center; margin: 10px 0; font-size: 15px; }}
                .detail-icon {{ font-size: 18px; margin-right: 12px; min-width: 25px; }}
                .detail-text {{ color: #4a5568; }}
                .calendar-button {{ display: inline-block; background: #00d4ff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }}
                .calendar-button:hover {{ background: #0099cc; }}
                .expectations {{ background: #f0f9ff; border-left: 4px solid #00d4ff; padding: 20px; margin: 20px 0; }}
                .expectations ul {{ margin: 10px 0; padding-left: 20px; }}
                .expectations li {{ margin: 8px 0; color: #4a5568; }}
                .footer {{ background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }}
                .footer-links {{ margin: 15px 0; }}
                .footer-links a {{ color: #00d4ff; text-decoration: none; margin: 0 10px; }}
                .logo {{ font-size: 20px; font-weight: 700; color: #00d4ff; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Appointment Confirmed!</h1>
                    <p>We're excited to help streamline your business</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Dear <strong>{customer_name}</strong>,
                        <br><br>
                        Thank you for scheduling an appointment with <strong>StreamlineAI</strong>! We truly appreciate your business and look forward to working with you to transform and automate your business processes.
                    </div>
                    
                    <div class="section">
                        <div class="section-title">📅 Appointment Details</div>
                        <div class="details-box">
                            <div class="detail-item">
                                <span class="detail-icon">📅</span>
                                <span class="detail-text"><strong>Date:</strong> {formatted_date}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">🕐</span>
                                <span class="detail-text"><strong>Time:</strong> {formatted_time}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">⏱️</span>
                                <span class="detail-text"><strong>Duration:</strong> {duration_minutes} minutes</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">💻</span>
                                <span class="detail-text"><strong>Meeting Type:</strong> {meeting_type_display}</span>
                            </div>
                            {f'<div class="detail-item"><span class="detail-icon">📝</span><span class="detail-text"><strong>Notes:</strong> {notes}</span></div>' if notes else ''}
                        </div>
                        
                        {f'<div style="text-align: center;"><a href="{calendar_link}" class="calendar-button">📅 Add to Google Calendar</a></div>' if calendar_link else ''}
                    </div>
                    
                    <div class="section">
                        <div class="section-title">🎯 What to Expect</div>
                        <div class="expectations">
                            During our consultation, we'll discuss:
                            <ul>
                                <li>Your current business processes and pain points</li>
                                <li>Automation opportunities tailored to your specific needs</li>
                                <li>Custom solutions to increase efficiency and productivity</li>
                                <li>Next steps for implementing streamlined workflows</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">✅ Next Steps</div>
                        <div style="color: #4a5568; line-height: 1.6;">
                            <strong>1.</strong> Mark your calendar using the button above<br>
                            <strong>2.</strong> Prepare any questions about your business processes<br>
                            <strong>3.</strong> Have details about your current workflows ready to discuss
                        </div>
                    </div>
                    
                    <div style="background: #f0f9ff; border: 1px solid #00d4ff; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0; color: #0066cc; font-weight: 600;">
                            We're excited to help transform your business operations!
                        </p>
                        <p style="margin: 10px 0 0 0; color: #4a5568;">
                            If you need to reschedule or have questions, please contact us anytime.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="logo">StreamlineAI</div>
                    <p style="margin: 5px 0; color: #718096; font-size: 14px;">Automating Your Success</p>
                    <div class="footer-links">
                        <a href="https://stream-lineai.com">🌐 Website</a>
                        <a href="mailto:tech@stream-lineai.com">📧 Contact</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email
        success = email_service.send_email(
            from_account='no-reply',
            to_emails=[customer_email],
            subject=subject,
            body=body,
            html_body=html_body
        )
        
        return success
        
    except Exception as e:
        logger.error(f"Error sending appointment confirmation email: {str(e)}")
        return False

async def send_appointment_update_email(
    customer_name: str,
    customer_email: str,
    appointment_date: date,
    appointment_time: time,
    duration_minutes: int,
    meeting_type: str,
    notes: Optional[str] = None,
    calendar_link: Optional[str] = None
):
    """
    Send appointment update notification email to customer
    """
    try:
        # Format the appointment details
        formatted_date = appointment_date.strftime('%A, %B %d, %Y')
        formatted_time = appointment_time.strftime('%I:%M %p')
        meeting_type_display = meeting_type.replace('_', ' ').title()
        
        # Email subject
        subject = f"Appointment Updated - {formatted_date} at {formatted_time}"
        
        # Email body (plain text)
        body = f"""
Dear {customer_name},

Your StreamlineAI appointment has been updated. Please review the new details below:

UPDATED APPOINTMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: {formatted_date}
🕐 Time: {formatted_time}
⏱️  Duration: {duration_minutes} minutes
💻 Meeting Type: {meeting_type_display}
{f'📝 Notes: {notes}' if notes else ''}

{f'📅 ADD TO YOUR CALENDAR: {calendar_link}' if calendar_link else ''}

We look forward to our upcoming meeting and appreciate your flexibility with this schedule change.

If you have any questions or concerns about this update, please don't hesitate to contact us.

Best regards,
The StreamlineAI Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
StreamlineAI - Automating Your Success
🌐 Website: https://stream-lineai.com
📧 Email: sales@stream-lineai.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

        # HTML email body
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
                .header p {{ margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }}
                .content {{ padding: 40px 30px; }}
                .greeting {{ font-size: 18px; color: #333; margin-bottom: 25px; line-height: 1.5; }}
                .section {{ margin: 30px 0; }}
                .section-title {{ font-size: 16px; font-weight: 600; color: #f39c12; margin-bottom: 15px; border-bottom: 2px solid #f39c12; padding-bottom: 5px; }}
                .details-box {{ background: #fff5e6; border: 1px solid #f39c12; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .detail-item {{ display: flex; align-items: center; margin: 10px 0; font-size: 15px; }}
                .detail-icon {{ font-size: 18px; margin-right: 12px; min-width: 25px; }}
                .detail-text {{ color: #4a5568; }}
                .calendar-button {{ display: inline-block; background: #f39c12; color: white; padding: 15px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; text-align: center; }}
                .calendar-button:hover {{ background: #e67e22; }}
                .footer {{ background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }}
                .footer-links {{ margin: 15px 0; }}
                .footer-links a {{ color: #f39c12; text-decoration: none; margin: 0 10px; }}
                .logo {{ font-size: 20px; font-weight: 700; color: #f39c12; }}
                .update-notice {{ background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Appointment Updated</h1>
                    <p>Your appointment details have been changed</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Dear <strong>{customer_name}</strong>,
                        <br><br>
                        Your <strong>StreamlineAI</strong> appointment has been updated. Please review the new details below and update your calendar accordingly.
                    </div>
                    
                    <div class="update-notice">
                        <p style="margin: 0; color: #856404; font-weight: 600;">
                            ⚠️ Please note the updated appointment details
                        </p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">📅 Updated Appointment Details</div>
                        <div class="details-box">
                            <div class="detail-item">
                                <span class="detail-icon">📅</span>
                                <span class="detail-text"><strong>Date:</strong> {formatted_date}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">🕐</span>
                                <span class="detail-text"><strong>Time:</strong> {formatted_time}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">⏱️</span>
                                <span class="detail-text"><strong>Duration:</strong> {duration_minutes} minutes</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-icon">💻</span>
                                <span class="detail-text"><strong>Meeting Type:</strong> {meeting_type_display}</span>
                            </div>
                            {f'<div class="detail-item"><span class="detail-icon">📝</span><span class="detail-text"><strong>Notes:</strong> {notes}</span></div>' if notes else ''}
                        </div>
                        
                        {f'<div style="text-align: center;"><a href="{calendar_link}" class="calendar-button">📅 Update Your Calendar</a></div>' if calendar_link else ''}
                    </div>
                    
                    <div style="background: #f0f9ff; border: 1px solid #00d4ff; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="margin: 0; color: #0066cc; font-weight: 600;">
                            Thank you for your flexibility with this schedule change!
                        </p>
                        <p style="margin: 10px 0 0 0; color: #4a5568;">
                            If you have any questions or concerns about this update, please contact us anytime.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="logo">StreamlineAI</div>
                    <p style="margin: 5px 0; color: #718096; font-size: 14px;">Automating Your Success</p>
                    <div class="footer-links">
                        <a href="https://stream-lineai.com">🌐 Website</a>
                        <a href="mailto:tech@stream-lineai.com">📧 Contact</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email
        success = email_service.send_email(
            from_account='no-reply',
            to_emails=[customer_email],
            subject=subject,
            body=body,
            html_body=html_body
        )
        
        return success
        
    except Exception as e:
        logger.error(f"Error sending appointment update email: {str(e)}")
        return False



# Pydantic models for API
class AppointmentCreate(BaseModel):
    customer_id: int
    title: str
    description: Optional[str] = None
    appointment_date: date
    appointment_time: Optional[time] = None
    duration_minutes: Optional[int] = 60
    meeting_type: Optional[str] = 'video_call'  # video_call, phone_call, in_person
    status: Optional[str] = 'scheduled'
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    customer_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    meeting_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_email: str
    title: str
    description: Optional[str]
    appointment_date: str
    appointment_time: Optional[str]
    duration_minutes: int
    meeting_type: str
    status: str
    notes: Optional[str]
    created_at: str

# JSON API endpoints for voice AI and frontend integration
@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    upcoming: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get appointments - Admin sees all/filtered, customers see only their own"""
    try:
        appointment_service = AppointmentService(db)
        
        # Check user authorization
        is_admin = current_user.get('is_admin', False)
        user_type = current_user.get('user_type')
        user_id = current_user.get('user_id')
        
        logger.info(f"🔍 Appointments endpoint - User: {current_user}")
        logger.info(f"🔍 Is admin: {is_admin}, User type: {user_type}, User ID: {user_id}")
        
        try:
            if is_admin:
                # Admin can see appointments with any filters
                if upcoming:
                    logger.info("Getting upcoming appointments for admin")
                    appointments = appointment_service.get_upcoming_appointments()
                elif customer_id:
                    logger.info(f"Getting appointments for customer {customer_id}")
                    appointments = appointment_service.get_customer_appointments(customer_id)
                elif start_date and end_date:
                    logger.info(f"Getting appointments between {start_date} and {end_date}")
                    start = datetime.strptime(start_date, '%Y-%m-%d').date()
                    end = datetime.strptime(end_date, '%Y-%m-%d').date()
                    appointments = appointment_service.get_appointments_by_date_range(start, end)
                else:
                    logger.info("Getting all appointments for admin")
                    appointments = appointment_service.get_all_appointments()  # Get ALL appointments for admin
            elif user_type == "customer" and user_id:
                logger.info(f"Getting appointments for customer {user_id}")
                appointments = appointment_service.get_customer_appointments(user_id)
            else:
                raise HTTPException(status_code=403, detail="Access denied")
                
            logger.info(f"Found {len(appointments)} appointments")
        except Exception as e:
            logger.error(f"Error fetching appointments: {str(e)}")
            raise
        
        # Convert to response format
        result = []
        try:
            for appointment in appointments:
                try:
                    customer = appointment.customer
                    result.append({
                        "id": appointment.id,
                        "customer_id": appointment.customer_id,
                        "customer_name": customer.name if customer else "Unknown",
                        "customer_email": customer.email if customer else "unknown@email.com",
                        "title": f"Consultation - {customer.name if customer else 'Unknown'}",
                        "description": appointment.customer_notes or "Business automation consultation",
                        "appointment_date": appointment.scheduled_date.date().isoformat(),
                        "appointment_time": appointment.scheduled_date.time().strftime('%H:%M:%S'),
                        "duration_minutes": appointment.duration_minutes,
                        "meeting_type": appointment.appointment_type,
                        "status": appointment.status,
                        "notes": appointment.customer_notes,
                        "created_at": appointment.created_at.isoformat() if appointment.created_at else None
                    })
                except Exception as e:
                    logger.error(f"Error processing appointment {appointment.id}: {str(e)}")
                    continue
        except Exception as e:
            logger.error(f"Error converting appointments to response format: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process appointments")
            
        return result
        
    except Exception as e:
        logger.error(f"Error fetching appointments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointments")

@router.get("/smart-slots")
async def get_smart_appointment_slots(
    preferred_date: str = None,
    duration_minutes: int = 30,
    days_ahead: int = 14,
    db: Session = Depends(get_db)
):
    """Get smart appointment recommendations with available dates and times"""
    try:
        appointment_service = AppointmentService(db)
        
        # If no preferred date, start from today
        if preferred_date:
            try:
                start_date = datetime.strptime(preferred_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        else:
            start_date = datetime.now()
        
        # Get available dates and times for the next N days
        available_dates = []
        recommended_times = []
        next_available = None
        
        for i in range(days_ahead):
            check_date = start_date + timedelta(days=i)
            available_slots = appointment_service.get_available_slots(check_date, duration_minutes)
            
            if available_slots:
                # Format date info
                date_str = check_date.strftime('%Y-%m-%d')
                day_name = check_date.strftime('%A')
                formatted_date = check_date.strftime('%B %d, %Y')
                
                # Create time slots for this date
                time_slots = []
                for slot in available_slots:
                    time_str = slot.strftime('%H:%M')
                    display_time = slot.strftime('%I:%M %p')
                    
                    # Add helpful labels for better recommendations
                    hour = slot.hour
                    if hour == 9:
                        label = "Early Morning"
                    elif hour == 10:
                        label = "Mid Morning"  # Preferred
                    elif hour == 11:
                        label = "Late Morning"
                    elif hour == 12:
                        label = "Lunch Time"
                    elif hour == 13:
                        label = "Early Afternoon"  # Preferred
                    elif hour == 14:
                        label = "Afternoon"  # Preferred
                    elif hour == 15:
                        label = "Mid Afternoon"
                    elif hour == 16:
                        label = "Late Afternoon"  # Preferred
                    elif hour == 17:
                        label = "Evening"  # Preferred
                    else:
                        label = ""
                    
                    time_slot = {
                        "time": time_str,
                        "display_time": display_time,
                        "label": label,
                        "datetime": slot.isoformat(),
                        "date": date_str,
                        "is_next_available": False
                    }
                    time_slots.append(time_slot)
                    
                    # Mark the very first available slot
                    if next_available is None:
                        next_available = time_slot.copy()
                        time_slot["is_next_available"] = True
                
                # Filter time slots for better calendar display
                # Show preferred times first, then fill with others if needed
                preferred_hours = [10, 13, 14, 16, 17]  # 10 AM, 1 PM, 2 PM, 4 PM, 5 PM
                calendar_time_slots = []
                
                # First, add preferred times
                for time_slot in time_slots:
                    slot_hour = int(time_slot["time"].split(':')[0])
                    if slot_hour in preferred_hours:
                        calendar_time_slots.append(time_slot)
                
                # If we have fewer than 4 preferred times, add others to fill up
                if len(calendar_time_slots) < 4:
                    for time_slot in time_slots:
                        if time_slot not in calendar_time_slots and len(calendar_time_slots) < 6:
                            calendar_time_slots.append(time_slot)
                
                # Sort calendar time slots by time
                calendar_time_slots.sort(key=lambda x: int(x["time"].split(':')[0]))
                
                available_dates.append({
                    "date": date_str,
                    "day_name": day_name,
                    "formatted_date": formatted_date,
                    "is_today": check_date.date() == datetime.now().date(),
                    "is_tomorrow": check_date.date() == (datetime.now() + timedelta(days=1)).date(),
                    "slots_count": len(time_slots),  # Total available slots
                    "time_slots": calendar_time_slots  # Filtered slots for display
                })
                
                # Add to recommended times with better distribution
                # Prefer morning (10 AM), afternoon (1-2 PM), and late afternoon (4-5 PM)
                preferred_hours = [10, 13, 14, 16, 17]  # 10 AM, 1 PM, 2 PM, 4 PM, 5 PM
                
                # Add preferred times from this date
                for time_slot in time_slots:
                    slot_hour = int(time_slot["time"].split(':')[0])
                    if slot_hour in preferred_hours and len(recommended_times) < 12:
                        recommended_times.append(time_slot)
        
        # Sort recommended times by preference: morning first, then afternoon, then late afternoon
        def get_time_priority(time_slot):
            hour = int(time_slot["time"].split(':')[0])
            if hour == 10:  # Morning
                return 1
            elif hour in [13, 14]:  # Early afternoon  
                return 2
            elif hour in [16, 17]:  # Late afternoon
                return 3
            else:
                return 4
        
        recommended_times.sort(key=get_time_priority)
        
        # Limit recommended times to top 9 (3 per time period)
        recommended_times = recommended_times[:9]
        
        return {
            "success": True,
            "next_available": next_available,
            "available_dates": available_dates,
            "recommended_times": recommended_times,
            "total_available_dates": len(available_dates),
            "search_period_days": days_ahead
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting smart slots: {str(e)}")

@router.get("/available-slots")
async def get_available_slots(
    date: str,
    duration_minutes: int = 30,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get available appointment slots for a specific date"""
    try:
        # Parse the date string
        try:
            appointment_date = datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        appointment_service = AppointmentService(db)
        available_slots = appointment_service.get_available_slots(appointment_date, duration_minutes)
        
        # Convert to recommended time slots with labels
        recommended_times = []
        
        for slot in available_slots:
            time_str = slot.strftime('%H:%M')
            display_time = slot.strftime('%I:%M %p')
            
            # Add helpful labels for common times
            label = ""
            hour = slot.hour
            if hour == 9:
                label = "Early Morning"
            elif hour == 10:
                label = "Morning"
            elif hour == 11:
                label = "Late Morning"
            elif hour == 12:
                label = "Lunch Time"
            elif hour == 13:
                label = "Early Afternoon"
            elif hour == 14:
                label = "Afternoon"
            elif hour == 15:
                label = "Mid Afternoon"
            elif hour == 16:
                label = "Late Afternoon"
            
            recommended_times.append({
                "time": time_str,
                "display_time": display_time,
                "label": label,
                "datetime": slot.isoformat(),
                "available": True
            })
        
        # Add some unavailable slots for context (already booked times)
        booked_appointments = db.query(Appointment).filter(
            Appointment.scheduled_date >= appointment_date.replace(hour=0, minute=0, second=0),
            Appointment.scheduled_date < appointment_date.replace(hour=23, minute=59, second=59),
            Appointment.status == "scheduled"
        ).all()
        
        booked_times = []
        for apt in booked_appointments:
            booked_times.append({
                "time": apt.scheduled_date.strftime('%H:%M'),
                "display_time": apt.scheduled_date.strftime('%I:%M %p'),
                "label": "Booked",
                "datetime": apt.scheduled_date.isoformat(),
                "available": False
            })
        
        return {
            "date": date,
            "duration_minutes": duration_minutes,
            "recommended_times": recommended_times,
            "booked_times": booked_times,
            "total_available": len(recommended_times)
        }
        
    except Exception as e:
        logger.error(f"Error getting available slots: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get available slots")

@router.get("/recommended-times")
async def get_recommended_times(
    days_ahead: int = 7,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get recommended appointment times for the next few days"""
    try:
        appointment_service = AppointmentService(db)
        recommended = []
        
        today = datetime.now().date()
        
        for i in range(days_ahead):
            check_date = today + timedelta(days=i)
            check_datetime = datetime.combine(check_date, datetime.min.time())
            
            # Skip weekends
            if check_datetime.weekday() >= 5:
                continue
                
            available_slots = appointment_service.get_available_slots(check_datetime)
            
            # Prioritize certain times
            priority_hours = [10, 14, 15, 11, 16]  # 10AM, 2PM, 3PM, 11AM, 4PM
            
            for hour in priority_hours:
                for slot in available_slots:
                    if slot.hour == hour and len(recommended) < limit:
                        recommended.append({
                            "datetime": slot.isoformat(),
                            "date": slot.strftime('%Y-%m-%d'),
                            "time": slot.strftime('%H:%M'),
                            "display_date": slot.strftime('%A, %B %d'),
                            "display_time": slot.strftime('%I:%M %p'),
                            "display_full": slot.strftime('%A, %B %d at %I:%M %p'),
                            "priority": "high" if hour in [10, 14] else "medium"
                        })
        
        return {
            "recommended_times": recommended,
            "total_recommended": len(recommended),
            "days_checked": days_ahead
        }
        
    except Exception as e:
        logger.error(f"Error getting recommended times: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get recommended times")

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate,
    force: bool = False,  # Add force parameter for admin override
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new appointment with optional conflict checking"""
    try:
        # Verify customer exists
        customer = db.query(User).filter(
            User.id == appointment_data.customer_id,
            User.user_type == 'customer'
        ).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Security check: customers can only create appointments for themselves
        if current_user.get("user_type") == "customer":
            if current_user.get("user_id") != appointment_data.customer_id:
                raise HTTPException(status_code=403, detail="Customers can only create appointments for themselves")
        
        appointment_service = AppointmentService(db)
        
        # Combine date and time for scheduled_date
        if appointment_data.appointment_time:
            scheduled_datetime = datetime.combine(
                appointment_data.appointment_date, 
                appointment_data.appointment_time
            )
        else:
            # Default to 2 PM if no time specified
            scheduled_datetime = datetime.combine(
                appointment_data.appointment_date, 
                time(14, 0)  # 2:00 PM
            )
        
        # Only check conflicts if not forcing (for admin users)
        if not force:
            # Check for exact time conflicts only
            existing_appointment = appointment_service.db.query(Appointment).filter(
                Appointment.scheduled_date == scheduled_datetime,
                Appointment.status == "scheduled"
            ).first()
            
            if existing_appointment:
                # Find alternative times as suggestions
                next_available = []
                for i in range(7):  # Check next 7 days
                    future_date = scheduled_datetime + timedelta(days=i)
                    future_slots = appointment_service.get_available_slots(future_date, appointment_data.duration_minutes)
                    next_available.extend(future_slots[:3])  # Add up to 3 slots per day
                    if len(next_available) >= 5:  # Limit to 5 suggestions
                        break
                
                next_available = next_available[:5]  # Limit to 5 suggestions
                suggestion_strings = [slot.strftime('%A, %B %d at %I:%M %p') for slot in next_available]
                
                raise HTTPException(
                    status_code=409, 
                    detail={
                        "error": "Time slot not available",
                        "message": f"Another appointment is already scheduled at {scheduled_datetime.strftime('%A, %B %d at %I:%M %p')}.",
                        "suggested_times": suggestion_strings
                    }
                )
        
        # Create appointment using the service (force creation for admin users)
        appointment = appointment_service.create_appointment(
            customer_id=appointment_data.customer_id,
            scheduled_date=scheduled_datetime,
            appointment_type=appointment_data.meeting_type,
            duration_minutes=appointment_data.duration_minutes,
            customer_notes=appointment_data.notes,
            status=appointment_data.status,
            force_create=force  # Use the force parameter
        )
        
        # Create Google Calendar event
        calendar_link = None
        try:
            calendar_data = {
                'title': appointment_data.title,
                'description': appointment_data.description,
                'appointment_date': appointment_data.appointment_date.isoformat(),
                'appointment_time': appointment_data.appointment_time.strftime('%H:%M:%S') if appointment_data.appointment_time else '14:00:00',
                'duration_minutes': appointment_data.duration_minutes,
                'meeting_type': appointment_data.meeting_type,
                'customer_name': customer.name,
                'customer_email': customer.email,
                'notes': appointment_data.notes
            }
            
            calendar_link = await google_calendar_service.create_calendar_event(calendar_data)
            if calendar_link:
                logger.info(f"Google Calendar link generated for appointment {appointment.id}: {calendar_link}")
            else:
                logger.warning(f"Failed to generate Google Calendar link for appointment {appointment.id}")
                
        except Exception as calendar_error:
            logger.error(f"Error creating Google Calendar event: {str(calendar_error)}")
            # Don't fail the appointment creation if calendar sync fails
        
        # Send appointment confirmation email
        try:
            if customer.email:
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
                logger.info(f"Appointment confirmation email sent to {customer.email}")
            else:
                logger.warning(f"No email address for customer {customer.name} - confirmation email not sent")
        except Exception as email_error:
            logger.error(f"Error sending appointment confirmation email: {str(email_error)}")
            # Don't fail the appointment creation if email fails
        
        return {
            "id": appointment.id,
            "customer_id": appointment.customer_id,
            "customer_name": customer.name,
            "customer_email": customer.email,
            "title": appointment_data.title,
            "description": appointment_data.description,
            "appointment_date": appointment.scheduled_date.date().isoformat(),
            "appointment_time": appointment.scheduled_date.time().strftime('%H:%M:%S'),
            "duration_minutes": appointment.duration_minutes,
            "meeting_type": appointment.appointment_type,
            "status": appointment.status,
            "notes": appointment.customer_notes,
            "created_at": appointment.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create appointment")

@router.get("/customer")
async def get_customer_appointments(
    customer_id: Optional[int] = None,  # Allow specifying customer ID for admin access
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get appointments for the currently authenticated customer or specified customer (admin only)"""
    
    try:
        # Check user authorization
        is_admin = current_user.get('is_admin', False)
        user_type = current_user.get('user_type')
        user_id = current_user.get('user_id')
        
        print(f"📝 Customer appointments endpoint - User: {current_user}")
        print(f"📝 Is admin: {is_admin}, User type: {user_type}, User ID: {user_id}")
        
        # Determine which customer's appointments to fetch
        target_customer_id = None
        
        if is_admin:
            # Admins can see any customer's appointments
            if customer_id:
                target_customer_id = customer_id
            else:
                # If no customer_id specified, return empty list for admin
                return []
        elif user_type == "customer" and user_id:
            # Customers can only see their own appointments
            target_customer_id = user_id
        else:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not target_customer_id:
            raise HTTPException(status_code=400, detail="Customer ID required")
        
        # Get appointments for the target customer
        appointment_service = AppointmentService(db)
        appointments = appointment_service.get_customer_appointments(target_customer_id)
        
        print(f"📝 Fetching appointments for customer ID: {target_customer_id}")
        print(f"📝 Found {len(appointments) if appointments else 0} appointments")
        
        # Convert to response format (same as main appointments endpoint)
        result = []
        try:
            for appointment in appointments:
                try:
                    customer = appointment.customer if hasattr(appointment, 'customer') else db.query(User).filter(
                        User.id == appointment.customer_id,
                        User.user_type == 'customer'
                    ).first()
                    
                    result.append({
                        "id": appointment.id,
                        "customer_id": appointment.customer_id,
                        "customer_name": customer.name if customer else "Unknown",
                        "customer_email": customer.email if customer else "unknown@email.com",
                        "title": f"Consultation - {customer.name if customer else 'Unknown'}",
                        "description": appointment.customer_notes or "Business automation consultation",
                        "appointment_date": appointment.scheduled_date.date().isoformat(),
                        "appointment_time": appointment.scheduled_date.time().strftime('%H:%M:%S'),
                        "duration_minutes": appointment.duration_minutes,
                        "meeting_type": appointment.appointment_type,
                        "status": appointment.status,
                        "notes": appointment.customer_notes,
                        "created_at": appointment.created_at.isoformat() if appointment.created_at else None
                    })
                except Exception as e:
                    logger.error(f"Error processing appointment {appointment.id}: {str(e)}")
                    continue
        except Exception as e:
            logger.error(f"Error converting appointments to response format: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process appointments")
        
        return {"appointments": result}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_customer_appointments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific appointment - Admin can view any, customers can view only their own"""
    try:
        appointment_service = AppointmentService(db)
        appointment = appointment_service.get_appointment(appointment_id)
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Check user authorization
        is_admin = current_user.get('is_admin', False)
        user_type = current_user.get('user_type')
        user_id = current_user.get('user_id')
        
        
        # Authorization check
        if not is_admin and (user_type != "customer" or user_id != appointment.customer_id):
            raise HTTPException(status_code=403, detail="Access denied - can only view your own appointments")
            
        customer = db.query(User).filter(
            User.id == appointment.customer_id,
            User.user_type == 'customer'
        ).first()
        
        return {
            "id": appointment.id,
            "customer_id": appointment.customer_id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_email": customer.email if customer else "unknown@email.com",
            "title": f"Consultation - {customer.name if customer else 'Unknown'}",
            "description": appointment.customer_notes or "Business automation consultation",
            "appointment_date": appointment.scheduled_date.date().isoformat(),
            "appointment_time": appointment.scheduled_date.time().strftime('%H:%M:%S'),
            "duration_minutes": appointment.duration_minutes,
            "meeting_type": appointment.appointment_type,
            "status": appointment.status,
            "notes": appointment.customer_notes,
            "created_at": appointment.created_at.isoformat() if appointment.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointment")

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing appointment - Admin can update any, customers can update only their own"""
    try:
        appointment_service = AppointmentService(db)
        appointment = appointment_service.get_appointment(appointment_id)
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Check user authorization
        is_admin = current_user.get('is_admin', False)
        user_type = current_user.get('user_type')
        user_id = current_user.get('user_id')
        
        # Authorization check
        if not is_admin and (user_type != "customer" or user_id != appointment.customer_id):
            raise HTTPException(status_code=403, detail="Access denied - can only update your own appointments")
        
        # Update appointment fields
        update_data = appointment_data.dict(exclude_unset=True)
        

        
        # Handle date and time updates
        if 'appointment_date' in update_data or 'appointment_time' in update_data:
            new_date = update_data.get('appointment_date', appointment.scheduled_date.date())
            new_time = update_data.get('appointment_time', appointment.scheduled_date.time())
            new_datetime = datetime.combine(new_date, new_time)
            update_data['scheduled_date'] = new_datetime
            update_data.pop('appointment_date', None)
            update_data.pop('appointment_time', None)
        
        # Map fields to appointment model
        field_mapping = {
            'meeting_type': 'appointment_type',
            'notes': 'customer_notes'
        }
        
        for field, value in update_data.items():
            model_field = field_mapping.get(field, field)
            if hasattr(appointment, model_field):
                setattr(appointment, model_field, value)
        
        appointment_service.update_appointment(appointment)
        
        # Get customer info for response
        customer = db.query(User).filter(
            User.id == appointment.customer_id,
            User.user_type == 'customer'
        ).first()
        
        # Update Google Calendar event
        calendar_link = None
        try:
            calendar_link = await google_calendar_service.update_calendar_event(
                event_id=str(appointment.id),
                appointment_data={
                    'title': f"Consultation - {customer.name if customer else 'Unknown'}",
                    'description': appointment.customer_notes or "Business automation consultation",
                    'appointment_date': appointment.scheduled_date.date(),
                    'appointment_time': appointment.scheduled_date.time(),
                    'duration_minutes': appointment.duration_minutes,
                    'customer_name': customer.name if customer else 'Unknown',
                    'customer_email': customer.email if customer else None,
                    'meeting_type': appointment.appointment_type
                }
            )
            logger.info(f"Google Calendar event updated for appointment {appointment.id}: {calendar_link}")
        except Exception as e:
            logger.error(f"Failed to update Google Calendar event for appointment {appointment.id}: {str(e)}")
            # Don't fail the appointment update if calendar fails
        
        # Send update email notification
        try:
            if customer and customer.email:
                await send_appointment_update_email(
                    customer_name=customer.name,
                    customer_email=customer.email,
                    appointment_date=appointment.scheduled_date.date(),
                    appointment_time=appointment.scheduled_date.time(),
                    duration_minutes=appointment.duration_minutes,
                    meeting_type=appointment.appointment_type,
                    notes=appointment.customer_notes,
                    calendar_link=calendar_link
                )
                logger.info(f"Appointment update email sent to {customer.email}")
            else:
                logger.warning(f"No email address for customer - notification email not sent")
        except Exception as email_error:
            logger.error(f"Error sending appointment notification email: {str(email_error)}")
            # Don't fail the appointment update if email fails
        
        return {
            "id": appointment.id,
            "customer_id": appointment.customer_id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_email": customer.email if customer else "unknown@email.com",
            "title": f"Consultation - {customer.name if customer else 'Unknown'}",
            "description": appointment.customer_notes or "Business automation consultation",
            "appointment_date": appointment.scheduled_date.date().isoformat(),
            "appointment_time": appointment.scheduled_date.time().strftime('%H:%M:%S'),
            "duration_minutes": appointment.duration_minutes,
            "meeting_type": appointment.appointment_type,
            "status": appointment.status,
            "notes": appointment.customer_notes,
            "created_at": appointment.created_at.isoformat() if appointment.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update appointment")

@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an appointment"""
    try:
        appointment_service = AppointmentService(db)
        appointment = appointment_service.get_appointment(appointment_id)
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment_service.delete_appointment(appointment_id)
        
        # Delete Google Calendar event
        try:
            calendar_message = await google_calendar_service.delete_calendar_event(appointment_id)
            logger.info(f"Google Calendar event deleted for appointment {appointment_id}: {calendar_message}")
        except Exception as e:
            logger.error(f"Failed to delete Google Calendar event for appointment {appointment_id}: {str(e)}")
            # Don't fail the appointment deletion if calendar fails
        
        return {"message": "Appointment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete appointment")



@router.get("/schedule", response_class=HTMLResponse)
async def view_schedule(db: Session = Depends(get_db)):
    """View scheduled appointments"""
    try:
        appointment_service = AppointmentService(db)
        
        # Get upcoming appointments for the next 30 days
        upcoming_appointments = appointment_service.get_upcoming_appointments(30)
        
        # Build simple appointments list for now
        appointments_html = ""
        if not upcoming_appointments:
            appointments_html = "<p style='text-align: center; color: #ccc; padding: 40px;'>No upcoming appointments scheduled.</p>"
        else:
            appointments_html = "<div class='appointments-list'>"
            for appointment in upcoming_appointments:
                date_str = appointment.scheduled_date.strftime('%A, %B %d, %Y at %I:%M %p')
                appointments_html += f"""
                <div class="appointment-card" style="background: rgba(255,255,255,0.05); padding: 20px; margin: 15px 0; border-radius: 8px;">
                    <div style="color: #00d4ff; font-weight: bold; margin-bottom: 10px;">
                        <a href="/admin/customers/{appointment.customer.id}" style="color: #00d4ff; text-decoration: none;">
                            {appointment.customer.name or appointment.customer.email}
                        </a>
                    </div>
                    <div style="margin-bottom: 5px;">📅 {date_str}</div>
                    <div style="margin-bottom: 5px;">📍 {appointment.appointment_type.title()} ({appointment.duration_minutes} min)</div>
                    <div style="margin-bottom: 5px;">🏢 {appointment.customer.company or 'No company'}</div>
                    <div>📋 Status: <span style="color: {'#39ff14' if appointment.status == 'scheduled' else '#ff6b6b'}">{appointment.status.title()}</span></div>
                    {f'<div style="margin-top: 10px; font-style: italic; color: #aaa;">"{appointment.customer_notes}"</div>' if appointment.customer_notes else ''}
                </div>
                """
            appointments_html += "</div>"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Schedule - StreamlineAI Admin</title>
            <style>
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                    color: white; 
                    padding: 40px; 
                    margin: 0;
                    min-height: 100vh;
                }}
                .nav {{ 
                    background: rgba(0, 212, 255, 0.1); 
                    padding: 20px; 
                    border-radius: 15px; 
                    margin-bottom: 30px;
                    text-align: center;
                }}
                .nav a {{ 
                    color: #00d4ff; 
                    text-decoration: none; 
                    margin: 0 20px;
                    padding: 10px 20px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }}
                .nav a:hover {{ background: rgba(0, 212, 255, 0.2); }}
                .stats {{ 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }}
                .stat-card {{ 
                    background: rgba(255,255,255,0.05); 
                    padding: 20px; 
                    border-radius: 12px; 
                    text-align: center; 
                }}
                .stat-number {{ font-size: 32px; color: #00d4ff; font-weight: bold; }}
                .stat-label {{ color: #ccc; }}
            </style>
        </head>
        <body>
            <h1 style="color: #00d4ff; text-align: center; margin-bottom: 30px;">⚡ StreamlineAI Admin - Schedule</h1>
            
            <div class="nav">
                <a href="/admin/chat-logs">Chat Logs</a>
                <a href="/admin/customers">Customers</a>
                <strong style="color: white; padding: 10px 20px; background: rgba(0, 212, 255, 0.3); border-radius: 6px;">Schedule</strong>
                <a href="/admin/admins">Admin Users</a>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">{len([a for a in upcoming_appointments if a.status == 'scheduled'])}</div>
                    <div class="stat-label">Scheduled</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{len([a for a in upcoming_appointments if a.scheduled_date.date() == datetime.now().date()])}</div>
                    <div class="stat-label">Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{len([a for a in upcoming_appointments if a.scheduled_date.date() == (datetime.now().date() + timedelta(days=1))])}</div>
                    <div class="stat-label">Tomorrow</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{len(upcoming_appointments)}</div>
                    <div class="stat-label">Next 30 Days</div>
                </div>
            </div>
            
            <h2 style="color: #00d4ff;">Upcoming Appointments</h2>
            {appointments_html}
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        return f"<html><body style='background: #1a1a1a; color: white; padding: 40px;'><h1>Error: {str(e)}</h1><a href='/admin/chat-logs' style='color: #00d4ff;'>← Back to Admin</a></body></html>"
