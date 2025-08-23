"""Fix missing user profile columns

Revision ID: 6021ac4ef126
Revises: 007_add_file_uploads
Create Date: 2025-08-21 13:55:23.424279

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6021ac4ef126'
down_revision = '007_add_file_uploads'
branch_labels = None
depends_on = None


def upgrade():
    # Add only the missing columns that the SQLAlchemy model expects
    # Check which columns exist and add only the missing ones
    
    # Add user profile fields if they don't exist
    op.execute("""
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
        ADD COLUMN IF NOT EXISTS industry_other VARCHAR(255),
        ADD COLUMN IF NOT EXISTS brand_colors JSON,
        ADD COLUMN IF NOT EXISTS brand_color_tags JSON,
        ADD COLUMN IF NOT EXISTS brand_color_tag_others JSON,
        ADD COLUMN IF NOT EXISTS brand_style VARCHAR(255),
        ADD COLUMN IF NOT EXISTS brand_style_other VARCHAR(255),
        ADD COLUMN IF NOT EXISTS brand_guidelines TEXT,
        ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
        ADD COLUMN IF NOT EXISTS social_media JSON;
    """)


def downgrade():
    # Remove the added columns
    op.execute("""
        ALTER TABLE users 
        DROP COLUMN IF EXISTS social_media,
        DROP COLUMN IF EXISTS portfolio_url,
        DROP COLUMN IF EXISTS github_url,
        DROP COLUMN IF EXISTS website_url,
        DROP COLUMN IF EXISTS brand_guidelines,
        DROP COLUMN IF EXISTS brand_style_other,
        DROP COLUMN IF EXISTS brand_style,
        DROP COLUMN IF EXISTS brand_color_tag_others,
        DROP COLUMN IF EXISTS brand_color_tags,
        DROP COLUMN IF EXISTS brand_colors,
        DROP COLUMN IF EXISTS industry_other,
        DROP COLUMN IF EXISTS industry;
    """)
