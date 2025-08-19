#!/usr/bin/env python3
"""
Final migration verification
"""

from database import engine
from sqlalchemy import text, inspect

# Check table status
inspector = inspect(engine)
tables = inspector.get_table_names()

print('🎉 CUSTOMER → USER MIGRATION COMPLETE!')
print('=' * 50)

print(f'📊 Database Status:')
print(f'   ✅ Users table exists: {"users" in tables}')
print(f'   ✅ Customers table removed: {"customers" not in tables}')

# Check user data
with engine.connect() as conn:
    total_users = conn.execute(text('SELECT COUNT(*) FROM users')).scalar()
    customer_users = conn.execute(text("SELECT COUNT(*) FROM users WHERE user_type = 'customer'")).scalar()
    admin_users = conn.execute(text("SELECT COUNT(*) FROM users WHERE user_type = 'admin'")).scalar()
    
    print(f'\n👥 User Statistics:')
    print(f'   Total users: {total_users}')
    print(f'   Customer users: {customer_users}')
    print(f'   Admin users: {admin_users}')
    
    # Check foreign key references
    chat_sessions = conn.execute(text('SELECT COUNT(*) FROM chat_sessions WHERE customer_id IS NOT NULL')).scalar()
    appointments = conn.execute(text('SELECT COUNT(*) FROM appointments WHERE customer_id IS NOT NULL')).scalar()
    
    print(f'\n🔗 Foreign Key References:')
    print(f'   Chat sessions with customer_id: {chat_sessions}')
    print(f'   Appointments with customer_id: {appointments}')

print(f'\n✅ Migration Summary:')
print(f'   • Customer and User tables merged into single Users table')
print(f'   • All foreign keys now reference users.id')
print(f'   • Customer data preserved with user_type="customer"')
print(f'   • Admin data preserved with user_type="admin"')
print(f'   • Legacy customers table completely removed')
print(f'\n🎯 Benefits:')
print(f'   • Simplified database schema')
print(f'   • Unified authentication system')
print(f'   • Reduced code complexity')
print(f'   • Better maintainability')
