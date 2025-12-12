"""
Streamline File Uploader SDK
Local package for file upload functionality
"""
try:
    from .client import StreamlineFileUploader
    __all__ = ['StreamlineFileUploader']
except ImportError:
    # If client.py has issues, define a minimal version
    __all__ = []

