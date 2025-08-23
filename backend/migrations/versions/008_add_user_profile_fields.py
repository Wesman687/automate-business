"""Add user profile fields for branding and business information

Revision ID: 008_add_user_profile_fields
Revises: 007_add_file_uploads
Create Date: 2024-01-15 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008_add_user_profile_fields'
down_revision = '007_add_file_uploads'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to users table
    op.add_column('users', sa.Column('industry', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('industry_other', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('brand_colors', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('brand_color_tags', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('brand_color_tag_others', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('users', sa.Column('brand_style', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('brand_style_other', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('brand_guidelines', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('website_url', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('github_url', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('portfolio_url', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('social_media', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade():
    # Remove added columns
    op.drop_column('users', 'social_media')
    op.drop_column('users', 'portfolio_url')
    op.drop_column('users', 'github_url')
    op.drop_column('users', 'website_url')
    op.drop_column('users', 'brand_guidelines')
    op.drop_column('users', 'brand_style_other')
    op.drop_column('users', 'brand_style')
    op.drop_column('users', 'brand_color_tag_others')
    op.drop_column('users', 'brand_color_tags')
    op.drop_column('users', 'brand_colors')
    op.drop_column('users', 'industry_other')
    op.drop_column('users', 'industry')

