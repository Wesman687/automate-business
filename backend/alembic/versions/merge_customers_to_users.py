"""
Merge customers table into users table

This migration:
1. Copies all customer data to users table with user_type='customer'
2. Updates foreign key references from customers.id to users.id
3. Drops the customers table
4. Updates foreign key constraints
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = 'merge_customers_to_users'
down_revision = None  # Set to your latest revision
branch_labels = None
depends_on = None


def upgrade():
    # Get database connection
    connection = op.get_bind()
    
    print("🔄 Starting migration: Merging customers into users table...")
    
    # Step 1: Insert customer data into users table
    print("📥 Copying customer data to users table...")
    connection.execute(text("""
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
    
    # Step 2: Create mapping table for ID updates
    print("🔗 Creating customer ID to user ID mapping...")
    connection.execute(text("""
        CREATE TEMPORARY TABLE customer_user_mapping AS
        SELECT 
            c.id as old_customer_id,
            u.id as new_user_id
        FROM customers c
        JOIN users u ON c.email = u.email
        WHERE u.user_type = 'customer'
    """))
    
    # Step 3: Update chat_sessions to reference users table
    print("💬 Updating chat_sessions foreign keys...")
    
    # Add new user_id column temporarily
    op.add_column('chat_sessions', sa.Column('user_id', sa.Integer(), nullable=True))
    
    # Update user_id with mapped values
    connection.execute(text("""
        UPDATE chat_sessions cs
        SET user_id = (
            SELECT new_user_id 
            FROM customer_user_mapping cum 
            WHERE cum.old_customer_id = cs.customer_id
        )
    """))
    
    # Step 4: Update appointments to reference users table
    print("📅 Updating appointments foreign keys...")
    
    # Check if appointments table exists
    inspector = sa.inspect(connection)
    if 'appointments' in inspector.get_table_names():
        # Add new user_id column temporarily
        op.add_column('appointments', sa.Column('user_id', sa.Integer(), nullable=True))
        
        # Update user_id with mapped values
        connection.execute(text("""
            UPDATE appointments a
            SET user_id = (
                SELECT new_user_id 
                FROM customer_user_mapping cum 
                WHERE cum.old_customer_id = a.customer_id
            )
        """))
    
    # Step 5: Update portal_invites to reference users table
    print("🎫 Updating portal_invites foreign keys...")
    
    # Add new user_id column temporarily
    op.add_column('portal_invites', sa.Column('user_id', sa.Integer(), nullable=True))
    
    # Update user_id with mapped values
    connection.execute(text("""
        UPDATE portal_invites pi
        SET user_id = (
            SELECT new_user_id 
            FROM customer_user_mapping cum 
            WHERE cum.old_customer_id = pi.customer_id
        )
    """))
    
    # Step 6: Drop old foreign key constraints and columns
    print("🗑️  Removing old foreign key references...")
    
    try:
        # Drop foreign key constraints (names may vary)
        op.drop_constraint('chat_sessions_customer_id_fkey', 'chat_sessions', type_='foreignkey')
    except:
        pass
    
    try:
        op.drop_constraint('portal_invites_customer_id_fkey', 'portal_invites', type_='foreignkey') 
    except:
        pass
        
    if 'appointments' in inspector.get_table_names():
        try:
            op.drop_constraint('appointments_customer_id_fkey', 'appointments', type_='foreignkey')
        except:
            pass
    
    # Drop old customer_id columns
    op.drop_column('chat_sessions', 'customer_id')
    op.drop_column('portal_invites', 'customer_id')
    if 'appointments' in inspector.get_table_names():
        op.drop_column('appointments', 'customer_id')
    
    # Rename user_id columns to customer_id (to maintain existing code compatibility)
    op.alter_column('chat_sessions', 'user_id', new_column_name='customer_id')
    op.alter_column('portal_invites', 'user_id', new_column_name='customer_id')
    if 'appointments' in inspector.get_table_names():
        op.alter_column('appointments', 'user_id', new_column_name='customer_id')
    
    # Step 7: Add new foreign key constraints to users table
    print("🔗 Adding new foreign key constraints...")
    op.create_foreign_key('chat_sessions_customer_id_fkey', 'chat_sessions', 'users', ['customer_id'], ['id'])
    op.create_foreign_key('portal_invites_customer_id_fkey', 'portal_invites', 'users', ['customer_id'], ['id'])
    if 'appointments' in inspector.get_table_names():
        op.create_foreign_key('appointments_customer_id_fkey', 'appointments', 'users', ['customer_id'], ['id'])
    
    # Step 8: Drop customers table
    print("🗑️  Dropping customers table...")
    op.drop_table('customers')
    
    print("✅ Migration completed! All customer data merged into users table.")


def downgrade():
    """
    Reverting this migration is complex and not recommended.
    You would need to recreate the customers table and move data back.
    """
    print("❌ Downgrade not implemented. This migration should not be reverted.")
    print("   If needed, restore from backup before running this migration.")
    raise NotImplementedError("Downgrade not supported for customer merge migration")
