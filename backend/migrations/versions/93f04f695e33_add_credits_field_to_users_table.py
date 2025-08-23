"""Add credits field to users table

Revision ID: 93f04f695e33
Revises: 008_add_user_profile_fields
Create Date: 2025-08-21 13:19:28.090295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '93f04f695e33'
down_revision = '008_add_user_profile_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add credits field to users table
    op.add_column('users', sa.Column('credits', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    # Remove credits field from users table
    op.drop_column('users', 'credits')
