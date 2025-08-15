#!/usr/bin/env python3
import psycopg2

# Database connection
DATABASE_URL = "postgresql://streamlineai:StreamAI2025@15.204.248.186:5432/streamlineai"

def check_tables():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("Checking customers table structure:")
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]}")
        
        print("\nChecking customers data:")
        cursor.execute("SELECT COUNT(*) FROM customers")
        count = cursor.fetchone()[0]
        print(f"Total customers: {count}")
        
        if count > 0:
            cursor.execute("SELECT * FROM customers LIMIT 1")
            sample = cursor.fetchone()
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position")
            columns = [col[0] for col in cursor.fetchall()]
            
            print("\nSample customer record:")
            for i, col in enumerate(columns):
                value = sample[i] if i < len(sample) else None
                print(f"  {col}: {value}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_tables()
