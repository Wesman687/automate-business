#!/usr/bin/env python3
"""
Check migration status
"""

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    customers_count = conn.execute(text('SELECT COUNT(*) FROM customers')).scalar()
    users_customers_count = conn.execute(text("SELECT COUNT(*) FROM users WHERE user_type = 'customer'")).scalar()
    
    print(f'📊 Migration Status:')
    print(f'   Customers table: {customers_count} records')
    print(f'   Users (customer type): {users_customers_count} records')
    
    if customers_count == users_customers_count:
        print('✅ Data migration appears complete')
    else:
        print('⚠️  Data counts do not match')
        
    # Check a sample of the data
    sample_customers = conn.execute(text('SELECT id, email FROM customers LIMIT 3')).fetchall()
    print(f'\n🔍 Sample customers table data:')
    for row in sample_customers:
        print(f'   ID: {row[0]}, Email: {row[1]}')
        
    sample_users = conn.execute(text("SELECT id, email, user_type FROM users WHERE user_type = 'customer' LIMIT 3")).fetchall()
    print(f'\n🔍 Sample users (customer type) data:')
    for row in sample_users:
        print(f'   ID: {row[0]}, Email: {row[1]}, Type: {row[2]}')
