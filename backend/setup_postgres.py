import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.models import Base, Customer, ChatSession, ChatMessage
from database import engine
import psycopg2

def setup_database():
    try:
        print("🔍 Setting up PostgreSQL database...")
        
        # Create all tables
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Tables created successfully!")
        
        # Test connection and show tables
        conn = psycopg2.connect(
            host='localhost',
            port=5433,
            database='streamlineai',
            user='streamlineai',
            password='streamline123'
        )
        
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        
        tables = cursor.fetchall()
        print("\n📋 Tables in database:")
        for table in tables:
            print(f"  - {table[0]}")
            
        # Show table structure for customers
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'customers'
            ORDER BY ordinal_position
        """)
        
        columns = cursor.fetchall()
        print(f"\n📊 Structure of 'customers' table:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Database setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")

if __name__ == "__main__":
    setup_database()
