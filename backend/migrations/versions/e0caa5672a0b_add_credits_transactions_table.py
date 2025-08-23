"""Add credits_transactions table

Revision ID: e0caa5672a0b
Revises: 93f04f695e33
Create Date: 2025-08-21 13:19:44.162842

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e0caa5672a0b'
down_revision = '93f04f695e33'
branch_labels = None
depends_on = None


def upgrade():
    # Create credits_transactions table
    op.create_table('credits_transactions',
        sa.Column('id', sa.String(), nullable=False),  # UUID as string
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.String(255), nullable=True),  # Redis job ID
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index(op.f('ix_credits_transactions_user_id'), 'credits_transactions', ['user_id'], unique=False)
    op.create_index(op.f('ix_credits_transactions_created_at'), 'credits_transactions', ['created_at'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_credits_transactions_created_at'), table_name='credits_transactions')
    op.drop_index(op.f('ix_credits_transactions_user_id'), table_name='credits_transactions')
    
    # Drop table
    op.drop_table('credits_transactions')
