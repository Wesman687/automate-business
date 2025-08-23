"""Add email verification fields to users table

Revision ID: 010_add_email_verification_fields
Revises: 009_add_access_email_to_file_uploads
Create Date: 2025-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '010_email_verification'
down_revision = '009_add_access_email'
branch_labels = None
depends_on = None


def upgrade():
    # Add email verification fields to users table if they don't exist
    # Check if columns exist first to avoid errors
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'is_authenticated' not in existing_columns:
        op.add_column('users', sa.Column('is_authenticated', sa.Boolean(), nullable=True, default=False))
    if 'email_verified' not in existing_columns:
        op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=True, default=False))
    if 'verification_code' not in existing_columns:
        op.add_column('users', sa.Column('verification_code', sa.String(10), nullable=True))
    if 'verification_expires' not in existing_columns:
        op.add_column('users', sa.Column('verification_expires', sa.DateTime(timezone=True), nullable=True))
    
    # Set default values for existing users (only if columns were added)
    if 'is_authenticated' not in existing_columns:
        op.execute("UPDATE users SET is_authenticated = true, email_verified = true WHERE password_hash IS NOT NULL")
        op.execute("UPDATE users SET is_authenticated = false, email_verified = false WHERE password_hash IS NULL")


def downgrade():
    # Remove email verification fields from users table
    op.drop_column('users', 'verification_expires')
    op.drop_column('users', 'verification_code')
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'is_authenticated')
