from sqlalchemy.orm import Session
from database.models import User
from schemas.customer import CustomerCreate, CustomerUpdate
from services.auth_service import AuthService
from typing import Optional, List

class CustomerService:
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)
    
    def create_customer(self, customer_data: CustomerCreate) -> User:
        # Check if customer already exists
        existing = self.db.query(User).filter(
            User.email == customer_data.email,
            User.user_type == 'customer'
        ).first()
        if existing:
            return existing
        
        # Create customer with authentication support
        customer_dict = customer_data.dict(exclude={'password'})
        
        # Handle password hashing if provided
        password_hash = None
        if hasattr(customer_data, 'password') and customer_data.password:
            password_hash = self.auth_service.hash_password(customer_data.password)
        
        # Merge customer data with required User fields
        customer_dict.update({
            'password_hash': password_hash,
            'user_type': 'customer',
            'status': 'active'
        })
        
        db_customer = User(**customer_dict)
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return db_customer
    
    def get_customer_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.email == email,
            User.user_type == 'customer'
        ).first()
    
    def get_customer_by_id(self, customer_id: int) -> Optional[User]:
        return self.db.query(User).filter(
            User.id == customer_id,
            User.user_type == 'customer'
        ).first()
    
    def get_customers(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).filter(
            User.user_type == 'customer'
        ).offset(skip).limit(limit).all()
    
    def get_all_customers(self) -> List[User]:
        """Get all customers"""
        return self.db.query(User).filter(User.user_type == 'customer').all()
    
    def get_customer(self, customer_id: int) -> Optional[User]:
        """Get a customer by ID"""
        return self.get_customer_by_id(customer_id)
    
    def update_customer(self, customer_id: int, customer_data: CustomerUpdate) -> Optional[User]:
        customer = self.get_customer_by_id(customer_id)
        if not customer:
            return None
        
        update_data = customer_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(customer, field, value)
        
        self.db.commit()
        self.db.refresh(customer)
        return customer
    
    def delete_customer(self, customer_id: int) -> bool:
        customer = self.get_customer_by_id(customer_id)
        if customer:
            self.db.delete(customer)
            self.db.commit()
            return True
        return False
    
    def add_notes(self, customer_id: int, notes: str) -> Optional[User]:
        customer = self.get_customer_by_id(customer_id)
        if customer:
            if customer.notes:
                customer.notes += f"\n\n{notes}"
            else:
                customer.notes = notes
            self.db.commit()
            self.db.refresh(customer)
        return customer
    
    def set_customer_password(self, customer_id: int, password: str) -> bool:
        """Set or update a customer's password"""
        customer = self.get_customer_by_id(customer_id)
        if customer:
            password_hash = self.auth_service.hash_password(password)
            customer.password_hash = password_hash
            self.db.commit()
            return True
        return False
    
    def authenticate_customer(self, email: str, password: str) -> Optional[User]:
        """Authenticate a customer with email and password"""
        customer = self.get_customer_by_email(email)
        if customer and customer.password_hash:
            if self.auth_service.verify_password(password, customer.password_hash):
                return customer
        return None
    
    def update_customer_from_chat(self, email: str, extracted_info: dict) -> User:
        """Update customer information from chat data"""
        customer = self.get_customer_by_email(email)
        
        if not customer:
            # Create new customer if doesn't exist
            customer_data = CustomerCreate(
                email=email,
                name=extracted_info.get('name'),
                phone=extracted_info.get('phone'),
                business_type=extracted_info.get('company'),
                pain_points=extracted_info.get('pain_points'),
                current_tools=extracted_info.get('current_tools'),
                budget=extracted_info.get('budget')
            )
            return self.create_customer(customer_data)
        
        # Update existing customer
        for key, value in extracted_info.items():
            if hasattr(customer, key) and value:
                setattr(customer, key, value)
        
        self.db.commit()
        self.db.refresh(customer)
        return customer
    
    def get_customers_by_phone(self, phone: str) -> List[User]:
        """Get customers by phone number (exact and partial matches)"""
        if not phone:
            return []
        
        # First try exact match
        customers = self.db.query(User).filter(
            User.phone == phone,
            User.user_type == 'customer'
        ).all()
        
        if not customers:
            # Try partial match with last 4 digits
            phone_suffix = phone[-4:] if len(phone) >= 4 else phone
            customers = self.db.query(User).filter(
                User.phone.ilike(f'%{phone_suffix}'),
                User.user_type == 'customer'
            ).all()
        
        return customers
    
    def search_customers_by_name(self, name: str) -> List[User]:
        """Search customers by name (fuzzy matching)"""
        if not name:
            return []
        
        # Split name into parts and search each part
        name_parts = name.lower().split()
        query = self.db.query(User).filter(User.user_type == 'customer')
        
        for part in name_parts:
            query = query.filter(User.name.ilike(f'%{part}%'))
        
        customers = query.all()
        
        # If no exact matches, try individual parts
        if not customers:
            for part in name_parts:
                matches = self.db.query(User).filter(
                    User.name.ilike(f'%{part}%'),
                    User.user_type == 'customer'
                ).all()
                customers.extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_customers = []
        for customer in customers:
            if customer.id not in seen:
                seen.add(customer.id)
                unique_customers.append(customer)
        
        return unique_customers
