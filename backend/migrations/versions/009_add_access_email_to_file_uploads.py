"""Add access_email to file_uploads table

Revision ID: 009_add_access_email
Revises: ed88ea4ebabb
Create Date: 2025-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '009_add_access_email'
down_revision = 'ed88ea4ebabb'
branch_labels = None
depends_on = None

def upgrade():
    # Add access_email column to file_uploads table
    op.add_column('file_uploads', sa.Column('access_email', sa.String(255), nullable=True))
    
    # Update existing records to use user email as access_email
    # This is a temporary fix - in production you'd want to backfill with actual data
    op.execute("""
        UPDATE file_uploads 
        SET access_email = (
            SELECT email 
            FROM users 
            WHERE users.id = file_uploads.user_id OR users.id = file_uploads.customer_id
            LIMIT 1
        )
        WHERE access_email IS NULL
    """)
    
    # Make the column non-nullable after backfilling
    op.alter_column('file_uploads', 'access_email', nullable=False)

def downgrade():
    # Remove access_email column
    op.drop_column('file_uploads', 'access_email')
