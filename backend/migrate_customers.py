#!/usr/bin/env python3
"""
Simple migration script to merge customers table into users table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, inspect
from database import engine, get_db


def run_migration():
    """Run the customer to users migration"""
    
    print("🚀 Starting Customer → Users Migration")
    print("=" * 50)
    
    with engine.connect() as connection:
        # Start transaction
        trans = connection.begin()
        
        try:
            # Check if customers table exists
            inspector = inspect(connection)
            tables = inspector.get_table_names()
            
            if 'customers' not in tables:
                print("✅ No customers table found - migration not needed")
                return
            
            if 'users' not in tables:
                print("❌ Users table not found - please run alembic migrations first")
                return
            
            print("📋 Found both tables, proceeding with migration...")
            
            # Step 1: Copy customer data to users table
            print("📥 Copying customer data to users table...")
            result = connection.execute(text("""
                INSERT INTO users (
                    email, password_hash, user_type, status, name, phone, address, city, state, zip_code, country,
                    business_name, business_site, additional_websites, business_type, pain_points, current_tools, 
                    budget, lead_status, notes, created_at, updated_at
                )
                SELECT 
                    email, 
                    password_hash,
                    'customer' as user_type,
                    CASE 
                        WHEN status = 'lead' THEN 'active'
                        WHEN status = 'customer' THEN 'active'
                        WHEN status = 'qualified' THEN 'active'
                        ELSE 'inactive'
                    END as status,
                    name,
                    phone,
                    address,
                    city,
                    state,
                    zip_code,
                    country,
                    business_name,
                    business_site,
                    additional_websites,
                    business_type,
                    pain_points,
                    current_tools,
                    budget,
                    status as lead_status,
                    notes,
                    created_at,
                    updated_at
                FROM customers
                WHERE email NOT IN (SELECT email FROM users)
            """))
            print(f"✅ Copied {result.rowcount} customers to users table")
            
            # Step 2: Create mapping for ID updates
            print("🔗 Creating customer ID mapping...")
            connection.execute(text("""
                CREATE TEMPORARY TABLE customer_user_mapping AS
                SELECT 
                    c.id as old_customer_id,
                    u.id as new_user_id
                FROM customers c
                JOIN users u ON c.email = u.email
                WHERE u.user_type = 'customer'
            """))
            
            # Step 3: Update foreign key references
            foreign_key_updates = [
                ("chat_sessions", "customer_id"),
                ("portal_invites", "customer_id"),
                ("appointments", "customer_id"),
                ("customer_change_requests", "customer_id"),
                ("invoices", "customer_id"),
                ("recurring_payments", "customer_id"),
                ("jobs", "customer_id")
            ]
            
            for table, column in foreign_key_updates:
                if table in tables:
                    print(f"🔄 Updating {table}.{column}...")
                    result = connection.execute(text(f"""
                        UPDATE {table}
                        SET {column} = (
                            SELECT new_user_id 
                            FROM customer_user_mapping cum 
                            WHERE cum.old_customer_id = {table}.{column}
                        )
                        WHERE {column} IN (SELECT old_customer_id FROM customer_user_mapping)
                    """))
                    print(f"✅ Updated {result.rowcount} records in {table}")
            
            # Step 4: Drop foreign key constraints before dropping table
            print("🔧 Dropping foreign key constraints...")
            
            constraint_drops = [
                "ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_customer_id_fkey",
                "ALTER TABLE portal_invites DROP CONSTRAINT IF EXISTS portal_invites_customer_id_fkey", 
                "ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_customer_id_fkey",
                "ALTER TABLE customer_change_requests DROP CONSTRAINT IF EXISTS customer_change_requests_customer_id_fkey",
                "ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey",
                "ALTER TABLE recurring_payments DROP CONSTRAINT IF EXISTS recurring_payments_customer_id_fkey",
                "ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_customer_id_fkey"
            ]
            
            for constraint_sql in constraint_drops:
                try:
                    connection.execute(text(constraint_sql))
                    print(f"✅ Dropped constraint: {constraint_sql.split()[-1]}")
                except Exception as e:
                    print(f"⚠️  Constraint already dropped or doesn't exist: {e}")
            
            # Step 5: Add new foreign key constraints to users table
            print("🔗 Adding new foreign key constraints to users table...")
            
            constraint_adds = [
                "ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)",
                "ALTER TABLE portal_invites ADD CONSTRAINT portal_invites_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)",
                "ALTER TABLE appointments ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)",
                "ALTER TABLE customer_change_requests ADD CONSTRAINT customer_change_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)",
                "ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)",
                "ALTER TABLE recurring_payments ADD CONSTRAINT recurring_payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)",
                "ALTER TABLE jobs ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id)"
            ]
            
            for constraint_sql in constraint_adds:
                try:
                    connection.execute(text(constraint_sql))
                    print(f"✅ Added constraint: {constraint_sql.split()[3]}")
                except Exception as e:
                    print(f"⚠️  Constraint already exists: {e}")
            
            # Step 6: Drop customers table
            print("🗑️  Dropping customers table...")
            connection.execute(text("DROP TABLE customers"))
            
            # Commit transaction
            trans.commit()
            print("✅ Migration completed successfully!")
            print("🎉 All customer data has been merged into users table")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    run_migration()
