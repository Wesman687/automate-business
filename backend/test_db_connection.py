import psycopg2
import sys

def test_db_connection():
    try:
        print("🔍 Testing PostgreSQL connection...")
        print("📡 Connecting to: postgresql://streamlineai:***@localhost:5433/streamlineai")
        
        conn = psycopg2.connect(
            host='localhost',
            port=5433,
            database='streamlineai',
            user='streamlineai',
            password='streamline123',
            connect_timeout=10
        )
        
        print("✅ Database connection successful!")
        
        # Test a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        print("🎉 Connection test completed successfully!")
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting suggestions:")
        print("1. Check if SSH tunnel is running: ssh -L 5433:localhost:5432 streamlineai-db@server.stream-lineai.com")
        print("2. Verify PostgreSQL is running on the remote server")
        print("3. Check if the database 'streamlineai' exists")
        print("4. Verify username and password are correct")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_db_connection()
