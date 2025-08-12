from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from database import get_db
from services.appointment_service import AppointmentService
from datetime import datetime, timedelta

router = APIRouter()

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
