# Scraper Tables Database Schema

This document describes the database tables added for the AI scraper/scraping jobs functionality.

## Tables Overview

### 1. `extractor_schemas`
Stores JSON schemas for data extraction from web pages.

**Key Fields:**
- `id`: UUID primary key
- `user_id`: References the user who owns this schema
- `name`: Human-readable name for the schema
- `version`: Schema version (default: '1.0')
- `schema_definition`: JSONB field containing the actual JSON schema
- `strict_validation`: Whether to strictly validate extracted data
- `allow_extra_fields`: Whether to allow fields not in the schema
- `is_public`: Whether this schema can be used by other users

**Use Case:** Define the structure of data you want to extract from websites.

### 2. `scraping_jobs`
Configuration for scraping jobs that will be executed.

**Key Fields:**
- `id`: UUID primary key
- `user_id`: References the user who owns this job
- `name`: Human-readable name for the job
- `target_url`: The URL to scrape
- `pagination_type`: How to handle pagination (e.g., 'next_button', 'url_pattern')
- `extractor_schema_id`: Reference to the schema to use for extraction
- `options`: JSON field for additional configuration
- `schedule_cron`: Optional cron expression for scheduled scraping
- `schedule_timezone`: Timezone for the cron schedule

**Use Case:** Configure what to scrape, where to scrape it, and how often.

### 3. `runs`
Individual execution instances of scraping jobs.

**Key Fields:**
- `id`: UUID primary key
- `job_id`: References the scraping job being executed
- `status`: Current status ('queued', 'running', 'completed', 'failed')
- `pages_fetched`: Number of pages processed
- `items_found`: Number of items discovered
- `items_extracted`: Number of items successfully extracted
- `credits_charged`: Credits consumed for this run
- `idempotency_key`: Unique key to prevent duplicate runs
- `metadata`: Additional JSON data about the run

**Use Case:** Track the execution and results of individual scraping runs.

### 4. `results`
The actual data extracted from web pages.

**Key Fields:**
- `id`: UUID primary key
- `run_id`: References the run that produced this result
- `data`: JSONB field containing the extracted data
- `source_url`: URL where this data was extracted from
- `content_hash`: Hash of the source content for deduplication
- `confidence_score`: How confident the AI is in the extraction

**Use Case:** Store and retrieve the actual scraped data.

### 5. `exports`
Data export operations and generated files.

**Key Fields:**
- `id`: UUID primary key
- `run_id`: References the run being exported
- `user_id`: References the user requesting the export
- `format`: Export format (e.g., 'csv', 'json', 'excel')
- `status`: Export status ('processing', 'completed', 'failed')
- `download_url`: URL to download the exported file
- `expires_at`: When the download link expires

**Use Case:** Generate downloadable exports of scraped data.

## Relationships

```
users
├── extractor_schemas (1:N)
├── scraping_jobs (1:N)
└── exports (1:N)

extractor_schemas
└── scraping_jobs (1:N)

scraping_jobs
└── runs (1:N)

runs
├── results (1:N)
└── exports (1:N)
```

## Running the Migration

To create these tables in your database:

```bash
cd backend
python run_scraper_migration.py
```

Or manually with Alembic:

```bash
cd backend
alembic upgrade 015
```

## Example Usage

### Creating an Extractor Schema

```python
from database.scraper_models import ExtractorSchema

schema = ExtractorSchema(
    user_id=user.id,
    name="Product Information",
    description="Extract product details from e-commerce pages",
    schema_definition={
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "price": {"type": "number"},
            "description": {"type": "string"},
            "images": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["title", "price"]
    }
)
```

### Creating a Scraping Job

```python
from database.scraper_models import ScrapingJob

job = ScrapingJob(
    user_id=user.id,
    name="Daily Product Scraping",
    target_url="https://example.com/products",
    pagination_type="next_button",
    extractor_schema_id=schema.id,
    options={
        "max_pages": 10,
        "delay_between_requests": 1.0
    },
    schedule_cron="0 9 * * *",  # Daily at 9 AM
    schedule_timezone="UTC"
)
```

### Tracking a Run

```python
from database.scraper_models import Run
import uuid

run = Run(
    job_id=job.id,
    status="running",
    idempotency_key=str(uuid.uuid4()),
    started_at=datetime.utcnow()
)
```

## Notes

- **Credit Billing**: Credit consumption is tracked in the `runs` table and handled by the main server's credit system.
- **User References**: All tables reference the existing `users` table from the main database.
- **Authentication**: User authentication is handled by the main server's auth system.
- **UUIDs**: All primary keys use UUIDs for better scalability and security.
- **JSONB**: PostgreSQL JSONB fields are used for flexible schema definitions and metadata storage.

## Security Considerations

- All tables include `user_id` foreign keys to ensure data isolation
- Cascade deletes ensure data consistency when users are removed
- UUIDs prevent enumeration attacks
- JSONB fields are validated at the application level before storage
