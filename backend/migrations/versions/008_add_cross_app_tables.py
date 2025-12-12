"""Add cross-app integration tables

Revision ID: 008
Revises: 007_add_file_uploads
Create Date: 2025-01-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade():
    # Create app_integrations table
    op.create_table('app_integrations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('app_id', sa.String(length=255), nullable=False),
        sa.Column('app_name', sa.String(length=255), nullable=False),
        sa.Column('app_domain', sa.String(length=500), nullable=False),
        sa.Column('app_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('primary_color', sa.String(length=7), nullable=True),
        sa.Column('permissions', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('max_users', sa.Integer(), nullable=True),
        sa.Column('is_public', sa.Boolean(), default=False, nullable=True),
        sa.Column('api_key_hash', sa.String(length=255), nullable=True),
        sa.Column('webhook_url', sa.String(length=500), nullable=True),
        sa.Column('allowed_origins', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=50), default='pending_approval', nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_activity', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('app_id')
    )
    
    # Create indexes for app_integrations
    op.create_index(op.f('ix_app_integrations_id'), 'app_integrations', ['id'], unique=False)
    op.create_index(op.f('ix_app_integrations_app_id'), 'app_integrations', ['app_id'], unique=True)
    op.create_index(op.f('ix_app_integrations_status'), 'app_integrations', ['status'], unique=False)
    
    # Create cross_app_sessions table
    op.create_table('cross_app_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('app_id', sa.Integer(), nullable=False),
        sa.Column('session_token', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=50), default='active', nullable=False),
        sa.Column('permissions', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('app_user_id', sa.String(length=255), nullable=True),
        sa.Column('app_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['app_id'], ['app_integrations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_token')
    )
    
    # Create indexes for cross_app_sessions
    op.create_index(op.f('ix_cross_app_sessions_id'), 'cross_app_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_cross_app_sessions_user_id'), 'cross_app_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_cross_app_sessions_app_id'), 'cross_app_sessions', ['app_id'], unique=False)
    op.create_index(op.f('ix_cross_app_sessions_session_token'), 'cross_app_sessions', ['session_token'], unique=True)
    op.create_index(op.f('ix_cross_app_sessions_status'), 'cross_app_sessions', ['status'], unique=False)
    op.create_index(op.f('ix_cross_app_sessions_expires_at'), 'cross_app_sessions', ['expires_at'], unique=False)
    
    # Create app_credit_usage table
    op.create_table('app_credit_usage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('app_id', sa.Integer(), nullable=False),
        sa.Column('credits_used', sa.Integer(), default=0, nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('app_user_id', sa.String(length=255), nullable=True),
        sa.Column('app_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['app_id'], ['app_integrations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for app_credit_usage
    op.create_index(op.f('ix_app_credit_usage_id'), 'app_credit_usage', ['id'], unique=False)
    op.create_index(op.f('ix_app_credit_usage_user_id'), 'app_credit_usage', ['user_id'], unique=False)
    op.create_index(op.f('ix_app_credit_usage_app_id'), 'app_credit_usage', ['app_id'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_app_credit_usage_app_id'), table_name='app_credit_usage')
    op.drop_index(op.f('ix_app_credit_usage_user_id'), table_name='app_credit_usage')
    op.drop_index(op.f('ix_app_credit_usage_id'), table_name='app_credit_usage')
    op.drop_index(op.f('ix_cross_app_sessions_expires_at'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_status'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_session_token'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_app_id'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_user_id'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_id'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_app_integrations_status'), table_name='app_integrations')
    op.drop_index(op.f('ix_app_integrations_app_id'), table_name='app_integrations')
    op.drop_index(op.f('ix_app_integrations_id'), table_name='app_integrations')
    
    # Drop tables
    op.drop_table('app_credit_usage')
    op.drop_table('cross_app_sessions')
    op.drop_table('app_integrations')

