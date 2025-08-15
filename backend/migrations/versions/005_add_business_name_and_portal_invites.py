"""Add business_name field and portal_invites table

Revision ID: 005_add_business_name_and_portal_invites
Revises: add_business_tables
Create Date: 2025-08-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_add_business_name_and_portal_invites'
down_revision = 'add_business_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add business_name column to customers table
    op.add_column('customers', sa.Column('business_name', sa.String(255), nullable=True))
    
    # Add index to phone column for faster lookups
    op.create_index(op.f('ix_customers_phone'), 'customers', ['phone'], unique=False)
    
    # Create portal_invites table
    op.create_table('portal_invites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('invite_token', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('status', sa.String(50), nullable=True, default='pending'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invite_token')
    )
    op.create_index(op.f('ix_portal_invites_customer_id'), 'portal_invites', ['customer_id'], unique=False)
    op.create_index(op.f('ix_portal_invites_invite_token'), 'portal_invites', ['invite_token'], unique=False)
    op.create_index(op.f('ix_portal_invites_email'), 'portal_invites', ['email'], unique=False)


def downgrade():
    # Drop portal_invites table
    op.drop_index(op.f('ix_portal_invites_email'), table_name='portal_invites')
    op.drop_index(op.f('ix_portal_invites_invite_token'), table_name='portal_invites')
    op.drop_index(op.f('ix_portal_invites_customer_id'), table_name='portal_invites')
    op.drop_table('portal_invites')
    
    # Drop phone index
    op.drop_index(op.f('ix_customers_phone'), table_name='customers')
    
    # Remove business_name column
    op.drop_column('customers', 'business_name')
