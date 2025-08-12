import os
from typing import Optional
from database.models import Customer

class CustomerFileManager:
    """Manages customer-specific file organization"""
    
    @staticmethod
    def get_customer_base_dir(customer: Customer) -> str:
        """Get the base directory for a customer's files"""
        safe_email = customer.email.replace('@', '_at_').replace('.', '_')
        return os.path.join("uploads", "customers", f"customer_{customer.id}_{safe_email}")
    
    @staticmethod
    def create_customer_directories(customer: Customer) -> dict:
        """Create all necessary directories for a customer"""
        base_dir = CustomerFileManager.get_customer_base_dir(customer)
        
        directories = {
            'base': base_dir,
            'files': os.path.join(base_dir, "files"),
            'invoices': os.path.join(base_dir, "invoices"),
            'contracts': os.path.join(base_dir, "contracts"),
            'documents': os.path.join(base_dir, "documents"),
            'receipts': os.path.join(base_dir, "receipts"),
            'proposals': os.path.join(base_dir, "proposals")
        }
        
        # Create all directories
        for dir_type, dir_path in directories.items():
            os.makedirs(dir_path, exist_ok=True)
            
        return directories
    
    @staticmethod
    def get_customer_directory(customer: Customer, doc_type: str = "files") -> str:
        """Get a specific directory for a customer"""
        base_dir = CustomerFileManager.get_customer_base_dir(customer)
        return os.path.join(base_dir, doc_type)
    
    @staticmethod
    def ensure_customer_directory(customer: Customer, doc_type: str = "files") -> str:
        """Ensure a customer directory exists and return the path"""
        dir_path = CustomerFileManager.get_customer_directory(customer, doc_type)
        os.makedirs(dir_path, exist_ok=True)
        return dir_path
