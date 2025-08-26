# Automate‑dev — Instructions

This document describes how to work in the **automate-dev** codebase that powers Stream‑line AI’s Automate platform (customer onboarding, automation products, credits, billing, and dashboards). It also defines how our **AI agents** operate so we keep quality high and avoid code slop.

---

## 1) Objectives

- Acquire automation customers via **stream-lineai.com** and collect all info needed to build their solutions.
- Offer automation products that consume **credits** (e.g., Video Generator, `ai_scraper`, Automatic Webpage Generator).
- Provide **customer** and **admin** dashboards.
- Use **PostgreSQL** for persistent data.
- Add **Stripe** for payments and credit purchases.
- Maintain **clean, modular code** (reusable components, types, hooks).

---

## 2) Architecture Overview

- **Frontend**: Next.js (TypeScript). Modular UI with `components/`, `hooks/`, `types/`, `lib/`, `services/`.
- **Backend**: FastAPI (Python). Lives under `backend/`.
- **Database**: PostgreSQL.
- **Auth**: In‑house user auth. Admins determined by `user.isAdmin`.
- **Payments**: Stripe (cards, webhooks, customer portal).
- **Credits**: Wallet + ledger stored in Postgres; products/services consume credits.
- **Routing conventions**
  - **api. subdomain** maps to backend **`/api`** automatically.
  - **Email endpoints** must hit **production over HTTPS**.
- **UX conventions**
  - **No `alert()`**. Use professional **modals** for notifications/errors.

---

## 3) Folder Structure (reference)

root/
ai_docs/
task_template.md
instructions.md # this file (copy lives in repo; agents request approval to update)
status.md # running log of work / decisions
decisions.md # ADRs (architecture decision records)
docs/
backend-api-endpoints.md # complete API reference (single source of truth)
backend/
app/
api/ # routers (REST)
core/ # settings, logging, security
db/ # session, base, migrations setup
models/ # SQLAlchemy models
schemas/ # Pydantic models
services/ # domain logic (stripe, credits, email)
main.py # FastAPI entrypoint
tests/
frontend/
app/ # Next.js App Router
components/ # reusable UI
hooks/ # React hooks
types/ # TS types
lib/ # utilities (fetcher, api client)
services/ # client-side service wrappers
public/
tests/
infra/
docker/ # compose, images if used
migrations/ # alembic versions
.env.example
README.md

markdown
Always show details

Copy

Principles: **small files**, clear boundaries, no monoliths, reusable pieces first.

---

## 4) Local Development

### 4.1 Prerequisites
- Python 3.11+
- Node 18+ (or 20+)
- PostgreSQL 14+
- Stripe account (test keys)
- `pip`, `venv`, and either `npm`/`pnpm`

### 4.2 Environment Variables (back end)
Create `backend/.env` with items like:
- `DATABASE_URL=postgresql+psycopg2://USER:PASS@localhost:5432/automate`
- `STRIPE_SECRET_KEY=sk_test_xxx`
- `STRIPE_WEBHOOK_SECRET=whsec_xxx`
- `APP_ENV=development`
- `JWT_SECRET=...` (if applicable)
- `EMAIL_FROM=no-reply@stream-lineai.com`
- `EMAIL_BASE_URL=https://api.stream-lineai.com`

