"""Add missing job fields for enhanced job details

Revision ID: 011_add_missing_job_fields
Revises: 969df289d53b
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '011_add_missing_job_fields'
down_revision = '969df289d53b'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing business information fields
    op.add_column('jobs', sa.Column('business_name', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('business_type', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('industry', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('industry_other', sa.String(255), nullable=True))
    
    # Add missing project details fields
    op.add_column('jobs', sa.Column('project_goals', sa.Text, nullable=True))
    op.add_column('jobs', sa.Column('target_audience', sa.Text, nullable=True))
    op.add_column('jobs', sa.Column('timeline', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('budget_range', sa.String(255), nullable=True))
    
    # Add missing branding & design fields
    op.add_column('jobs', sa.Column('brand_colors', sa.JSON, nullable=True))
    op.add_column('jobs', sa.Column('brand_color_tags', sa.JSON, nullable=True))
    op.add_column('jobs', sa.Column('brand_color_tag_others', sa.JSON, nullable=True))
    op.add_column('jobs', sa.Column('brand_style', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('brand_style_other', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('logo_files', sa.JSON, nullable=True))
    op.add_column('jobs', sa.Column('brand_guidelines', sa.Text, nullable=True))
    
    # Add missing resources & links fields
    op.add_column('jobs', sa.Column('website_url', sa.String(500), nullable=True))
    op.add_column('jobs', sa.Column('github_url', sa.String(500), nullable=True))
    op.add_column('jobs', sa.Column('portfolio_url', sa.String(500), nullable=True))
    op.add_column('jobs', sa.Column('social_media', sa.JSON, nullable=True))
    
    # Add unified resources array
    op.add_column('jobs', sa.Column('resources', sa.JSON, nullable=True))


def downgrade():
    # Remove the added columns
    op.drop_column('jobs', 'resources')
    op.drop_column('jobs', 'social_media')
    op.drop_column('jobs', 'portfolio_url')
    op.drop_column('jobs', 'github_url')
    op.drop_column('jobs', 'website_url')
    op.drop_column('jobs', 'brand_guidelines')
    op.drop_column('jobs', 'logo_files')
    op.drop_column('jobs', 'brand_style_other')
    op.drop_column('jobs', 'brand_style')
    op.drop_column('jobs', 'brand_color_tag_others')
    op.drop_column('jobs', 'brand_color_tags')
    op.drop_column('jobs', 'brand_colors')
    op.drop_column('jobs', 'budget_range')
    op.drop_column('jobs', 'timeline')
    op.drop_column('jobs', 'target_audience')
    op.drop_column('jobs', 'project_goals')
    op.drop_column('jobs', 'industry_other')
    op.drop_column('jobs', 'industry')
    op.drop_column('jobs', 'business_type')
    op.drop_column('jobs', 'business_name')
