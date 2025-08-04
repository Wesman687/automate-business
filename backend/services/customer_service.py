from sqlalchemy.orm import Session
from database.models import Customer
from schemas.customer import CustomerCreate, CustomerUpdate
from typing import Optional, List

class CustomerService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_customer(self, customer_data: CustomerCreate) -> Customer:
        # Check if customer already exists
        existing = self.db.query(Customer).filter(Customer.email == customer_data.email).first()
        if existing:
            return existing
        
        db_customer = Customer(**customer_data.dict())
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return db_customer
    
    def get_customer_by_email(self, email: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.email == email).first()
    
    def get_customer_by_id(self, customer_id: int) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.id == customer_id).first()
    
    def get_customers(self, skip: int = 0, limit: int = 100) -> List[Customer]:
        return self.db.query(Customer).offset(skip).limit(limit).all()
    
    def update_customer(self, customer_id: int, customer_data: CustomerUpdate) -> Optional[Customer]:
        customer = self.get_customer_by_id(customer_id)
        if not customer:
            return None
        
        update_data = customer_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(customer, key, value)
        
        self.db.commit()
        self.db.refresh(customer)
        return customer
    
    def add_notes(self, customer_id: int, notes: str) -> Optional[Customer]:
        customer = self.get_customer_by_id(customer_id)
        if not customer:
            return None
        
        existing_notes = customer.notes or ""
        if existing_notes:
            customer.notes = existing_notes + "\n\n" + notes
        else:
            customer.notes = notes
        
        self.db.commit()
        self.db.refresh(customer)
        return customer
    
    def update_customer_from_chat(self, email: str, extracted_info: dict) -> Customer:
        """Update or create customer from extracted chat information"""
        customer = self.get_customer_by_email(email)
        
        if customer:
            # Update existing customer with new information
            for key, value in extracted_info.items():
                if hasattr(customer, key) and value:
                    setattr(customer, key, value)
        else:
            # Create new customer
            customer_data = CustomerCreate(email=email, **extracted_info)
            customer = self.create_customer(customer_data)
        
        self.db.commit()
        self.db.refresh(customer)
        return customer
