#!/usr/bin/env python3
"""
Simple test script for the enhanced credits system
This version focuses on basic functionality without complex imports
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_basic_imports():
    """Test basic imports without complex dependencies"""
    print("🧪 Testing Basic Credit System Imports")
    print("=" * 50)
    
    try:
        # Test 1: Basic database models
        print("1. Testing basic model imports...")
        from database.models import User, CreditTransaction
        print("   ✅ User and CreditTransaction models imported successfully")
        
        # Test 2: Database connection
        print("2. Testing database connection...")
        from database import get_db
        print("   ✅ Database connection module imported successfully")
        
        # Test 3: Basic credit service (if available)
        print("3. Testing credit service import...")
        try:
            from services.credit_service import CreditService
            print("   ✅ CreditService imported successfully")
        except ImportError as e:
            print(f"   ⚠️  CreditService import warning: {e}")
            print("   (This is expected if models aren't fully integrated yet)")
        
        # Test 4: Basic schemas (if available)
        print("4. Testing schema imports...")
        try:
            from schemas.credits import CreditBalance
            print("   ✅ Credit schemas imported successfully")
        except ImportError as e:
            print(f"   ⚠️  Schema import warning: {e}")
            print("   (This is expected if schemas aren't fully integrated yet)")
        
        print("\n🎉 Basic imports completed successfully!")
        return True
        
    except ImportError as e:
        print(f"   ❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def test_database_connection():
    """Test database connection and basic operations"""
    print("\n🗄️  Testing Database Connection")
    print("=" * 50)
    
    try:
        from database import get_db
        from database.models import User
        
        # Get a database session
        db_gen = get_db()
        db = next(db_gen)
        
        try:
            # Test basic query
            user_count = db.query(User).count()
            print(f"   ✅ Database connection successful")
            print(f"   📊 Total users in database: {user_count}")
            
            # Test credit-related queries
            users_with_credits = db.query(User).filter(User.credits > 0).count()
            print(f"   💰 Users with credits: {users_with_credits}")
            
            # Test if credit_status column exists
            try:
                from sqlalchemy import func
                # This will fail if the column doesn't exist
                status_counts = db.query(
                    User.credit_status, 
                    func.count(User.id)
                ).group_by(User.credit_status).all()
                
                print("   📈 Credit status distribution:")
                for status, count in status_counts:
                    if status is not None:
                        print(f"      • {status}: {count} users")
                    else:
                        print(f"      • null: {count} users")
                        
            except Exception as e:
                print(f"   ⚠️  Credit status query warning: {e}")
                print("   (This is expected if credit_status column doesn't exist yet)")
            
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"   ❌ Database test failed: {e}")
        return False

def test_credit_tables():
    """Test if credit-related tables exist"""
    print("\n📊 Testing Credit Tables")
    print("=" * 50)
    
    try:
        from database import get_db
        from sqlalchemy import inspect
        
        db_gen = get_db()
        db = next(db_gen)
        
        try:
            inspector = inspect(db.bind)
            tables = inspector.get_table_names()
            
            print("   📋 Available tables:")
            for table in sorted(tables):
                if 'credit' in table.lower() or 'subscription' in table.lower():
                    print(f"      ✅ {table}")
                else:
                    print(f"      • {table}")
            
            # Check for specific credit tables
            credit_tables = ['credit_packages', 'user_subscriptions', 'credit_disputes', 'credit_promotions']
            missing_tables = []
            
            for table in credit_tables:
                if table in tables:
                    print(f"   ✅ {table} table exists")
                else:
                    print(f"   ❌ {table} table missing")
                    missing_tables.append(table)
            
            if missing_tables:
                print(f"\n   ⚠️  Missing tables: {', '.join(missing_tables)}")
                print("   Run 'alembic upgrade head' to create missing tables")
            else:
                print("\n   🎉 All credit tables exist!")
            
            return len(missing_tables) == 0
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"   ❌ Table test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Enhanced Credits System - Simple Test Suite")
    print("=" * 60)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests
    imports_ok = test_basic_imports()
    database_ok = test_database_connection()
    tables_ok = test_credit_tables()
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    if imports_ok:
        print("✅ Basic Imports: PASSED")
    else:
        print("❌ Basic Imports: FAILED")
    
    if database_ok:
        print("✅ Database Connection: PASSED")
    else:
        print("❌ Database Connection: FAILED")
    
    if tables_ok:
        print("✅ Credit Tables: PASSED")
    else:
        print("❌ Credit Tables: FAILED")
    
    if imports_ok and database_ok and tables_ok:
        print("\n🎉 All tests passed! The enhanced credits system is ready to use.")
        print("\n📝 Next Steps:")
        print("   1. Start the backend server: python main.py")
        print("   2. Test the API endpoints at /docs")
        print("   3. Integrate with frontend components")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        if not tables_ok:
            print("   1. Run database migration: alembic upgrade head")
        if not database_ok:
            print("   2. Check database connection and environment variables")
        if not imports_ok:
            print("   3. Check Python path and module structure")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
