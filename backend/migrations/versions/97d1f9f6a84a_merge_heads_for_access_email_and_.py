"""merge heads for access_email and additional_resource_info

Revision ID: 97d1f9f6a84a
Revises: 009_add_access_email, 80fa34750181
Create Date: 2025-08-22 22:30:39.247907

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '97d1f9f6a84a'
down_revision = ('009_add_access_email', '80fa34750181')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
