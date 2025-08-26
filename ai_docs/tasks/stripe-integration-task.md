# AI-Driven Task Template (Cursor-First)

> Use this template to drive high-quality AI development inside Cursor. It promotes strategic alignment, collects current-state context before coding, and enforces modular, testable deliverables.

---

## 0) Metadata
- **Task ID:** STRIPE-001
- **Owner:** Stream-line AI Team
- **Date:** 2025-01-27
- **Repo / Branch:** atuomate-web / feature/stripe-integration
- **Related Issues / PRs:** N/A

---

## 1) 🎯 Task Summary
Implement comprehensive Stripe payment integration for subscriptions and one-time payments with secure financial handling, user credit management, and admin financial oversight capabilities.

---

## 2) 🧭 Strategic Analysis & Recommended Solution
1. **Goal & Constraints**
   - **Goal:** Secure Stripe integration supporting both subscription billing and one-time payments with comprehensive financial tracking
   - **Constraints:** Must follow PCI compliance, maintain data security, integrate with existing credit system, support admin oversight

2. **Possible Approaches**
   - A) **Full Stripe Integration with Custom Financial Layer**: Implement Stripe Checkout/Portal + custom financial models for comprehensive control
   - B) **Stripe + Stripe Billing**: Use Stripe's billing system for subscriptions + custom handling for one-time payments
   - C) **Hybrid Approach**: Stripe for payments + custom subscription management for flexibility

3. **Recommended Solution**
   - **Choice:** Approach A - Full Stripe Integration with Custom Financial Layer
   - **Primary reason (specific justification):** Provides maximum control over financial data, better integration with existing credit system, and enables custom business logic for subscription management
   - **Secondary reason (supporting evidence):** Existing models already have Stripe ID fields, project has custom credit system that needs tight integration
   - **Additional reason (long-term consideration):** Enables future features like custom pricing tiers, promotional offers, and detailed financial analytics
   - **Risks / Trade-offs:** More development time initially, but provides better long-term flexibility and control

> **Approval checkpoint:** Proceed only after the recommended solution is approved in writing.

---

## 3) ✅ User Approval Required
**Do you approve the recommended solution above?**  
- [ ] Yes — proceed  
- [ ] No — revise the approach per comments

> Capture any decision notes here before moving forward.

---

## 4) 🔍 Project Analysis & Current State
Analyze the project to fully understand the **current state** of the application and assemble all **relevant information** for this specific task.

- **System Overview (where this fits):** Financial system integration with existing credit management, user authentication, and admin dashboard
- **Architecture References:** FastAPI backend with SQLAlchemy models, Next.js frontend, PostgreSQL database, existing credit system
- **Existing Code Touchpoints:** 
  - `backend/database/models.py` - User, Invoice, RecurringPayment models with Stripe ID fields
  - `backend/schemas/financial.py` - Financial schemas with Stripe integration points
  - `backend/config.py` - Configuration management (needs Stripe keys)
  - `backend/services/` - Service layer for business logic
  - `frontend/components/` - UI components for financial management
- **Data Contracts & Validation:** Pydantic schemas for financial data, existing credit transaction system
- **External Services / Integrations:** Stripe API, existing email system, file server integration
- **Environment / Config:** Need Stripe API keys, webhook secrets, environment-specific configurations
- **Dependencies & Versions:** FastAPI 0.116.1, SQLAlchemy 2.0.42, PostgreSQL, existing credit system
- **Gaps & Risks:** No Stripe SDK in requirements, missing webhook handling, incomplete financial service layer

> The purpose is to avoid misdiagnosing the root cause and ensure the chosen solution truly fits the system.

---

## 5) 🧩 Task Implementation Plan
1. **Context & Reference Files to Read First**
   - `backend/database/models.py` - Understand existing financial models
   - `backend/schemas/financial.py` - Review financial schemas
   - `backend/config.py` - Configuration structure
   - `ai_docs/cursorrules` - Stripe security rules
   - `ai_docs/instructions.md` - Project architecture and conventions

2. **Development Rules (Snapshot of .cursorrules)**
   - Follow SOLID principles and strict TypeScript typings
   - Never collect/store raw card data; use Stripe Elements or Checkout
   - Verify webhooks using webhook secret; reject unverified payloads
   - Use idempotency keys for create/charge operations
   - Store Stripe IDs on users where needed (customer ID, etc.)
   - Maintain wallet (current balance) and immutable ledger (all transactions)

3. **Step-by-Step Instructions**
   1) **Backend Setup**: Add Stripe SDK, create Stripe service, implement webhook handling
   2) **Database Models**: Enhance existing models with additional Stripe fields, create subscription/product models
   3) **Financial Services**: Implement subscription management, payment processing, credit reconciliation
   4) **API Endpoints**: Create Stripe-related endpoints for checkout, subscriptions, webhooks
   5) **Frontend Integration**: Build payment forms, subscription management UI, admin financial dashboard
   6) **Security & Testing**: Implement security measures, add comprehensive testing

4. **Multitasking & Shortcuts**
   - Tasks that can run in parallel: Backend Stripe service + frontend payment forms
   - Helpful editor commands/shortcuts: Use Cursor's AI assistance for Stripe best practices

5. **Dev / Run Commands**
   - **Install:** `pip install stripe` (backend), `npm install @stripe/stripe-js` (frontend)
   - **Dev:** `uvicorn app.main:app --reload` (backend), `npm run dev` (frontend)
   - **Test:** `pytest` (backend), `npm test` (frontend)

---

