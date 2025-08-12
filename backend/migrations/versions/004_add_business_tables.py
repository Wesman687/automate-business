"""Add business management tables

Revision ID: add_business_tables
Revises: 003_add_customer_address_fields
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_business_tables'
down_revision = '003_add_customer_address_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Create invoices table
    op.create_table('invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('invoice_number', sa.String(50), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=True, default='USD'),
        sa.Column('status', sa.String(20), nullable=False, default='draft'),
        sa.Column('issue_date', sa.DateTime(), nullable=False),
        sa.Column('due_date', sa.DateTime(), nullable=False),
        sa.Column('paid_date', sa.DateTime(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('line_items', postgresql.JSON(), nullable=True),
        sa.Column('tax_amount', sa.Numeric(10, 2), nullable=True, default=0.0),
        sa.Column('discount_amount', sa.Numeric(10, 2), nullable=True, default=0.0),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_terms', sa.String(50), nullable=True, default='Net 30'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('stripe_invoice_id', sa.String(100), nullable=True),
        sa.Column('payment_link', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invoice_number')
    )
    op.create_index(op.f('ix_invoices_customer_id'), 'invoices', ['customer_id'], unique=False)
    op.create_index(op.f('ix_invoices_status'), 'invoices', ['status'], unique=False)
    op.create_index(op.f('ix_invoices_due_date'), 'invoices', ['due_date'], unique=False)

    # Create recurring_payments table
    op.create_table('recurring_payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=True, default='USD'),
        sa.Column('interval', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('next_billing_date', sa.DateTime(), nullable=False),
        sa.Column('last_billing_date', sa.DateTime(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('payment_method', sa.String(100), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recurring_payments_customer_id'), 'recurring_payments', ['customer_id'], unique=False)
    op.create_index(op.f('ix_recurring_payments_status'), 'recurring_payments', ['status'], unique=False)
    op.create_index(op.f('ix_recurring_payments_next_billing_date'), 'recurring_payments', ['next_billing_date'], unique=False)

    # Create jobs table
    op.create_table('jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='not_started'),
        sa.Column('priority', sa.String(20), nullable=True, default='medium'),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('deadline', sa.DateTime(), nullable=True),
        sa.Column('completion_date', sa.DateTime(), nullable=True),
        sa.Column('estimated_hours', sa.Numeric(8, 2), nullable=True),
        sa.Column('actual_hours', sa.Numeric(8, 2), nullable=True),
        sa.Column('hourly_rate', sa.Numeric(8, 2), nullable=True),
        sa.Column('fixed_price', sa.Numeric(10, 2), nullable=True),
        sa.Column('google_drive_links', postgresql.JSON(), nullable=True),
        sa.Column('github_repositories', postgresql.JSON(), nullable=True),
        sa.Column('workspace_links', postgresql.JSON(), nullable=True),
        sa.Column('server_details', postgresql.JSON(), nullable=True),
        sa.Column('calendar_links', postgresql.JSON(), nullable=True),
        sa.Column('meeting_links', postgresql.JSON(), nullable=True),
        sa.Column('additional_tools', postgresql.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('progress_percentage', sa.Integer(), nullable=False, default=0),
        sa.Column('milestones', postgresql.JSON(), nullable=True),
        sa.Column('deliverables', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_customer_id'), 'jobs', ['customer_id'], unique=False)
    op.create_index(op.f('ix_jobs_status'), 'jobs', ['status'], unique=False)
    op.create_index(op.f('ix_jobs_deadline'), 'jobs', ['deadline'], unique=False)

    # Create time_entries table
    op.create_table('time_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_hours', sa.Numeric(8, 2), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('billable', sa.Boolean(), nullable=True, default=True),
        sa.Column('hourly_rate', sa.Numeric(8, 2), nullable=True),
        sa.Column('amount', sa.Numeric(10, 2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_time_entries_job_id'), 'time_entries', ['job_id'], unique=False)
    op.create_index(op.f('ix_time_entries_admin_id'), 'time_entries', ['admin_id'], unique=False)
    op.create_index(op.f('ix_time_entries_start_time'), 'time_entries', ['start_time'], unique=False)


def downgrade():
    # Drop tables in reverse order
    op.drop_index(op.f('ix_time_entries_start_time'), table_name='time_entries')
    op.drop_index(op.f('ix_time_entries_admin_id'), table_name='time_entries')
    op.drop_index(op.f('ix_time_entries_job_id'), table_name='time_entries')
    op.drop_table('time_entries')
    
    op.drop_index(op.f('ix_jobs_deadline'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_status'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_customer_id'), table_name='jobs')
    op.drop_table('jobs')
    
    op.drop_index(op.f('ix_recurring_payments_next_billing_date'), table_name='recurring_payments')
    op.drop_index(op.f('ix_recurring_payments_status'), table_name='recurring_payments')
    op.drop_index(op.f('ix_recurring_payments_customer_id'), table_name='recurring_payments')
    op.drop_table('recurring_payments')
    
    op.drop_index(op.f('ix_invoices_due_date'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_status'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_customer_id'), table_name='invoices')
    op.drop_table('invoices')
