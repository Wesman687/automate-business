#!/usr/bin/env python3
"""
Check Database Configuration
Verifies what database URL the server is actually using
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    print("🔍 Database Configuration Check")
    print("=" * 50)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    print("📁 Environment file location:")
    env_file = backend_dir / ".env"
    print(f"   {env_file}")
    print(f"   Exists: {env_file.exists()}")
    
    if env_file.exists():
        print(f"   Size: {env_file.stat().st_size} bytes")
        
        # Read the .env file content
        print("\n📄 .env file content (DATABASE_URL lines):")
        with open(env_file, 'r') as f:
            for i, line in enumerate(f, 1):
                if 'DATABASE_URL' in line and not line.strip().startswith('#'):
                    print(f"   Line {i}: {line.strip()}")
    
    print("\n🔧 Environment Variables:")
    database_url = os.getenv('DATABASE_URL')
    print(f"   DATABASE_URL: {database_url}")
    
    if database_url:
        if database_url.startswith('sqlite'):
            print("   ❌ PROBLEM: Using SQLite!")
        elif database_url.startswith('postgresql'):
            print("   ✅ GOOD: Using PostgreSQL")
        else:
            print("   ⚠️  UNKNOWN: Unrecognized database type")
    else:
        print("   ❌ PROBLEM: DATABASE_URL not set!")
    
    print("\n🗄️  Database Engine Check:")
    try:
        from database import engine
        print(f"   Engine URL: {engine.url}")
        print(f"   Engine Dialect: {engine.dialect.name}")
        
        if engine.dialect.name == 'sqlite':
            print("   ❌ PROBLEM: Engine is using SQLite!")
        elif engine.dialect.name == 'postgresql':
            print("   ✅ GOOD: Engine is using PostgreSQL")
        
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    print("\n🔌 Database Connection Test:")
    try:
        from database import engine
        with engine.connect() as conn:
            # Test query that works on both SQLite and PostgreSQL
            result = conn.execute("SELECT 1 as test").fetchone()
            print(f"   ✅ Connection successful: {result}")
            
            # Check if we can access the admins table
            try:
                result = conn.execute("SELECT COUNT(*) FROM admins").fetchone()
                print(f"   ✅ Admins table accessible: {result[0]} rows")
            except Exception as e:
                print(f"   ❌ Admins table error: {e}")
                
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
    
    print("=" * 50)

if __name__ == "__main__":
    main()