## 6) 🏗️ Project-Specific Guidelines (Must Follow)
- **API Routing Convention:** We use an `api.` subdomain for front‑end requests that **automatically maps to `/api` on the backend**. Ensure all client requests follow this convention.
- **Email Endpoints:** Email‑related endpoints **must always target the production server over HTTPS**.
- **Code Organization:** Do **not** generate a single monolithic file. Break code into manageable modules and organize by purpose:
  - `types/` — shared type definitions
  - `hooks/` — custom hooks / data‑fetching logic
  - `components/` — **reusable** UI components
  - `services/` — domain/service logic
  - `lib/` — shared utilities
- **Notifications & Errors:** **Never** use plain `alert()` calls. Use the project's **professional modal** component for notifications and error reporting.

**Suggested Folder Shape**
backend/
  services/
    stripe_service.py
    subscription_service.py
    payment_service.py
  api/
    stripe.py
    subscriptions.py
    payments.py
  models/
    stripe_models.py
    subscription_models.py

frontend/
  components/
    PaymentForm/
    SubscriptionManager/
    AdminFinancialDashboard/
  hooks/
    useStripe.ts
    useSubscriptions.ts
  services/
    stripe.ts
    subscriptions.ts
  types/
    stripe.ts
    subscriptions.ts

---

## 7) 📌 Acceptance Criteria
Use checkboxes and make criteria measurable:

- [ ] **Functional:** Stripe Checkout integration for one-time payments and subscription creation
- [ ] **Functional:** Subscription management (create, update, cancel, pause/resume)
- [ ] **Functional:** Webhook handling for payment events with proper verification
- [ ] **Functional:** Credit system integration (credits added on successful payments)
- [ ] **Functional:** Admin financial dashboard showing all transactions and subscriptions
- [ ] **Validation:** Input validation for all payment forms and webhook data
- [ ] **Error Handling:** Comprehensive error handling with user-friendly messages via modal component
- [ ] **Performance:** Payment processing completes within 5 seconds, webhook processing < 2 seconds
- [ ] **Security:** PCI compliance maintained, no sensitive data stored, webhook verification implemented
- [ ] **Testing:** Unit tests for all services, integration tests for Stripe API, webhook testing
- [ ] **Docs:** API documentation, webhook setup guide, admin dashboard usage guide

---

## 8) 🧪 Test Plan
- **Unit Tests:** Stripe service methods, subscription logic, payment processing, credit reconciliation
- **Integration Tests:** Stripe API calls, webhook processing, database transactions
- **E2E (if applicable):** Complete payment flow from frontend to backend to Stripe
- **Fixtures / Mocks:** Stripe webhook payloads, payment success/failure scenarios, subscription lifecycle events

---

## 9) 🔄 Status & Next Steps
- **Status Updates:** Record meaningful progress in the team's status doc/board (e.g., `docs/status.md`) when:
  - Stripe service is implemented and tested
  - Webhook handling is functional
  - Frontend payment forms are working
  - Admin dashboard is operational
- **Next Steps:** 
  - Implement advanced subscription features (trial periods, promotional pricing)
  - Add financial reporting and analytics
  - Implement automated billing reminders
  - Add support for multiple currencies

---

## 10) 📦 Deliverables Checklist
- [ ] Code changes (modularized into appropriate folders)
- [ ] Tests (unit/integration/e2e as appropriate)
- [ ] Documentation updates
- [ ] Example usage (webhook testing, payment flow documentation)
- [ ] Status updated; approvals recorded

## 11) Save a Instructions Task
- Save the tasks so we can easily re-use this later and do not need to re-analyze code base everytime we use the components.
- Be detailed on how it works, endpoints, databases, types, models, etc.
- save in ai_docs/tasks

---

## 12) Technical Implementation Details

### 12.1 Stripe Integration Architecture
- **Stripe Service Layer**: Centralized service for all Stripe API interactions
- **Webhook Handler**: Secure webhook processing with signature verification
- **Payment Processing**: One-time payments and subscription creation
- **Credit Reconciliation**: Automatic credit addition on successful payments

### 12.2 Database Schema Enhancements
- **StripeCustomer**: Links users to Stripe customer records
- **StripeSubscription**: Tracks subscription details and status
- **StripePaymentIntent**: Records payment attempts and results
- **StripeWebhookEvent**: Logs webhook events for debugging

### 12.3 Security Measures
- **Webhook Verification**: Verify webhook signatures using webhook secret
- **Idempotency Keys**: Prevent duplicate payment processing
- **Input Validation**: Validate all payment data server-side
- **Audit Logging**: Log all financial transactions for compliance

### 12.4 API Endpoints
- `POST /api/stripe/create-checkout-session` - Create Stripe Checkout session
- `POST /api/stripe/create-subscription` - Create subscription
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/subscriptions/{user_id}` - Get user subscriptions
- `PUT /api/subscriptions/{subscription_id}` - Update subscription
- `DELETE /api/subscriptions/{subscription_id}` - Cancel subscription
- `GET /api/admin/financial-dashboard` - Admin financial overview

### 12.5 Frontend Components
- **PaymentForm**: Stripe Elements integration for secure card input
- **SubscriptionManager**: User interface for managing subscriptions
- **AdminFinancialDashboard**: Comprehensive financial overview for admins
- **PaymentHistory**: Transaction history and receipt viewing

### 12.6 Credit System Integration
- **Automatic Credit Addition**: Credits added on successful payments
- **Subscription Credits**: Monthly/periodic credit allocation
- **Credit Ledger**: Immutable transaction history
- **Balance Validation**: Prevent negative credit balances

### 12.7 Environment Configuration
```bash
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_API_VERSION=2023-10-16

# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/xxx
```

### 12.8 Testing Strategy
- **Unit Tests**: Mock Stripe API responses, test business logic
- **Integration Tests**: Real Stripe test API calls, webhook simulation
- **Security Tests**: Webhook signature verification, input validation
- **Performance Tests**: Payment processing time, webhook handling speed
