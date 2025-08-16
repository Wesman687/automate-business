"""Add email accounts table

Revision ID: 006_add_email_accounts
Revises: 005_add_business_name_and_portal_invites
Create Date: 2025-08-16 22:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '006_add_email_accounts'
down_revision = '005_add_business_name_and_portal_invites'
branch_labels = None
depends_on = None

def upgrade():
    # Create email_accounts table
    op.create_table(
        'email_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password', sa.Text(), nullable=False),
        sa.Column('imap_server', sa.String(length=255), nullable=False, server_default='imap.gmail.com'),
        sa.Column('imap_port', sa.Integer(), nullable=False, server_default='993'),
        sa.Column('smtp_server', sa.String(length=255), nullable=False, server_default='smtp.gmail.com'),
        sa.Column('smtp_port', sa.Integer(), nullable=False, server_default='587'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=func.now()),
        sa.Column('created_by', sa.String(length=100)),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    
    # Create indexes
    op.create_index('ix_email_accounts_id', 'email_accounts', ['id'])
    op.create_index('ix_email_accounts_email', 'email_accounts', ['email'])
    op.create_index('ix_email_accounts_is_active', 'email_accounts', ['is_active'])

def downgrade():
    # Drop indexes
    op.drop_index('ix_email_accounts_is_active')
    op.drop_index('ix_email_accounts_email')
    op.drop_index('ix_email_accounts_id')
    
    # Drop table
    op.drop_table('email_accounts')
