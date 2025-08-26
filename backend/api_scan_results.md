# API Endpoints Scan Results

Generated on: 2025-08-25 19:53:12.798746

## All Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | User | Get all jobs with optional filtering (Admin only) |
| POST | `/jobs` | User | Create a new job |
| GET | `/jobs/customer` | User | Get jobs for the current customer |
| GET | `/jobs/{job_id}` | User | Get a specific job |
| PUT | `/jobs/{job_id}` | User | Update a job |
| DELETE | `/jobs/{job_id}` | User | Delete a job |
| GET | `/jobs/{job_id}/time-entries` | User | Get all time entries for a specific job |
