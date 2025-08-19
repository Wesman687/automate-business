from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from database import get_db
from database.models import Invoice, RecurringPayment, TimeEntry, Admin
from schemas.financial import (
    Invoice as InvoiceSchema,
    InvoiceCreate,
    InvoiceUpdate,
    RecurringPayment as RecurringPaymentSchema,
    RecurringPaymentCreate,
    RecurringPaymentUpdate,

    TimeEntry as TimeEntrySchema,
    TimeEntryCreate,
    TimeEntryUpdate,
)
from api.auth import get_current_user  # Legacy import
from api.auth import get_current_admin

router = APIRouter()

# Invoice Endpoints
@router.get("/invoices", response_model=List[InvoiceSchema])
def get_invoices(
    customer_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all invoices with optional filtering"""
    query = db.query(Invoice)
    
    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)
    if status:
        query = query.filter(Invoice.status == status)
    if start_date:
        query = query.filter(Invoice.issue_date >= start_date)
    if end_date:
        query = query.filter(Invoice.issue_date <= end_date)
    
    return query.order_by(Invoice.created_at.desc()).all()

@router.get("/invoices/{invoice_id}", response_model=InvoiceSchema)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get a specific invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("/invoices", response_model=InvoiceSchema)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new invoice"""
    # Generate invoice number
    invoice_count = db.query(Invoice).count()
    invoice_number = f"INV-{datetime.now().year}-{invoice_count + 1:04d}"
    
    # Calculate total amount
    total_amount = invoice.amount + (invoice.tax_amount or 0) - (invoice.discount_amount or 0)
    
    db_invoice = Invoice(
        **invoice.dict(),
        admin_id=current_user['admin_id'],  # Use the current user's ID
        invoice_number=invoice_number,
        issue_date=datetime.now(),
        total_amount=total_amount,
        created_at=datetime.now()
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.put("/invoices/{invoice_id}", response_model=InvoiceSchema)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update an invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice_update.dict(exclude_unset=True)
    
    # Recalculate total if amount or adjustments changed
    if any(key in update_data for key in ['amount', 'tax_amount', 'discount_amount']):
        amount = update_data.get('amount', invoice.amount)
        tax_amount = update_data.get('tax_amount', invoice.tax_amount or 0)
        discount_amount = update_data.get('discount_amount', invoice.discount_amount or 0)
        update_data['total_amount'] = amount + tax_amount - discount_amount
    
    update_data['updated_at'] = datetime.now()
    
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/invoices/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Delete an invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}

# Recurring Payment Endpoints
@router.get("/recurring-payments", response_model=List[RecurringPaymentSchema])
def get_recurring_payments(
    customer_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all recurring payments with optional filtering"""
    query = db.query(RecurringPayment)
    
    if customer_id:
        query = query.filter(RecurringPayment.customer_id == customer_id)
    if status:
        query = query.filter(RecurringPayment.status == status)
    
    return query.order_by(RecurringPayment.created_at.desc()).all()

@router.get("/recurring-payments/{payment_id}", response_model=RecurringPaymentSchema)
def get_recurring_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get a specific recurring payment"""
    payment = db.query(RecurringPayment).filter(RecurringPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Recurring payment not found")
    return payment

@router.post("/recurring-payments", response_model=RecurringPaymentSchema)
def create_recurring_payment(
    payment: RecurringPaymentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new recurring payment"""
    db_payment = RecurringPayment(
        **payment.dict(),
        admin_id=current_user['admin_id'],
        next_billing_date=payment.start_date,
        created_at=datetime.now()
    )
    
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.put("/recurring-payments/{payment_id}", response_model=RecurringPaymentSchema)
def update_recurring_payment(
    payment_id: int,
    payment_update: RecurringPaymentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a recurring payment"""
    payment = db.query(RecurringPayment).filter(RecurringPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Recurring payment not found")
    
    update_data = payment_update.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.now()
    
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    db.commit()
    db.refresh(payment)
    return payment



# Time Entry Endpoints
@router.get("/time-entries", response_model=List[TimeEntrySchema])
def get_time_entries(
    job_id: Optional[int] = Query(None),
    admin_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get all time entries with optional filtering"""
    query = db.query(TimeEntry)
    
    if job_id:
        query = query.filter(TimeEntry.job_id == job_id)
    if admin_id:
        query = query.filter(TimeEntry.admin_id == admin_id)
    if start_date:
        query = query.filter(TimeEntry.start_time >= start_date)
    if end_date:
        query = query.filter(TimeEntry.start_time <= end_date)
    
    return query.order_by(TimeEntry.start_time.desc()).all()

@router.post("/time-entries", response_model=TimeEntrySchema)
def create_time_entry(
    time_entry: TimeEntryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Create a new time entry"""
    # Calculate duration if end_time is provided
    duration_hours = time_entry.duration_hours
    if time_entry.end_time and not duration_hours:
        duration = time_entry.end_time - time_entry.start_time
        duration_hours = duration.total_seconds() / 3600
    
    # Calculate amount if hourly rate is provided
    amount = None
    if duration_hours and time_entry.hourly_rate:
        amount = float(duration_hours) * float(time_entry.hourly_rate)
    
    db_time_entry = TimeEntry(
        **time_entry.dict(),
        admin_id=current_user['admin_id'],
        duration_hours=duration_hours,
        amount=amount,
        created_at=datetime.now()
    )
    
    db.add(db_time_entry)
    db.commit()
    db.refresh(db_time_entry)
    return db_time_entry

@router.put("/time-entries/{entry_id}", response_model=TimeEntrySchema)
def update_time_entry(
    entry_id: int,
    entry_update: TimeEntryUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update a time entry"""
    time_entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    update_data = entry_update.dict(exclude_unset=True)
    
    # Recalculate duration if end_time changed
    if 'end_time' in update_data and update_data['end_time']:
        start_time = time_entry.start_time
        end_time = update_data['end_time']
        duration = end_time - start_time
        update_data['duration_hours'] = duration.total_seconds() / 3600
    
    # Recalculate amount if duration or rate changed
    duration_hours = update_data.get('duration_hours', time_entry.duration_hours)
    hourly_rate = update_data.get('hourly_rate', time_entry.hourly_rate)
    if duration_hours and hourly_rate:
        update_data['amount'] = float(duration_hours) * float(hourly_rate)
    
    update_data['updated_at'] = datetime.now()
    
    for field, value in update_data.items():
        setattr(time_entry, field, value)
    
    db.commit()
    db.refresh(time_entry)
    return time_entry

@router.delete("/time-entries/{entry_id}")
def delete_time_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Delete a time entry"""
    time_entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()
    if not time_entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    db.delete(time_entry)
    db.commit()
    return {"message": "Time entry deleted successfully"}

# Financial Summary Endpoints
@router.get("/financial-summary")
def get_financial_summary(
    customer_id: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get financial summary with totals and metrics"""
    # Base queries
    invoice_query = db.query(Invoice)
    recurring_query = db.query(RecurringPayment)
    # Apply filters
    if customer_id:
        invoice_query = invoice_query.filter(Invoice.customer_id == customer_id)
        recurring_query = recurring_query.filter(RecurringPayment.customer_id == customer_id)
    
    if year:
        from sqlalchemy import extract
        invoice_query = invoice_query.filter(extract('year', Invoice.issue_date) == year)
        if month:
            invoice_query = invoice_query.filter(extract('month', Invoice.issue_date) == month)
    
    # Calculate totals
    invoices = invoice_query.all()
    total_invoiced = sum(inv.total_amount for inv in invoices)
    total_paid = sum(inv.total_amount for inv in invoices if inv.status == 'paid')
    total_outstanding = sum(inv.total_amount for inv in invoices if inv.status in ['sent', 'overdue'])
    
    recurring_payments = recurring_query.filter(RecurringPayment.status == 'active').all()
    monthly_recurring = sum(rp.amount for rp in recurring_payments if rp.interval == 'monthly')
    
    return {
        "total_invoiced": float(total_invoiced),
        "total_paid": float(total_paid),
        "total_outstanding": float(total_outstanding),
        "monthly_recurring_revenue": float(monthly_recurring),
        "total_invoices": len(invoices),
        "active_recurring_payments": len(recurring_payments)
    }
