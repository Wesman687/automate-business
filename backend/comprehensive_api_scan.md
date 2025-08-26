# FastAPI Endpoints Scan Results

Generated on: 2025-08-25 19:54:29.948858

## All Endpoints

| Method | Endpoint | Auth | Description | Function | File |
|--------|----------|------|-------------|----------|------|
| POST | `/api/contact` | None | Submit contact form and send email notification... | submit_contact_form | contact.py |
| GET | `/appointments/` | User | No description available | get_time_priority | appointments.py |
| GET | `/appointments/smart-slots` | User | No description available | get_time_priority | appointments.py |
| POST | `/auth/login` | None | No description available | logout | login.py |
| POST | `/auth/logout` | User | No description available | logout | login.py |
| GET | `/credits/balance` | User | Get current credit rate (price per credit) | get_credit_rate | credits.py |
| POST | `/credits/purchase` | User | Get current credit rate (price per credit) | get_credit_rate | credits.py |
| POST | `/credits/purchase/validate` | User | Get current credit rate (price per credit) | get_credit_rate | credits.py |
| GET | `/credits/rate` | User | Get current credit rate (price per credit) | get_credit_rate | credits.py |
| GET | `/credits/summary` | User | Get current credit rate (price per credit) | get_credit_rate | credits.py |
| GET | `/credits/transactions` | User | Get current credit rate (price per credit) | get_credit_rate | credits.py |
| POST | `/cross-app/auth` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/cross-app/credits/check` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/cross-app/credits/consume` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| GET | `/cross-app/credits/packages` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/cross-app/credits/purchase` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| GET | `/cross-app/credits/subscriptions` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| GET | `/cross-app/health` | None | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/cross-app/logout` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/cross-app/refresh-token` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| GET | `/cross-app/user-info` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/cross-app/validate-token` | User | Health check endpoint for cross-app services | cross_app_health_check | cross_app_auth.py |
| POST | `/email/forgot-password` | User | Test email service connection | test_email | email.py |
| POST | `/email/reset-password` | User | Test email service connection | test_email | email.py |
| POST | `/email/send` | User | Test email service connection | test_email | email.py |
| POST | `/email/send-notification` | User | Test email service connection | test_email | email.py |
| GET | `/email/test` | None | Test email service connection | test_email | email.py |
| POST | `/generate-financial-estimate` | User | Generate financial estimates using AI | generate_financial_estimate | ai.py |
| POST | `/generate-project-plan` | User | Generate project milestones and deliverables us... | generate_project_plan | ai.py |
| GET | `/share/` | User | Share page with StreamlineAI badges and embed c... | share_badges_page | share.py |
| GET | `/share/download/html` | User | Download a ZIP file with all HTML badge snippets | download_html_badges | share.py |
| GET | `/share/download/react` | User | Download the React component file | download_react_component | share.py |
