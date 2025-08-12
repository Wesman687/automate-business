from sqlalchemy.orm import Session
from database.models import Appointment, Customer
from datetime import datetime, timedelta
from typing import List, Optional

class AppointmentService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_appointment(
        self, 
        customer_id: int, 
        scheduled_date: datetime,
        duration_minutes: int = 30,
        appointment_type: str = "consultation",
        customer_notes: str = None
    ) -> Appointment:
        """Create a new appointment"""
        appointment = Appointment(
            customer_id=customer_id,
            scheduled_date=scheduled_date,
            duration_minutes=duration_minutes,
            appointment_type=appointment_type,
            customer_notes=customer_notes
        )
        
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
    
    def get_available_slots(self, date: datetime, duration_minutes: int = 30) -> List[datetime]:
        """Get available appointment slots for a given date"""
        # Business hours: 9 AM to 5 PM, Monday to Friday
        start_hour = 9
        end_hour = 17
        slot_duration = duration_minutes
        
        # Check if it's a weekday
        if date.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return []
        
        # Generate possible slots
        slots = []
        current_time = date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        end_time = date.replace(hour=end_hour, minute=0, second=0, microsecond=0)
        
        while current_time < end_time:
            slots.append(current_time)
            current_time += timedelta(minutes=slot_duration)
        
        # Remove slots that are already booked
        booked_appointments = self.db.query(Appointment).filter(
            Appointment.scheduled_date >= date.replace(hour=0, minute=0, second=0),
            Appointment.scheduled_date < date.replace(hour=23, minute=59, second=59),
            Appointment.status == "scheduled"
        ).all()
        
        booked_times = set()
        for apt in booked_appointments:
            # Block out the appointment time and some buffer
            start_time = apt.scheduled_date
            end_time = start_time + timedelta(minutes=apt.duration_minutes)
            
            # Remove conflicting slots
            current = start_time
            while current < end_time:
                booked_times.add(current.replace(second=0, microsecond=0))
                current += timedelta(minutes=30)
        
        available_slots = [slot for slot in slots if slot not in booked_times]
        return available_slots
    
    def get_next_available_slot(self, days_ahead: int = 7) -> Optional[datetime]:
        """Get the next available appointment slot within the next N days"""
        today = datetime.now().date()
        
        for i in range(days_ahead):
            check_date = today + timedelta(days=i)
            check_datetime = datetime.combine(check_date, datetime.min.time())
            
            available_slots = self.get_available_slots(check_datetime)
            if available_slots:
                return available_slots[0]
        
        return None
    
    def schedule_appointment_auto(self, customer_id: int, customer_notes: str = None) -> Optional[Appointment]:
        """Automatically schedule the next available appointment slot"""
        next_slot = self.get_next_available_slot()
        if not next_slot:
            return None
        
        return self.create_appointment(
            customer_id=customer_id,
            scheduled_date=next_slot,
            customer_notes=customer_notes
        )
    
    def get_customer_appointments(self, customer_id: int) -> List[Appointment]:
        """Get all appointments for a customer"""
        return self.db.query(Appointment).filter(
            Appointment.customer_id == customer_id
        ).order_by(Appointment.scheduled_date.desc()).all()
    
    def get_upcoming_appointments(self, days_ahead: int = 30) -> List[Appointment]:
        """Get all upcoming appointments"""
        start_date = datetime.now()
        end_date = start_date + timedelta(days=days_ahead)
        
        return self.db.query(Appointment).filter(
            Appointment.scheduled_date >= start_date,
            Appointment.scheduled_date <= end_date,
            Appointment.status == "scheduled"
        ).order_by(Appointment.scheduled_date).all()
    
    def get_appointments_by_date(self, date: datetime) -> List[Appointment]:
        """Get all appointments for a specific date"""
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        return self.db.query(Appointment).filter(
            Appointment.scheduled_date >= start_of_day,
            Appointment.scheduled_date <= end_of_day
        ).order_by(Appointment.scheduled_date).all()
    
    def update_appointment_status(self, appointment_id: int, status: str) -> bool:
        """Update appointment status"""
        appointment = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            return False
        
        appointment.status = status
        self.db.commit()
        return True
    
    def cancel_appointment(self, appointment_id: int) -> bool:
        """Cancel an appointment"""
        return self.update_appointment_status(appointment_id, "cancelled")
    
    def complete_appointment(self, appointment_id: int, notes: str = None) -> bool:
        """Mark appointment as completed"""
        appointment = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            return False
        
        appointment.status = "completed"
        if notes:
            appointment.notes = notes
        self.db.commit()
        return True
    
    def get_upcoming_appointments(self, days_ahead: int = 30):
        """Get upcoming appointments within specified days"""
        start_date = datetime.now()
        end_date = start_date + timedelta(days=days_ahead)
        
        return self.db.query(Appointment).filter(
            Appointment.scheduled_date >= start_date,
            Appointment.scheduled_date <= end_date
        ).order_by(Appointment.scheduled_date).all()
