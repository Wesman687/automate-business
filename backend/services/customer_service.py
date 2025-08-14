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
        
        # Create customer with default authentication values
        customer_dict = customer_data.dict()
        customer_dict.update({
            'is_authenticated': False,
            'password_hash': None,
            'reset_code': None,
            # 'reset_code_expires': None  # Temporarily disabled
        })
        
        db_customer = Customer(**customer_dict)
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
    
    def get_all_customers(self) -> List[Customer]:
        """Get all customers with their chat sessions"""
        return self.db.query(Customer).all()
    
    def get_customer(self, customer_id: int) -> Optional[Customer]:
        """Get customer by ID - alias for get_customer_by_id"""
        return self.get_customer_by_id(customer_id)
    
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
    
    def delete_customer(self, customer_id: int) -> bool:
        """Delete a customer and all associated data"""
        customer = self.get_customer_by_id(customer_id)
        if not customer:
            return False
        
        # Note: This will cascade delete chat sessions due to foreign key constraints
        self.db.delete(customer)
        self.db.commit()
        return True
    
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
    
    def get_customers_by_phone(self, phone: str) -> List[Customer]:
        """Get customers by phone number (exact match and fuzzy match)"""
        # Clean phone number (remove common formatting)
        clean_phone = ''.join(filter(str.isdigit, phone))
        
        if len(clean_phone) < 10:
            return []
        
        # Try exact match first
        customers = self.db.query(Customer).filter(Customer.phone == phone).all()
        
        # If no exact match, try fuzzy matching on cleaned phone numbers
        if not customers and len(clean_phone) >= 10:
            # Get last 10 digits for comparison
            phone_suffix = clean_phone[-10:]
            customers = self.db.query(Customer).filter(
                Customer.phone.ilike(f'%{phone_suffix}')
            ).all()
        
        return customers
    
    def search_customers_by_name(self, name: str) -> List[Customer]:
        """Search customers by name (fuzzy match)"""
        name_parts = name.strip().split()
        
        if not name_parts:
            return []
        
        # Search for customers where name contains any part of the search term
        query = self.db.query(Customer)
        
        for part in name_parts:
            query = query.filter(Customer.name.ilike(f'%{part}%'))
        
        customers = query.all()
        
        # If no results with all parts, try each part individually
        if not customers:
            individual_searches = []
            for part in name_parts:
                matches = self.db.query(Customer).filter(
                    Customer.name.ilike(f'%{part}%')
                ).all()
                individual_searches.extend(matches)
            
            # Remove duplicates while preserving order
            seen = set()
            customers = []
            for customer in individual_searches:
                if customer.id not in seen:
                    seen.add(customer.id)
                    customers.append(customer)
        
        return customers
