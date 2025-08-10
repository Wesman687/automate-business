from sqlalchemy.orm import Session
from database.models import Admin
from typing import Optional, List
import hashlib
import os
from datetime import datetime

class AdminService:
    def __init__(self, db: Session):
        self.db = db
    
    def _hash_password(self, password: str) -> str:
        """Hash password with salt"""
        salt = os.getenv('PASSWORD_SALT', 'streamline_salt_2024')
        return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    
    def create_admin(self, email: str, username: str, password: str, full_name: str = None, is_super_admin: bool = False) -> Admin:
        """Create a new admin user"""
        # Check if admin already exists
        existing_admin = self.get_admin_by_email(email)
        if existing_admin:
            raise ValueError(f"Admin with email {email} already exists")
        
        existing_username = self.get_admin_by_username(username)
        if existing_username:
            raise ValueError(f"Admin with username {username} already exists")
        
        # Create new admin
        password_hash = self._hash_password(password)
        
        admin = Admin(
            email=email,
            username=username,
            password_hash=password_hash,
            full_name=full_name,
            is_super_admin=is_super_admin,
            is_active=True
        )
        
        self.db.add(admin)
        self.db.commit()
        self.db.refresh(admin)
        return admin
    
    def get_admin_by_email(self, email: str) -> Optional[Admin]:
        """Get admin by email"""
        from sqlalchemy import func
        return self.db.query(Admin).filter(func.lower(Admin.email) == func.lower(email)).first()
    
    def get_admin_by_username(self, username: str) -> Optional[Admin]:
        """Get admin by username"""
        return self.db.query(Admin).filter(Admin.username == username).first()
    
    def get_admin_by_id(self, admin_id: int) -> Optional[Admin]:
        """Get admin by ID"""
        return self.db.query(Admin).filter(Admin.id == admin_id).first()
    
    def authenticate_admin(self, username_or_email: str, password: str) -> Optional[Admin]:
        """Authenticate admin by username/email and password"""
        # Try to find by username first, then email
        admin = self.get_admin_by_username(username_or_email)
        if not admin:
            admin = self.get_admin_by_email(username_or_email)
        
        if not admin or not admin.is_active:
            return None
        
        # Verify password
        password_hash = self._hash_password(password)
        if admin.password_hash == password_hash:
            # Update last login
            admin.last_login = datetime.utcnow()
            self.db.commit()
            return admin
        
        return None
    
    def get_all_admins(self) -> List[Admin]:
        """Get all admins"""
        return self.db.query(Admin).order_by(Admin.created_at.desc()).all()
    
    def update_admin(self, admin_id: int, email: str = None, username: str = None, 
                    full_name: str = None, is_active: bool = None) -> Optional[Admin]:
        """Update admin details"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return None
        
        if email and email != admin.email:
            # Check if new email is already taken
            existing = self.get_admin_by_email(email)
            if existing and existing.id != admin_id:
                raise ValueError(f"Email {email} is already taken")
            admin.email = email
        
        if username and username != admin.username:
            # Check if new username is already taken
            existing = self.get_admin_by_username(username)
            if existing and existing.id != admin_id:
                raise ValueError(f"Username {username} is already taken")
            admin.username = username
        
        if full_name is not None:
            admin.full_name = full_name
        
        if is_active is not None:
            admin.is_active = is_active
        
        admin.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(admin)
        return admin
    
    def change_password(self, admin_id: int, new_password: str) -> bool:
        """Change admin password"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False
        
        admin.password_hash = self._hash_password(new_password)
        admin.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def delete_admin(self, admin_id: int) -> bool:
        """Delete admin (soft delete by deactivating)"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False
        
        # Don't allow deleting super admins
        if admin.is_super_admin:
            raise ValueError("Cannot delete super admin")
        
        admin.is_active = False
        admin.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def make_super_admin(self, admin_id: int, current_admin_id: int) -> bool:
        """Make an admin a super admin (only super admins can do this)"""
        current_admin = self.get_admin_by_id(current_admin_id)
        if not current_admin or not current_admin.is_super_admin:
            raise ValueError("Only super admins can create other super admins")
        
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False
        
        admin.is_super_admin = True
        admin.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def remove_super_admin(self, admin_id: int) -> bool:
        """Remove super admin status from an admin"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False
        
        admin.is_super_admin = False
        admin.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def setup_initial_super_admin(self, email: str, username: str, password: str, full_name: str = None) -> Admin:
        """Setup the initial super admin (only if no super admin exists)"""
        # Check if any super admin exists
        existing_super_admin = self.db.query(Admin).filter(Admin.is_super_admin == True).first()
        if existing_super_admin:
            raise ValueError("Super admin already exists")
        
        # Create the super admin
        return self.create_admin(
            email=email,
            username=username,
            password=password,
            full_name=full_name,
            is_super_admin=True
        )
    
    def update_admin_password(self, admin_id: int, new_password: str) -> bool:
        """Update admin password"""
        admin = self.get_admin_by_id(admin_id)
        if not admin:
            return False
        
        admin.password_hash = self._hash_password(new_password)
        admin.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def get_admin_by_email(self, email: str) -> Optional[Admin]:
        """Get admin by email"""
        from sqlalchemy import func
        return self.db.query(Admin).filter(func.lower(Admin.email) == func.lower(email)).first()
