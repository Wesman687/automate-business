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
        customer_notes: str = None,
        status: str = "scheduled",
        force_create: bool = False
    ) -> Appointment:
        """Create a new appointment with optional conflict checking"""
        
        # Only check for conflicts if not forcing creation
        if not force_create:
            # Check for exact time conflicts (same date and time)
            existing_appointment = self.db.query(Appointment).filter(
                Appointment.scheduled_date == scheduled_date,
                Appointment.status == "scheduled"
            ).first()
            
            if existing_appointment:
                raise ValueError(f"Another appointment is already scheduled at {scheduled_date.strftime('%A, %B %d at %I:%M %p')}")
        
        appointment = Appointment(
            customer_id=customer_id,
            scheduled_date=scheduled_date,
            duration_minutes=duration_minutes,
            appointment_type=appointment_type,
            customer_notes=customer_notes,
            status=status
        )
        
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
    
    def _is_time_available(self, scheduled_date: datetime, duration_minutes: int) -> bool:
        """Check if a specific time slot is available"""
        available_slots = self.get_available_slots(scheduled_date, duration_minutes)
        requested_time = scheduled_date.replace(second=0, microsecond=0)
        return requested_time in available_slots
    
    def get_available_slots(self, date: datetime, duration_minutes: int = 30) -> List[datetime]:
        """Get available appointment slots for a given date"""
        # Business hours: 9 AM to 5 PM, 7 days a week (including weekends)
        start_hour = 9
        end_hour = 17
        slot_duration = duration_minutes
        
        # Generate possible slots for any day of the week
        slots = []
        current_time = date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
        end_time = date.replace(hour=end_hour, minute=0, second=0, microsecond=0)
        
        while current_time < end_time:
            slots.append(current_time)
            current_time += timedelta(minutes=slot_duration)
        
        # Remove slots that are already booked (only hard conflicts)
        booked_appointments = self.db.query(Appointment).filter(
            Appointment.scheduled_date >= date.replace(hour=0, minute=0, second=0),
            Appointment.scheduled_date < date.replace(hour=23, minute=59, second=59),
            Appointment.status == "scheduled"
        ).all()
        
        booked_times = set()
        for apt in booked_appointments:
            # Only block the exact time slot, not buffer time
            booked_times.add(apt.scheduled_date.replace(second=0, microsecond=0))
        
        available_slots = [slot for slot in slots if slot not in booked_times]
        return available_slots
    
    def get_recommended_times(
        self, 
        preferred_date: datetime, 
        duration_minutes: int = 30, 
        num_suggestions: int = 5
    ) -> List[datetime]:
        """Get recommended appointment times around a preferred date"""
        
        recommendations = []
        
        # Start from the preferred date and look forward/backward
        search_date = preferred_date.replace(hour=9, minute=0, second=0, microsecond=0)
        days_searched = 0
        max_days = 14  # Search up to 2 weeks
        
        while len(recommendations) < num_suggestions and days_searched < max_days:
            # Include all days (weekdays and weekends)
            available_slots = self.get_available_slots(search_date, duration_minutes)
            
            # Sort slots by proximity to preferred time
            if available_slots:
                preferred_time = preferred_date.time()
                sorted_slots = sorted(
                    available_slots, 
                    key=lambda x: abs(
                        (x.time().hour * 60 + x.time().minute) - 
                        (preferred_time.hour * 60 + preferred_time.minute)
                    )
                )
                
                for slot in sorted_slots:
                    if len(recommendations) < num_suggestions:
                        recommendations.append(slot)
            
            # Move to next day
            search_date += timedelta(days=1)
            days_searched += 1
        
        return recommendations[:num_suggestions]
    
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
    
    def get_all_appointments(self) -> List[Appointment]:
        """Get all appointments (for admin users)"""
        return self.db.query(Appointment).order_by(Appointment.scheduled_date.desc()).all()
    
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
    
    def get_appointment(self, appointment_id: int) -> Optional[Appointment]:
        """Get a specific appointment by ID"""
        return self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    def update_appointment(self, appointment: Appointment) -> Appointment:
        """Update an existing appointment"""
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
    
    def delete_appointment(self, appointment_id: int) -> bool:
        """Delete an appointment"""
        appointment = self.get_appointment(appointment_id)
        if appointment:
            self.db.delete(appointment)
            self.db.commit()
            return True
        return False
    
    def get_appointments_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Appointment]:
        """Get appointments within a date range"""
        return self.db.query(Appointment).filter(
            Appointment.scheduled_date >= start_date,
            Appointment.scheduled_date <= end_date
        ).order_by(Appointment.scheduled_date).all()
