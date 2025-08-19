import os
from typing import Optional
from database.models import User


class CustomerFileManager:
    """Manages customer-specific file organization"""
    
    @staticmethod
    def get_customer_base_dir(customer: User) -> str:
        """Get the base directory for a customer's files"""
        safe_email = customer.email.replace('@', '_at_').replace('.', '_')
        return os.path.join("uploads", "customers", f"customer_{customer.id}_{safe_email}")
    
    @staticmethod
    def create_customer_directories(customer: User) -> dict:
        """Create directory structure for customer files"""
        base_dir = CustomerFileManager.get_customer_base_dir(customer)
        
        # Define directory structure
        directories = {
            'base': base_dir,
            'files': os.path.join(base_dir, "files"),
            'invoices': os.path.join(base_dir, "invoices"),
            'contracts': os.path.join(base_dir, "contracts"),
            'documents': os.path.join(base_dir, "documents"),
            'receipts': os.path.join(base_dir, "receipts"),
            'proposals': os.path.join(base_dir, "proposals")
        }
        
        # Create directories
        for dir_type, dir_path in directories.items():
            try:
                os.makedirs(dir_path, exist_ok=True)
            except Exception as e:
                print(f"Error creating directory {dir_path}: {e}")
        
        return directories
    
    @staticmethod
    def get_customer_directory(customer: User, doc_type: str = "files") -> str:
        """Get specific directory path for customer documents"""
        base_dir = CustomerFileManager.get_customer_base_dir(customer)
        return os.path.join(base_dir, doc_type)
    
    @staticmethod
    def ensure_customer_directory(customer: User, doc_type: str = "files") -> str:
        """Ensure customer directory exists and return path"""
        dir_path = CustomerFileManager.get_customer_directory(customer, doc_type)
        os.makedirs(dir_path, exist_ok=True)
        return dir_path
