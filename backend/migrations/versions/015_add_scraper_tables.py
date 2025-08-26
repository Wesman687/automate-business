"""Add scraper tables

Revision ID: 015
Revises: 014_add_cross_app_tables
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '015'
down_revision = '014'
branch_labels = None
depends_on = None


def upgrade():
    # Enable UUID extension if not already enabled
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Create extractor_schemas table
    op.create_table('extractor_schemas',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('version', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('schema_definition', sa.JSON(), nullable=False),
        sa.Column('strict_validation', sa.Boolean(), default=True),
        sa.Column('allow_extra_fields', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_public', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for extractor_schemas
    op.create_index('ix_extractor_schemas_user_id', 'extractor_schemas', ['user_id'])
    
    # Create scraping_jobs table
    op.create_table('scraping_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('target_url', sa.Text(), nullable=False),
        sa.Column('pagination_type', sa.String(length=50), nullable=False),
        sa.Column('extractor_schema_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('options', sa.JSON(), nullable=False, default={}),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('schedule_cron', sa.String(length=100), nullable=True),
        sa.Column('schedule_timezone', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for scraping_jobs
    op.create_index('ix_scraping_jobs_user_id', 'scraping_jobs', ['user_id'])
    
    # Create runs table
    op.create_table('runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, default='queued'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('pages_fetched', sa.Integer(), default=0),
        sa.Column('items_found', sa.Integer(), default=0),
        sa.Column('items_extracted', sa.Integer(), default=0),
        sa.Column('credits_charged', sa.Numeric(precision=10, scale=2), default=0),
        sa.Column('idempotency_key', sa.String(length=255), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('metadata', sa.JSON(), default={}),
        sa.ForeignKeyConstraint(['job_id'], ['scraping_jobs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('idempotency_key')
    )
    
    # Create indexes for runs
    op.create_index('ix_runs_job_id', 'runs', ['job_id'])
    op.create_index('ix_runs_idempotency_key', 'runs', ['idempotency_key'])
    
    # Create results table
    op.create_table('results',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('extracted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('confidence_score', sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for results
    op.create_index('ix_results_run_id', 'results', ['run_id'])
    op.create_index('ix_results_content_hash', 'results', ['content_hash'])
    
    # Create exports table
    op.create_table('exports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('format', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, default='processing'),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('download_url', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for exports
    op.create_index('ix_exports_run_id', 'exports', ['run_id'])
    op.create_index('ix_exports_user_id', 'exports', ['user_id'])
    
    # Add comments to tables
    op.execute("COMMENT ON TABLE extractor_schemas IS 'JSON schemas for data extraction'")
    op.execute("COMMENT ON TABLE scraping_jobs IS 'Scraping job configurations'")
    op.execute("COMMENT ON TABLE runs IS 'Individual scraping execution instances'")
    op.execute("COMMENT ON TABLE results IS 'Extracted data from scraping runs'")
    op.execute("COMMENT ON TABLE exports IS 'Data export operations and files'")


def downgrade():
    # Drop tables in reverse order
    op.drop_table('exports')
    op.drop_table('results')
    op.drop_table('runs')
    op.drop_table('scraping_jobs')
    op.drop_table('extractor_schemas')
