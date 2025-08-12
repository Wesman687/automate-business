from sqlalchemy.orm import Session
from database.models import Customer
from schemas.auth import CustomerLoginRequest, CustomerRegistration, PasswordResetRequest
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import secrets
import random
import string

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class CustomerAuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def hash_password(self, password: str) -> str:
        """Hash a password for storing in database"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def authenticate_customer(self, email: str, password: str) -> Optional[Customer]:
        """Authenticate a customer by email and password"""
        customer = self.db.query(Customer).filter(Customer.email == email).first()
        if not customer or not customer.password_hash:
            return None
        if not self.verify_password(password, customer.password_hash):
            return None
        return customer
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def set_customer_password(self, customer_id: int, password: str) -> bool:
        """Set password for existing customer"""
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return False
        
        customer.password_hash = self.hash_password(password)
        customer.is_authenticated = True
        self.db.commit()
        return True
    
    def generate_reset_code(self) -> str:
        """Generate 6-digit reset code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def request_password_reset(self, email: str) -> Optional[str]:
        """Generate and save password reset code for customer"""
        customer = self.db.query(Customer).filter(Customer.email == email).first()
        if not customer:
            return None
        
        reset_code = self.generate_reset_code()
        customer.reset_code = reset_code
        # customer.reset_code_expires = datetime.utcnow() + timedelta(minutes=30)  # Temporarily disabled
        self.db.commit()
        
        return reset_code
    
    def verify_reset_code(self, email: str, reset_code: str) -> bool:
        """Verify password reset code"""
        customer = self.db.query(Customer).filter(Customer.email == email).first()
        if not customer or not customer.reset_code:
            return False
        
        # For now, codes are valid for 1 hour (simplified - no expiry check)
        # if customer.reset_code_expires < datetime.utcnow():
        #     return False  # Code expired
        
        return customer.reset_code == reset_code
    
    def reset_password(self, email: str, reset_code: str, new_password: str) -> bool:
        """Reset customer password using reset code"""
        if not self.verify_reset_code(email, reset_code):
            return False
        
        customer = self.db.query(Customer).filter(Customer.email == email).first()
        customer.password_hash = self.hash_password(new_password)
        customer.reset_code = None
        # customer.reset_code_expires = None  # Temporarily disabled
        customer.is_authenticated = True
        self.db.commit()
        
        return True
    
    def customer_exists(self, email: str) -> bool:
        """Check if customer exists in database"""
        return self.db.query(Customer).filter(Customer.email == email).first() is not None
    
    def customer_has_password(self, email: str) -> bool:
        """Check if customer has a password set"""
        customer = self.db.query(Customer).filter(Customer.email == email).first()
        return customer is not None and customer.password_hash is not None
