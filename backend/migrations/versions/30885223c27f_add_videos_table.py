"""Add videos table

Revision ID: 30885223c27f
Revises: e0caa5672a0b
Create Date: 2025-08-21 13:26:48.181488

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '30885223c27f'
down_revision = 'e0caa5672a0b'
branch_labels = None
depends_on = None


def upgrade():
    # Create videos table
    op.create_table('videos',
        sa.Column('id', sa.String(), nullable=False),  # UUID as string
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.String(255), nullable=True),  # Redis job ID
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('negative_prompt', sa.Text(), nullable=True),
        sa.Column('aspect_ratio', sa.String(20), nullable=False, server_default='16:9'),
        sa.Column('model_id', sa.String(100), nullable=False),
        sa.Column('seconds', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('cost_cents', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('file_key', sa.String(500), nullable=True),  # Full path to video file
        sa.Column('thumb_key', sa.String(500), nullable=True),  # Full path to thumbnail
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index(op.f('ix_videos_user_id'), 'videos', ['user_id'], unique=False)
    op.create_index(op.f('ix_videos_status'), 'videos', ['status'], unique=False)
    op.create_index(op.f('ix_videos_created_at'), 'videos', ['created_at'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_videos_created_at'), table_name='videos')
    op.drop_index(op.f('ix_videos_status'), table_name='videos')
    op.drop_index(op.f('ix_videos_user_id'), table_name='videos')
    
    # Drop table
    op.drop_table('videos')
