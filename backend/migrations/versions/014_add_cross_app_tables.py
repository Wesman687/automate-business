"""Add cross-app authentication tables

Revision ID: 014
Revises: 013_credits_system_clean
Create Date: 2024-12-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '014'
down_revision = '013_credits_system_clean'
branch_labels = None
depends_on = None


def upgrade() -> None:
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
        sa.Column('is_public', sa.Boolean(), nullable=False, default=False),
        sa.Column('api_key_hash', sa.String(length=255), nullable=True),
        sa.Column('webhook_url', sa.String(length=500), nullable=True),
        sa.Column('allowed_origins', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.Enum('active', 'inactive', 'suspended', 'pending_approval', name='appstatus'), nullable=False, default='pending_approval'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_activity', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('app_id')
    )
    op.create_index(op.f('ix_app_integrations_status'), 'app_integrations', ['status'], unique=False)
    op.create_index(op.f('ix_app_integrations_app_id'), 'app_integrations', ['app_id'], unique=False)
    op.create_index(op.f('ix_app_integrations_id'), 'app_integrations', ['id'], unique=False)

    # Create cross_app_sessions table
    op.create_table('cross_app_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_token', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('app_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('active', 'expired', 'revoked', name='crossappsessionstatus'), nullable=False, default='active'),
        sa.Column('permissions_granted', postgresql.JSON(astext_type=sa.Text()), nullable=False, default=[]),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('device_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_activity', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_reason', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_token')
    )
    op.create_index(op.f('ix_cross_app_sessions_user_app'), 'cross_app_sessions', ['user_id', 'app_id'], unique=False)
    op.create_index(op.f('ix_cross_app_sessions_token'), 'cross_app_sessions', ['session_token'], unique=False)
    op.create_index(op.f('ix_cross_app_sessions_id'), 'cross_app_sessions', ['id'], unique=False)

    # Create app_credit_usage table
    op.create_table('app_credit_usage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('app_id', sa.Integer(), nullable=False),
        sa.Column('credits_consumed', sa.Integer(), nullable=False, default=0),
        sa.Column('credits_purchased', sa.Integer(), nullable=False, default=0),
        sa.Column('last_consumption', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_purchase', sa.DateTime(timezone=True), nullable=True),
        sa.Column('app_user_id', sa.String(length=255), nullable=True),
        sa.Column('app_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_app_credit_usage_user_app'), 'app_credit_usage', ['user_id', 'app_id'], unique=False)
    op.create_index(op.f('ix_app_credit_usage_id'), 'app_credit_usage', ['id'], unique=False)

    # Add foreign key constraints
    op.create_foreign_key('fk_app_integrations_created_by', 'app_integrations', 'users', ['created_by'], ['id'])
    op.create_foreign_key('fk_app_integrations_approved_by', 'app_integrations', 'users', ['approved_by'], ['id'])
    op.create_foreign_key('fk_cross_app_sessions_user_id', 'cross_app_sessions', 'users', ['user_id'], ['id'])
    op.create_foreign_key('fk_cross_app_sessions_app_id', 'cross_app_sessions', 'app_integrations', ['app_id'], ['id'])
    op.create_foreign_key('fk_app_credit_usage_user_id', 'app_credit_usage', 'users', ['user_id'], ['id'])
    op.create_foreign_key('fk_app_credit_usage_app_id', 'app_credit_usage', 'app_integrations', ['app_id'], ['id'])


def downgrade() -> None:
    # Remove foreign key constraints first
    op.drop_constraint('fk_app_credit_usage_app_id', 'app_credit_usage', type_='foreignkey')
    op.drop_constraint('fk_app_credit_usage_user_id', 'app_credit_usage', type_='foreignkey')
    op.drop_constraint('fk_cross_app_sessions_app_id', 'cross_app_sessions', type_='foreignkey')
    op.drop_constraint('fk_cross_app_sessions_user_id', 'cross_app_sessions', type_='foreignkey')
    op.drop_constraint('fk_app_integrations_approved_by', 'app_integrations', type_='foreignkey')
    op.drop_constraint('fk_app_integrations_created_by', 'app_integrations', type_='foreignkey')

    # Drop tables
    op.drop_index(op.f('ix_app_credit_usage_id'), table_name='app_credit_usage')
    op.drop_index(op.f('ix_app_credit_usage_user_app'), table_name='app_credit_usage')
    op.drop_table('app_credit_usage')

    op.drop_index(op.f('ix_cross_app_sessions_id'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_token'), table_name='cross_app_sessions')
    op.drop_index(op.f('ix_cross_app_sessions_user_app'), table_name='cross_app_sessions')
    op.drop_table('cross_app_sessions')

    op.drop_index(op.f('ix_app_integrations_id'), table_name='app_integrations')
    op.drop_index(op.f('ix_app_integrations_app_id'), table_name='app_integrations')
    op.drop_index(op.f('ix_app_integrations_status'), table_name='app_integrations')
    op.drop_table('app_integrations')

    # Drop custom enum types
    op.execute("DROP TYPE IF EXISTS crossappsessionstatus")
    op.execute("DROP TYPE IF EXISTS appstatus")
