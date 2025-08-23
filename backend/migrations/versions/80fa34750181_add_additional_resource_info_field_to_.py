"""Add additional_resource_info field to jobs table

Revision ID: 80fa34750181
Revises: ed88ea4ebabb
Create Date: 2025-08-21 14:18:07.619735

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '80fa34750181'
down_revision = 'ed88ea4ebabb'
branch_labels = None
depends_on = None


def upgrade():
    # Add additional_resource_info field to jobs table
    op.add_column('jobs', sa.Column('additional_resource_info', sa.JSON(), nullable=True))


def downgrade():
    # Remove additional_resource_info field from jobs table
    op.drop_column('jobs', 'additional_resource_info')
