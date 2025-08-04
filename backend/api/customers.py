from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from services.customer_service import CustomerService
from services.session_service import SessionService
from schemas.customer import Customer, CustomerCreate, CustomerUpdate
from typing import List

router = APIRouter(prefix="/api", tags=["customers"])

@router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    customer_service = CustomerService(db)
    return customer_service.create_customer(customer)

@router.get("/customers", response_model=List[Customer])
async def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all customers with pagination"""
    customer_service = CustomerService(db)
    return customer_service.get_customers(skip=skip, limit=limit)

@router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer by ID"""
    customer_service = CustomerService(db)
    customer = customer_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: int, customer_data: CustomerUpdate, db: Session = Depends(get_db)):
    """Update a customer"""
    customer_service = CustomerService(db)
    customer = customer_service.update_customer(customer_id, customer_data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/customers/{customer_id}/notes")
async def add_customer_notes(customer_id: int, notes: str, db: Session = Depends(get_db)):
    """Add notes to a customer"""
    customer_service = CustomerService(db)
    customer = customer_service.add_notes(customer_id, notes)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Notes added successfully"}

@router.get("/customers/{customer_id}/sessions")
async def get_customer_sessions(customer_id: int, db: Session = Depends(get_db)):
    """Get all chat sessions for a customer"""
    session_service = SessionService(db)
    sessions = session_service.get_customer_sessions(customer_id)
    
    return [
        {
            "session_id": session.session_id,
            "status": session.status,
            "created_at": session.created_at,
            "message_count": len(session.messages) if session.messages else 0
        }
        for session in sessions
    ]

@router.get("/customers/email/{email}")
async def get_customer_by_email(email: str, db: Session = Depends(get_db)):
    """Get a customer by email address"""
    customer_service = CustomerService(db)
    customer = customer_service.get_customer_by_email(email)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
