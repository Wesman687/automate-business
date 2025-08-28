"""add_is_active_to_users_table

Revision ID: 232974afbfc4
Revises: 015
Create Date: 2025-08-27 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '232974afbfc4'
down_revision = '015'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_active column to users table
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    
    # Create index for better performance on active user queries
    op.create_index('ix_users_is_active', 'users', ['is_active'])


def downgrade():
    # Drop the index first
    op.drop_index('ix_users_is_active', 'users')
    
    # Remove the column
    op.drop_column('users', 'is_active')
