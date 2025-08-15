import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from database.models import ChatSession

def check_sessions():
    """Check what chat sessions exist in the database"""
    db = SessionLocal()
    try:
        sessions = db.query(ChatSession).all()
        print(f"Found {len(sessions)} chat sessions in database:")
        
        for session in sessions:
            print(f"  ID: {session.id}")
            print(f"  Session ID: {session.session_id}")
            print(f"  Is Seen: {session.is_seen}")
            print(f"  Customer ID: {session.customer_id}")
            print(f"  Status: {session.status}")
            print(f"  Created: {session.created_at}")
            print("-" * 40)
            
        if not sessions:
            print("❌ No chat sessions found in database!")
            print("💡 You may need to start a chat session first.")
        
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_sessions()
