"""Add file uploads table

Revision ID: 007
Revises: 006_add_email_accounts
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006_add_email_accounts'
branch_labels = None
depends_on = None


def upgrade():
    # Create file_uploads table
    op.create_table('file_uploads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('upload_type', sa.String(length=50), nullable=False),
        sa.Column('file_server_url', sa.String(length=500), nullable=False),
        sa.Column('file_id', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('tags', sa.String(length=500), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=True),
        sa.Column('is_deleted', sa.Boolean(), default=False, nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index(op.f('ix_file_uploads_id'), 'file_uploads', ['id'], unique=False)
    op.create_index(op.f('ix_file_uploads_upload_type'), 'file_uploads', ['upload_type'], unique=False)
    op.create_index(op.f('ix_file_uploads_user_id'), 'file_uploads', ['user_id'], unique=False)
    op.create_index(op.f('ix_file_uploads_customer_id'), 'file_uploads', ['customer_id'], unique=False)
    op.create_index(op.f('ix_file_uploads_job_id'), 'file_uploads', ['job_id'], unique=False)
    op.create_index(op.f('ix_file_uploads_uploaded_at'), 'file_uploads', ['uploaded_at'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_file_uploads_uploaded_at'), table_name='file_uploads')
    op.drop_index(op.f('ix_file_uploads_job_id'), table_name='file_uploads')
    op.drop_index(op.f('ix_file_uploads_customer_id'), table_name='file_uploads')
    op.drop_index(op.f('ix_file_uploads_user_id'), table_name='file_uploads')
    op.drop_index(op.f('ix_file_uploads_upload_type'), table_name='file_uploads')
    op.drop_index(op.f('ix_file_uploads_id'), table_name='file_uploads')
    
    # Drop table
    op.drop_table('file_uploads')