### 4.3 Environment Variables (front end)
Create `frontend/.env.local` with items like:
- `NEXT_PUBLIC_API_BASE=https://api.stream-lineai.com` (dev can point to local if needed)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx`
- `STRIPE_CUSTOMER_PORTAL_URL=...`

### 4.4 Start the backend (FastAPI)
From the **`backend/`** folder:

**Windows (PowerShell):**
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app/main.py # or: uvicorn app.main:app --reload

makefile
Always show details

Copy

**macOS/Linux:**
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

markdown
Always show details

Copy

### 4.5 Start the frontend
From the **`frontend/`** folder:
npm install # or pnpm i
npm run dev # or pnpm dev

shell
Always show details

Copy

### 4.6 Database & Migrations (Alembic)
alembic revision -m "init credits tables"
alembic upgrade head

markdown
Always show details

Copy
Keep SQLAlchemy models and Alembic migrations in sync.

---

## 5) Core Domains

### 5.1 Users & Auth
- Our own authentication system.
- `user.isAdmin` determines access to admin dashboard routes and admin APIs.

### 5.2 Stripe & Billing
- Customers purchase **credit packages** via Stripe Checkout/Portal.
- Backend exposes endpoints to create checkout sessions and handle **webhooks**:
  - `checkout.session.completed` → **credit wallet** top‑up
  - `invoice.payment_succeeded` → reconcile credits (for subscriptions, if used)
- Store Stripe IDs (customer, payment method) on the user record if needed.

### 5.3 Credits
- **Wallet table**: current balance for each user.
- **Ledger table**: immutable transactions (top‑up, spend, adjustments).
- **Products/Programs**: each automation product has a **price in credits**.
- When an automation runs, **decrement credits** and log a ledger entry. If insufficient, return a polite modal with add‑credits call‑to‑action.

### 5.4 Automations (examples)
- **Video Generator** (consumes credits per render).
- **ai_scraper** (consumes credits per scrape job).
- **Automatic Webpage Generator** (consumes credits per build or per page pack).

---

## 6) API Conventions

- All client calls go through the **`api.`** subdomain and map to backend **`/api`** routes.
- Email‑related endpoints must always go to **production HTTPS**.
- Use consistent JSON error shapes:
{ "error": { "code": "SOME_CODE", "message": "human readable", "details": {} } }

markdown
Always show details

Copy
- Version routes if necessary: `/api/v1/...`
- **Complete API reference**: See `ai_docs/docs/backend-api-endpoints.md` for all available endpoints, authentication requirements, and usage examples.

---

## 7) UI/UX Conventions

- **No `alert()`** — use project **modals** for success/info/error.
- Shared UI lives in `frontend/components/` with small, reusable components.
- Fetching logic goes in `hooks/` or `services/`.
- Types live in `types/` and are shared across components/hooks.

---

## 8) Tasks, Docs & AI Agent Workflow

### 8.1 Before writing code
- **Search** `ai_docs/` for an existing task. If a matching task exists, attach work to it.
- If no task exists, **create one** using `ai_docs/task_template.md` (one task per feature/fix).

### 8.2 AI Agent operating rules
- **Always** produce a short **Strategic Analysis** and **Recommended Solution**:
  - Primary reason (specific), Secondary reason (evidence), Additional reason (long‑term).
- **Ask for approval** before creating or modifying tasks or this `instructions.md`.
- **Never** create huge monolithic files; prefer modular code with components, hooks, and types.
- After implementation, **update**:
  - `ai_docs/status.md` with what changed and why.
  - The related task file with acceptance results and any follow‑ups.
  - **`ai_docs/docs/backend-api-endpoints.md`** if any API endpoints were added, modified, or removed.
- If the agent hits ambiguity, it **must ask** for clarification rather than guessing.

### 8.3 API Endpoints Documentation
- **`ai_docs/docs/backend-api-endpoints.md`** is the **single source of truth** for all backend API endpoints.
- **AI Agents MUST update this documentation** whenever:
  - New endpoints are added
  - Existing endpoints are modified (URL, method, auth requirements, response format)
  - Endpoints are removed or deprecated
  - New API routers are added to the system
- This documentation serves as the authoritative reference for developers, frontend teams, and API consumers.
- Keep the documentation organized by functional groups and maintain consistent formatting.
- **Maintenance Tool**: Use `backend/scripts/simple_endpoint_scanner.py --scan` to automatically scan for new/modified endpoints and help keep documentation up to date. This is the most reliable scanner, finding 165+ endpoints.
- **Agent Responsibility**: After implementing any API changes, agents must immediately update the endpoints documentation to maintain accuracy.

### 8.3 Task lifecycle (human + AI)
1. Create/locate task in `ai_docs/tasks/`.
2. Write acceptance criteria.
3. Implement in small PRs.
4. Update status docs + link PRs.
5. Close task when criteria pass.

---

## 9) Testing & Quality Gates

- **Backend**: `pytest` for unit and API tests.
- **Frontend**: Vitest + React Testing Library; Playwright for e2e (optional).
- **Linting/Formatting**: ESLint + Prettier; `ruff`/`black` for Python (if used).
- **PR Checklist**
  - Unit tests for new logic.
  - No `any` types without justification.
  - Clear function boundaries and small components.
  - No dead code or TODOs without linked task.

---

## 10) Security & Secrets

- No secrets in the repo. Use environment variables and secret stores.
- Validate and sanitize all inputs server‑side.
- Return generic error messages to clients; log details server‑side.
- Enforce authorization checks for admin endpoints (`user.isAdmin`).

---

## 11) Deployment Notes (high‑level)

- **Frontend**: deploy to your chosen platform (e.g., Vercel). Configure env vars.
- **Backend**: FastAPI served by `uvicorn`/`gunicorn` behind nginx. HTTPS termination on the load balancer or reverse proxy.
- **DB**: managed Postgres or self‑hosted (with backups & monitoring).
- **Stripe**: switch to live keys; rotate webhook secrets per environment.

---

## 12) Roadmap (proposed)

**M0 – Repo Hygiene**
- Confirm folder structure, add CI lint/test, add `.env.example`, finalize `ai_docs` scaffolding.

**M1 – Auth**
- Harden our in‑house auth; add session/JWT; add admin role gating in UI and API.

**M2 – Stripe Payments**
- Checkout/Portal integration; products for credit bundles; webhooks tested end‑to‑end.

**M3 – Credits Ledger**
- Wallet + ledger tables; idempotent top‑ups; spending on automation runs.

**M4 – Automation Modules**
- Implement initial versions of Video Generator, `ai_scraper`, Webpage Generator with credit consumption.

**M5 – Dashboards**
- Customer dashboard (credits, history, jobs); Admin dashboard (users, credits, jobs, refunds).

**M6 – AI Tasking**
- Enforce agent approval prompts; automatic task creation/updates with review gates.

**M7 – Observability**
- Structured logging, request IDs, metrics; admin health pages.

**M8 – Security Hardening**
- Rate limits, CSRF where relevant, header hardening, email SPF/DKIM/DMARC.

**M9 – Growth**
- Multi‑tenant support, team accounts, usage analytics and churn prevention.

---

## 13) Common Commands

**Backend**
from backend/
source .venv/bin/activate # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
pytest -q

markdown
Always show details

Copy

**Frontend**
from frontend/
npm run dev
npm run test

markdown
Always show details

Copy

**Migrations**
alembic revision -m "change"
alembic upgrade head

yaml
Always show details

Copy

---


## 14) Contact & Ownership

- **Product Owner:** Stream‑line AI (Paul Wesley Miracle)
- **Tech Leads:** Backend / Frontend maintainers (see CODEOWNERS if present)
- **Support:** Open an issue with logs, steps to reproduce, and the related task link.

---

##15) TASKS & Cursor Rules
**TASKS**  Are very important make sure that the project has a task already, and if it does look through it to evaluate current code structure,
types, components, resources, and all things related to the project

- if a tasks don't exist use the task_template.md to create a new tasks
- if a task does exist read the documentation before implementing any changes

**Cursor Rules**  Cursor rules are there for basic rules/setup such as file handling, so we don't need to repeat ourselves over and over in tasks.

- Read and follow all rules
- If a rule is outdated notify the user, and give them the suggested change and why
- If a rule needs to be added notify the user and give them why the rule will help
- Remember Rules are global to the project, so anything that isn't going to be task oriented needs to be added to cursor rules.


_This document is source‑controlled. AI agents must request **explicit approval** before editing_ `ai_docs/instructions.md` _or creating/altering tasks. All changes must link to a task and a PR._