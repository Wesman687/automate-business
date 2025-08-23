"""merge heads for email verification fields

Revision ID: 969df289d53b
Revises: 010_email_verification, 97d1f9f6a84a
Create Date: 2025-08-23 15:47:38.122279

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '969df289d53b'
down_revision = ('010_email_verification', '97d1f9f6a84a')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
