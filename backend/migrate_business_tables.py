"""
Database Migration Script for Business Management Tables
Creates Invoice, RecurringPayment, Job, and TimeEntry tables
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration - PostgreSQL only
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required for PostgreSQL")
    
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_migration():
    """Run the database migration for business tables"""
    session = SessionLocal()
    
    try:
        print("Creating business management tables...")
        
        # Create invoices table
        print("Creating invoices table...")
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS invoices (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                admin_id INTEGER NOT NULL REFERENCES admins(id),
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'USD',
                status VARCHAR(20) DEFAULT 'draft' NOT NULL,
                issue_date TIMESTAMP NOT NULL,
                due_date TIMESTAMP NOT NULL,
                paid_date TIMESTAMP,
                description TEXT,
                line_items JSON,
                tax_amount NUMERIC(10, 2) DEFAULT 0.0,
                discount_amount NUMERIC(10, 2) DEFAULT 0.0,
                total_amount NUMERIC(10, 2) NOT NULL,
                payment_terms VARCHAR(50) DEFAULT 'Net 30',
                notes TEXT,
                stripe_invoice_id VARCHAR(100),
                payment_link VARCHAR(500),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        """))
        
        # Create indexes for invoices
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_invoices_customer_id ON invoices(customer_id)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_invoices_status ON invoices(status)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_invoices_due_date ON invoices(due_date)"))
        
        # Create recurring_payments table
        print("Creating recurring_payments table...")
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS recurring_payments (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                admin_id INTEGER NOT NULL REFERENCES admins(id),
                name VARCHAR(200) NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'USD',
                interval VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'active' NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP,
                next_billing_date TIMESTAMP NOT NULL,
                last_billing_date TIMESTAMP,
                description TEXT,
                payment_method VARCHAR(100),
                stripe_subscription_id VARCHAR(100),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        """))
        
        # Create indexes for recurring_payments
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_recurring_payments_customer_id ON recurring_payments(customer_id)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_recurring_payments_status ON recurring_payments(status)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_recurring_payments_next_billing_date ON recurring_payments(next_billing_date)"))
        
        # Create jobs table
        print("Creating jobs table...")
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                admin_id INTEGER NOT NULL REFERENCES admins(id),
                title VARCHAR(200) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'not_started' NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                start_date TIMESTAMP,
                deadline TIMESTAMP,
                completion_date TIMESTAMP,
                estimated_hours NUMERIC(8, 2),
                actual_hours NUMERIC(8, 2),
                hourly_rate NUMERIC(8, 2),
                fixed_price NUMERIC(10, 2),
                google_drive_links JSON,
                github_repositories JSON,
                workspace_links JSON,
                server_details JSON,
                calendar_links JSON,
                meeting_links JSON,
                additional_tools JSON,
                notes TEXT,
                progress_percentage INTEGER DEFAULT 0 NOT NULL,
                milestones JSON,
                deliverables JSON,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        """))
        
        # Create indexes for jobs
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_jobs_customer_id ON jobs(customer_id)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_jobs_status ON jobs(status)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_jobs_deadline ON jobs(deadline)"))
        
        # Create time_entries table
        print("Creating time_entries table...")
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS time_entries (
                id SERIAL PRIMARY KEY,
                job_id INTEGER NOT NULL REFERENCES jobs(id),
                admin_id INTEGER NOT NULL REFERENCES admins(id),
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                duration_hours NUMERIC(8, 2),
                description TEXT NOT NULL,
                billable BOOLEAN DEFAULT TRUE,
                hourly_rate NUMERIC(8, 2),
                amount NUMERIC(10, 2),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        """))
        
        # Create indexes for time_entries
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_time_entries_job_id ON time_entries(job_id)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_time_entries_admin_id ON time_entries(admin_id)"))
        session.execute(text("CREATE INDEX IF NOT EXISTS ix_time_entries_start_time ON time_entries(start_time)"))
        
        session.commit()
        print("✅ Business management tables created successfully!")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error creating business tables: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    run_migration()
