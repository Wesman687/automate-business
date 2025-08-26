"""Credits System - Clean Implementation

Revision ID: 008_credits_system_clean
Revises: 007_enhanced_credits_system
Create Date: 2025-08-25 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '013_credits_system_clean'
down_revision = '012'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types first using raw SQL to avoid SQLAlchemy conflicts
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscriptionstatus') THEN
                CREATE TYPE subscriptionstatus AS ENUM ('active', 'paused', 'cancelled', 'expired', 'trial');
            END IF;
        END $$;
    """)
    
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'disputestatus') THEN
                CREATE TYPE disputestatus AS ENUM ('pending', 'under_review', 'resolved', 'rejected', 'appealed');
            END IF;
        END $$;
    """)
    
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'disputeresolution') THEN
                CREATE TYPE disputeresolution AS ENUM ('full_refund', 'partial_refund', 'explanation', 'rejected');
            END IF;
        END $$;
    """)
    
    # Create credit_packages table
    op.create_table('credit_packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('monthly_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('credit_amount', sa.Integer(), nullable=False),
        sa.Column('credit_rate', sa.Numeric(precision=10, scale=4), nullable=False),
        sa.Column('features', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('sort_order', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_packages_id'), 'credit_packages', ['id'], unique=False)
    
    # Create user_subscriptions table
    op.create_table('user_subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('package_id', sa.Integer(), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('current_period_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('trial_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('trial_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['package_id'], ['credit_packages.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_subscriptions_id'), 'user_subscriptions', ['id'], unique=False)
    op.create_index(op.f('ix_user_subscriptions_user_id'), 'user_subscriptions', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_subscriptions_package_id'), 'user_subscriptions', ['package_id'], unique=False)
    
    # Create credit_disputes table
    op.create_table('credit_disputes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('transaction_id', sa.String(length=255), nullable=False),  # Changed to String to match credits_transactions.id
        sa.Column('reason', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requested_refund', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('resolution', sa.String(length=50), nullable=True),
        sa.Column('resolved_amount', sa.Integer(), nullable=True),
        sa.Column('admin_id', sa.Integer(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.ForeignKeyConstraint(['transaction_id'], ['credits_transactions.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_disputes_id'), 'credit_disputes', ['id'], unique=False)
    op.create_index(op.f('ix_credit_disputes_user_id'), 'credit_disputes', ['user_id'], unique=False)
    op.create_index(op.f('ix_credit_disputes_transaction_id'), 'credit_disputes', ['transaction_id'], unique=False)
    
    # Create credit_promotions table
    op.create_table('credit_promotions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('discount_type', sa.String(length=50), nullable=False),
        sa.Column('discount_value', sa.Numeric(precision=10, scale=4), nullable=False),
        sa.Column('max_discount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('package_ids', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('user_groups', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('min_purchase', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('max_uses', sa.Integer(), nullable=True),
        sa.Column('current_uses', sa.Integer(), default=0),
        sa.Column('max_uses_per_user', sa.Integer(), default=1),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_promotions_id'), 'credit_promotions', ['id'], unique=False)
    
    # Note: credit_status column and credits_transactions columns are already added by migration 012
    
    # Insert default credit packages
    op.execute("""
        INSERT INTO credit_packages (name, description, monthly_price, credit_amount, credit_rate, features, is_featured, sort_order)
        VALUES 
        ('Starter', 'Perfect for small businesses getting started with automation', 19.99, 200, 0.1000, '["Basic automation tools", "Email support", "Standard processing"]', true, 1),
        ('Professional', 'Ideal for growing businesses with moderate automation needs', 49.99, 600, 0.0833, '["Advanced automation tools", "Priority support", "Faster processing", "API access"]', true, 2),
        ('Enterprise', 'For large organizations with extensive automation requirements', 99.99, 1500, 0.0667, '["Premium automation tools", "24/7 support", "Fastest processing", "API access", "Custom integrations", "Dedicated account manager"]', true, 3)
    """)
    
    # Update existing credit transactions to have transaction_type
    op.execute("UPDATE credits_transactions SET transaction_type = 'service' WHERE transaction_type IS NULL")


def downgrade():
    # Note: credit_status column and credits_transactions columns are managed by migration 012
    
    # Drop tables
    op.drop_table('credit_promotions')
    op.drop_table('credit_disputes')
    op.drop_table('user_subscriptions')
    op.drop_table('credit_packages')
    
    # Drop enum types
    dispute_resolution = postgresql.ENUM('full_refund', 'partial_refund', 'explanation', 'rejected', name='disputeresolution')
    dispute_resolution.drop(op.get_bind())
    
    dispute_status = postgresql.ENUM('pending', 'under_review', 'resolved', 'rejected', 'appealed', name='disputestatus')
    dispute_status.drop(op.get_bind())
    
    subscription_status = postgresql.ENUM('active', 'paused', 'cancelled', 'expired', 'trial', name='subscriptionstatus')
    subscription_status.drop(op.get_bind())
