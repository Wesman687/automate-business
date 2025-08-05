import hashlib
import hmac
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional
import os
from cryptography.fernet import Fernet
import base64

class AuthService:
    def __init__(self):
        # Get or generate encryption key
        self.encryption_key = self._get_or_create_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        
        # Admin credentials from environment or defaults
        self.admin_username = os.getenv('ADMIN_USERNAME', 'streamline_admin')
        self.admin_password_hash = self._hash_password(os.getenv('ADMIN_PASSWORD', 'StreamlineAI2024!'))
        
        # Token expiration time (24 hours)
        self.token_expiration_hours = 24
        
    def _get_or_create_encryption_key(self) -> bytes:
        """Get encryption key from environment or create new one"""
        key_env = os.getenv('ENCRYPTION_KEY')
        if key_env:
            try:
                return base64.urlsafe_b64decode(key_env)
            except:
                pass
        
        # Generate new key
        key = Fernet.generate_key()
        print(f"🔐 Generated new encryption key. Add to .env file:")
        print(f"ENCRYPTION_KEY={base64.urlsafe_b64encode(key).decode()}")
        return key
    
    def _hash_password(self, password: str) -> str:
        """Hash password with salt"""
        salt = os.getenv('PASSWORD_SALT', 'streamline_salt_2024')
        return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    
    def authenticate_user(self, username: str, password: str) -> bool:
        """Authenticate user credentials"""
        if username != self.admin_username:
            return False
        
        password_hash = self._hash_password(password)
        return hmac.compare_digest(password_hash, self.admin_password_hash)
    
    def generate_token(self, username: str) -> str:
        """Generate encrypted authentication token"""
        # Create token payload
        payload = {
            'username': username,
            'issued_at': time.time(),
            'expires_at': time.time() + (self.token_expiration_hours * 3600),
            'random': secrets.token_hex(16)  # Add randomness
        }
        
        # Convert to string and encrypt
        payload_str = f"{payload['username']}|{payload['issued_at']}|{payload['expires_at']}|{payload['random']}"
        encrypted_token = self.fernet.encrypt(payload_str.encode())
        
        return base64.urlsafe_b64encode(encrypted_token).decode()
    
    def validate_token(self, token: str) -> Optional[dict]:
        """Validate and decrypt authentication token"""
        try:
            # Decode and decrypt token
            encrypted_token = base64.urlsafe_b64decode(token.encode())
            decrypted_payload = self.fernet.decrypt(encrypted_token).decode()
            
            # Parse payload
            parts = decrypted_payload.split('|')
            if len(parts) != 4:
                return None
            
            username, issued_at, expires_at, random_part = parts
            
            # Check if token has expired
            if time.time() > float(expires_at):
                return None
            
            # Validate username
            if username != self.admin_username:
                return None
            
            return {
                'username': username,
                'issued_at': float(issued_at),
                'expires_at': float(expires_at),
                'valid': True
            }
            
        except Exception as e:
            print(f"❌ Token validation error: {str(e)}")
            return None
    
    def get_token_info(self, token: str) -> dict:
        """Get information about a token without validating it"""
        try:
            encrypted_token = base64.urlsafe_b64decode(token.encode())
            decrypted_payload = self.fernet.decrypt(encrypted_token).decode()
            parts = decrypted_payload.split('|')
            
            if len(parts) == 4:
                username, issued_at, expires_at, _ = parts
                return {
                    'username': username,
                    'issued_at': datetime.fromtimestamp(float(issued_at)),
                    'expires_at': datetime.fromtimestamp(float(expires_at)),
                    'is_expired': time.time() > float(expires_at)
                }
        except:
            pass
        
        return {'error': 'Invalid token format'}
    
    def create_admin_user(self, username: str, password: str) -> dict:
        """Create new admin user credentials (for setup)"""
        password_hash = self._hash_password(password)
        
        return {
            'username': username,
            'password_hash': password_hash,
            'setup_complete': True,
            'created_at': datetime.utcnow().isoformat()
        }

# Global auth service instance
auth_service = AuthService()
