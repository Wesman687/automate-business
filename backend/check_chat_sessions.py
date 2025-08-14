#!/usr/bin/env python3
"""
Quick test to check ChatSession data in the database
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

def check_chat_sessions():
    """Check ChatSession data in the database"""
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found")
        return
    
    try:
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        
        # Check if chat_sessions table exists and has is_seen column
        result = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'chat_sessions'
            ORDER BY ordinal_position
        """))
        
        print("📋 Chat Sessions Table Schema:")
        columns = result.fetchall()
        for col in columns:
            print(f"  - {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'} DEFAULT {col[3] or 'None'}")
        
        if not any(col[0] == 'is_seen' for col in columns):
            print("❌ 'is_seen' column is missing!")
            return
        
        # Check total chat sessions
        result = db.execute(text("SELECT COUNT(*) FROM chat_sessions"))
        total_sessions = result.scalar()
        print(f"\n📊 Total chat sessions: {total_sessions}")
        
        if total_sessions == 0:
            print("ℹ️  No chat sessions found in database")
            return
        
        # Check is_seen distribution
        result = db.execute(text("""
            SELECT 
                is_seen,
                COUNT(*) as count
            FROM chat_sessions 
            GROUP BY is_seen
        """))
        
        print("\n👁️  Seen Status Distribution:")
        for row in result.fetchall():
            status = "Seen" if row[0] else "Unseen"
            print(f"  - {status}: {row[1]}")
        
        # Show some recent unseen sessions
        result = db.execute(text("""
            SELECT 
                cs.id, 
                cs.session_id, 
                cs.is_seen,
                cs.created_at,
                c.name as customer_name,
                c.email as customer_email
            FROM chat_sessions cs
            LEFT JOIN customers c ON cs.customer_id = c.id
            WHERE cs.is_seen = FALSE OR cs.is_seen IS NULL
            ORDER BY cs.created_at DESC
            LIMIT 5
        """))
        
        print("\n🔍 Recent Unseen Sessions:")
        unseen_sessions = result.fetchall()
        if unseen_sessions:
            for session in unseen_sessions:
                customer_name = session[4] or "Unknown"
                customer_email = session[5] or "Unknown"
                print(f"  - ID: {session[0]}, Session: {session[1][:20]}..., Customer: {customer_name} ({customer_email}), Created: {session[3]}")
        else:
            print("  No unseen sessions found")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    check_chat_sessions()
