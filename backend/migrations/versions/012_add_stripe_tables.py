"""Add Stripe Tables and Enhanced Credit System

Revision ID: 012
Revises: 011_add_missing_job_fields
Create Date: 2025-01-27 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '012'
down_revision = '011_add_missing_job_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to users table
    op.add_column('users', sa.Column('credit_status', sa.String(length=50), nullable=True, server_default='active'))
    
    # Add new columns to credits_transactions table
    op.add_column('credits_transactions', sa.Column('subscription_id', sa.Integer(), nullable=True))
    op.add_column('credits_transactions', sa.Column('transaction_type', sa.String(length=50), nullable=True, server_default='service'))
    op.add_column('credits_transactions', sa.Column('dollar_amount', sa.Numeric(precision=10, scale=4), nullable=True))
    op.add_column('credits_transactions', sa.Column('stripe_payment_intent_id', sa.String(length=255), nullable=True))
    op.add_column('credits_transactions', sa.Column('transaction_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    
    # Create stripe_customers table
    op.create_table('stripe_customers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('stripe_customer_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('address', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('shipping', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('tax_exempt', sa.String(length=50), nullable=True, server_default='none'),
        sa.Column('preferred_locales', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('invoice_prefix', sa.String(length=10), nullable=True),
        sa.Column('next_invoice_sequence', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stripe_customers_id'), 'stripe_customers', ['id'], unique=False)
    op.create_index(op.f('ix_stripe_customers_user_id'), 'stripe_customers', ['user_id'], unique=True)
    op.create_index(op.f('ix_stripe_customers_stripe_customer_id'), 'stripe_customers', ['stripe_customer_id'], unique=True)
    op.create_index(op.f('ix_stripe_customers_email'), 'stripe_customers', ['email'], unique=False)
    
    # Create stripe_subscriptions table
    op.create_table('stripe_subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(length=255), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('current_period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('trial_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('trial_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('interval', sa.String(length=20), nullable=False),
        sa.Column('interval_count', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=True, server_default='USD'),
        sa.Column('product_id', sa.String(length=255), nullable=False),
        sa.Column('product_name', sa.String(length=255), nullable=False),
        sa.Column('product_description', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stripe_subscriptions_id'), 'stripe_subscriptions', ['id'], unique=False)
    op.create_index(op.f('ix_stripe_subscriptions_stripe_subscription_id'), 'stripe_subscriptions', ['stripe_subscription_id'], unique=True)
    op.create_index(op.f('ix_stripe_subscriptions_customer_id'), 'stripe_subscriptions', ['customer_id'], unique=False)
    op.create_index(op.f('ix_stripe_subscriptions_user_id'), 'stripe_subscriptions', ['user_id'], unique=False)
    op.create_index(op.f('ix_stripe_subscriptions_status'), 'stripe_subscriptions', ['status'], unique=False)
    op.create_index(op.f('ix_stripe_subscriptions_product_id'), 'stripe_subscriptions', ['product_id'], unique=False)
    
    # Create stripe_payment_intents table
    op.create_table('stripe_payment_intents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stripe_payment_intent_id', sa.String(length=255), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('subscription_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=True, server_default='USD'),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('payment_method_types', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('receipt_email', sa.String(length=255), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stripe_payment_intents_id'), 'stripe_payment_intents', ['id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_intents_stripe_payment_intent_id'), 'stripe_payment_intents', ['stripe_payment_intent_id'], unique=True)
    op.create_index(op.f('ix_stripe_payment_intents_customer_id'), 'stripe_payment_intents', ['customer_id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_intents_user_id'), 'stripe_payment_intents', ['user_id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_intents_subscription_id'), 'stripe_payment_intents', ['subscription_id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_intents_status'), 'stripe_payment_intents', ['status'], unique=False)
    
    # Create stripe_payment_methods table
    op.create_table('stripe_payment_methods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stripe_payment_method_id', sa.String(length=255), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('card_brand', sa.String(length=20), nullable=True),
        sa.Column('card_last4', sa.String(length=4), nullable=True),
        sa.Column('card_exp_month', sa.Integer(), nullable=True),
        sa.Column('card_exp_year', sa.Integer(), nullable=True),
        sa.Column('card_fingerprint', sa.String(length=255), nullable=True),
        sa.Column('billing_details', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stripe_payment_methods_id'), 'stripe_payment_methods', ['id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_methods_stripe_payment_method_id'), 'stripe_payment_methods', ['stripe_payment_method_id'], unique=True)
    op.create_index(op.f('ix_stripe_payment_methods_customer_id'), 'stripe_payment_methods', ['customer_id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_methods_user_id'), 'stripe_payment_methods', ['user_id'], unique=False)
    op.create_index(op.f('ix_stripe_payment_methods_type'), 'stripe_payment_methods', ['type'], unique=False)
    
    # Create stripe_webhook_events table
    op.create_table('stripe_webhook_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stripe_event_id', sa.String(length=255), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('api_version', sa.String(length=20), nullable=True),
        sa.Column('created', sa.DateTime(timezone=True), nullable=True),
        sa.Column('data', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('livemode', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('processed', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('received_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stripe_webhook_events_id'), 'stripe_webhook_events', ['id'], unique=False)
    op.create_index(op.f('ix_stripe_webhook_events_stripe_event_id'), 'stripe_webhook_events', ['stripe_event_id'], unique=True)
    op.create_index(op.f('ix_stripe_webhook_events_event_type'), 'stripe_webhook_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_stripe_webhook_events_processed'), 'stripe_webhook_events', ['processed'], unique=False)
    op.create_index(op.f('ix_stripe_webhook_events_type_processed'), 'stripe_webhook_events', ['event_type', 'processed'], unique=False)
    
    # Create stripe_products table
    op.create_table('stripe_products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stripe_product_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('unit_amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=True, server_default='USD'),
        sa.Column('recurring_interval', sa.String(length=20), nullable=False),
        sa.Column('recurring_interval_count', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('features', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stripe_products_id'), 'stripe_products', ['id'], unique=False)
    op.create_index(op.f('ix_stripe_products_stripe_product_id'), 'stripe_products', ['stripe_product_id'], unique=True)
    op.create_index(op.f('ix_stripe_products_name'), 'stripe_products', ['name'], unique=False)
    op.create_index(op.f('ix_stripe_products_active'), 'stripe_products', ['active'], unique=False)
    
    # Create idempotency_keys table
    op.create_table('idempotency_keys',
        sa.Column('id', sa.String(length=255), nullable=False),
        sa.Column('operation_type', sa.String(length=100), nullable=False),
        sa.Column('request_hash', sa.String(length=255), nullable=False),
        sa.Column('response_data', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_idempotency_keys_id'), 'idempotency_keys', ['id'], unique=False)
    op.create_index(op.f('ix_idempotency_keys_operation_type'), 'idempotency_keys', ['operation_type'], unique=False)
    op.create_index(op.f('ix_idempotency_keys_request_hash'), 'idempotency_keys', ['request_hash'], unique=False)
    op.create_index(op.f('ix_idempotency_keys_expires_at'), 'idempotency_keys', ['expires_at'], unique=False)
    
    # Add foreign key constraints
    op.create_foreign_key('fk_stripe_customers_user_id', 'stripe_customers', 'users', ['user_id'], ['id'])
    op.create_foreign_key('fk_stripe_subscriptions_customer_id', 'stripe_subscriptions', 'stripe_customers', ['customer_id'], ['id'])
    op.create_foreign_key('fk_stripe_subscriptions_user_id', 'stripe_subscriptions', 'users', ['user_id'], ['id'])
    op.create_foreign_key('fk_stripe_payment_intents_customer_id', 'stripe_payment_intents', 'stripe_customers', ['customer_id'], ['id'])
    op.create_foreign_key('fk_stripe_payment_intents_user_id', 'stripe_payment_intents', 'users', ['user_id'], ['id'])
    op.create_foreign_key('fk_stripe_payment_intents_subscription_id', 'stripe_payment_intents', 'stripe_subscriptions', ['subscription_id'], ['id'])
    op.create_foreign_key('fk_stripe_payment_methods_customer_id', 'stripe_payment_methods', 'stripe_customers', ['customer_id'], ['id'])
    op.create_foreign_key('fk_stripe_payment_methods_user_id', 'stripe_payment_methods', 'users', ['user_id'], ['id'])
    
    # Add foreign key for credits_transactions subscription_id (commented out until user_subscriptions table exists)
    # op.create_foreign_key('fk_credits_transactions_subscription_id', 'credits_transactions', 'user_subscriptions', ['subscription_id'], ['id'])


def downgrade():
    # Remove foreign key constraints
    # op.drop_constraint('fk_credits_transactions_subscription_id', 'credits_transactions', type_='foreignkey')
    op.drop_constraint('fk_stripe_payment_methods_user_id', 'stripe_payment_methods', type_='foreignkey')
    op.drop_constraint('fk_stripe_payment_methods_customer_id', 'stripe_payment_methods', type_='foreignkey')
    op.drop_constraint('fk_stripe_payment_intents_subscription_id', 'stripe_payment_intents', type_='foreignkey')
    op.drop_constraint('fk_stripe_payment_intents_user_id', 'stripe_payment_intents', type_='foreignkey')
    op.drop_constraint('fk_stripe_payment_intents_customer_id', 'stripe_payment_intents', type_='foreignkey')
    op.drop_constraint('fk_stripe_subscriptions_user_id', 'stripe_subscriptions', type_='foreignkey')
    op.drop_constraint('fk_stripe_subscriptions_customer_id', 'stripe_subscriptions', type_='foreignkey')
    op.drop_constraint('fk_stripe_customers_user_id', 'stripe_customers', type_='foreignkey')
    
    # Drop tables
    op.drop_table('idempotency_keys')
    op.drop_table('stripe_products')
    op.drop_table('stripe_webhook_events')
    op.drop_table('stripe_payment_methods')
    op.drop_table('stripe_payment_intents')
    op.drop_table('stripe_subscriptions')
    op.drop_table('stripe_customers')
    
    # Remove columns from credits_transactions
    op.drop_column('credits_transactions', 'transaction_metadata')
    op.drop_column('credits_transactions', 'stripe_payment_intent_id')
    op.drop_column('credits_transactions', 'dollar_amount')
    op.drop_column('credits_transactions', 'transaction_type')
    op.drop_column('credits_transactions', 'subscription_id')
    
    # Remove columns from users
    op.drop_column('users', 'credit_status')
