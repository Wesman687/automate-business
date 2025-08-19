#!/usr/bin/env python3
"""
Drop the empty customers table
"""

from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        with conn.begin():
            conn.execute(text('DROP TABLE customers CASCADE'))
        print('✅ Customers table dropped successfully')
except Exception as e:
    print(f'❌ Error dropping customers table: {e}')
