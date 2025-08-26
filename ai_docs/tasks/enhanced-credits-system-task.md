# AI-Driven Task Template (Cursor-First)

> Use this template to drive high-quality AI development inside Cursor. It promotes strategic alignment, collects current-state context before coding, and enforces modular, testable deliverables.

---

## 0) Metadata
- **Task ID:** CREDITS-001
- **Owner:** Stream-line AI Team
- **Date:** 2025-01-27
- **Repo / Branch:** atuomate-web / feature/enhanced-credits-system
- **Related Issues / PRs:** STRIPE-001 (Stripe integration task)

---

## 1) 🎯 Task Summary
Implement a comprehensive credits system with subscription management, dispute handling, admin controls, and Stripe integration for the automation platform. Each credit equals $0.10, with monthly subscription packages ($19.99, $49.99, $99.99) and comprehensive credit tracking.

---

## 2) 🧭 Strategic Analysis & Recommended Solution
1. **Goal & Constraints**
   - **Goal:** Full-featured credits system supporting subscriptions, disputes, admin management, and Stripe billing
   - **Constraints:** Must integrate with existing User model, support multiple subscription tiers, enable credit disputes, and provide comprehensive admin oversight

2. **Possible Approaches**
   - A) **Enhance Existing System**: Extend current credit models with new tables and relationships
   - B) **Complete Rewrite**: Redesign credit system from scratch with new architecture
   - C) **Hybrid Enhancement**: Keep existing core, add new features incrementally

3. **Recommended Solution**
   - **Choice:** Approach A - Enhance Existing System
   - **Primary reason (specific justification):** Leverages existing User.credits and CreditTransaction infrastructure while adding necessary subscription and dispute capabilities
   - **Secondary reason (supporting evidence):** Current models already have credit balance tracking and transaction history, providing solid foundation for enhancement
   - **Additional reason (long-term consideration):** Incremental enhancement approach reduces risk and allows for future flexibility in credit system evolution
   - **Risks / Trade-offs:** Need to carefully migrate existing data and ensure backward compatibility

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

- **System Overview (where this fits):** Core business system for user credit management, subscription billing, and financial oversight
- **Architecture References:** FastAPI backend with SQLAlchemy models, Next.js frontend, PostgreSQL database, existing credit system
- **Existing Code Touchpoints:** 
  - `backend/database/models.py` - User model with credits field, CreditTransaction model
  - `backend/services/` - Service layer for business logic
  - `frontend/components/` - UI components for user dashboard
  - `frontend/app/customer/dashboard/` - Customer dashboard structure
  - `frontend/app/admin/` - Admin dashboard structure
- **Data Contracts & Validation:** Pydantic schemas for credit operations, existing user authentication
- **External Services / Integrations:** Stripe API (from STRIPE-001 task), existing email system
- **Environment / Config:** Need Stripe API keys, credit system configuration
- **Dependencies & Versions:** FastAPI, SQLAlchemy, PostgreSQL, existing credit system
- **Gaps & Risks:** Missing subscription management, dispute system, admin credit controls, Stripe billing integration

> The purpose is to avoid misdiagnosing the root cause and ensure the chosen solution truly fits the system.

---

## 5) 🧩 Task Implementation Plan
1. **Context & Reference Files to Read First**
   - `backend/database/models.py` - Understand existing credit models
   - `backend/services/` - Review existing service structure
   - `frontend/app/customer/dashboard/` - Customer dashboard structure
   - `frontend/app/admin/` - Admin dashboard structure
   - `ai_docs/tasks/stripe-integration-task.md` - Stripe integration requirements

2. **Development Rules (Snapshot of .cursorrules)**
   - Follow SOLID principles and strict TypeScript typings
   - Maintain wallet (current balance) and immutable ledger (all transactions)
   - All credit mutations must be idempotent and re-entrant
   - Use professional modals for notifications/errors (never `alert()`)
   - Keep files small (<300 lines) and functions focused

3. **Step-by-Step Instructions**
   1) **Database Models**: Enhance existing models with subscription, dispute, and package tables
   2) **Credit Services**: Implement comprehensive credit management, subscription handling, and dispute resolution
   3) **Admin Services**: Build admin credit management, user oversight, and financial controls
   4) **API Endpoints**: Create credit management, subscription, and dispute APIs
   5) **Frontend Components**: Build credit dashboard, subscription management, and dispute forms
   6) **Stripe Integration**: Connect with Stripe for subscription billing and credit purchases
   7) **Testing & Validation**: Comprehensive testing of all credit operations

4. **Multitasking & Shortcuts**
   - Tasks that can run in parallel: Backend credit services + frontend credit dashboard
   - Helpful editor commands/shortcuts: Use Cursor's AI assistance for complex credit logic

5. **Dev / Run Commands**
   - **Install:** `pip install stripe` (backend), `npm install @stripe/stripe-js` (frontend)
   - **Dev:** `uvicorn app.main:app --reload` (backend), `npm run dev` (frontend)
   - **Test:** `pytest` (backend), `npm test` (frontend)

---

## 6) 🏗️ Project-Specific Guidelines (Must Follow)
- **API Routing Convention:** We use an `api.` subdomain for front‑end requests that **automatically maps to `/api` on the backend**. Ensure all client requests follow this convention.
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
    credit_service.py
    subscription_service.py
    dispute_service.py
    admin_credit_service.py
  api/
    credits.py
    subscriptions.py
    disputes.py
    admin_credits.py
  models/
    credit_models.py
    subscription_models.py
    dispute_models.py

frontend/
  components/
    CreditsDashboard/
    SubscriptionManager/
    DisputeForm/
    AdminCreditManagement/
  hooks/
    useCredits.ts
    useSubscriptions.ts
    useDisputes.ts
  services/
    credits.ts
    subscriptions.ts
    disputes.ts
  types/
    credits.ts
    subscriptions.ts
    disputes.ts

---

## 7) 📌 Acceptance Criteria
Use checkboxes and make criteria measurable:

- [ ] **Functional:** Credit system with $0.10 per credit pricing model
- [ ] **Functional:** Monthly subscription packages ($19.99, $49.99, $99.99) with configurable credit amounts
- [ ] **Functional:** Admin ability to add/remove credits, view user credit history, and pause credit services
- [ ] **Functional:** User credit dashboard showing balance, transaction history, and account status
- [ ] **Functional:** Credit dispute system with reviewal process and admin oversight
- [ ] **Functional:** Stripe integration for subscription billing and one-time credit purchases
- [ ] **Functional:** Admin ability to edit subscription package pricing and credit amounts
- [ ] **Functional:** Discount/sale system for promotional pricing
- [ ] **Validation:** Input validation for all credit operations and dispute submissions
- [ ] **Error Handling:** Comprehensive error handling with user-friendly messages via modal component
- [ ] **Performance:** Credit operations complete within 2 seconds, dispute processing < 5 seconds
- [ ] **Security:** Admin-only access to credit management, secure dispute handling
- [ ] **Testing:** Unit tests for all services, integration tests for credit operations
- [ ] **Docs:** API documentation, credit system usage guide, admin dashboard guide

---

## 8) 🧪 Test Plan
- **Unit Tests:** Credit service methods, subscription logic, dispute resolution, admin credit management
- **Integration Tests:** Credit operations, subscription lifecycle, dispute workflow, Stripe integration
- **E2E (if applicable):** Complete credit purchase flow, subscription management, dispute submission
- **Fixtures / Mocks:** Credit transactions, subscription events, dispute scenarios, Stripe webhooks

---

## 9) 🔄 Status & Next Steps
- **Status Updates:** Record meaningful progress in the team's status doc/board (e.g., `docs/status.md`) when:
  - Credit system models are implemented and migrated
  - Subscription management is functional
  - Dispute system is operational
  - Admin credit controls are working
  - Stripe integration is complete
- **Next Steps:** 
  - Implement advanced credit analytics and reporting
  - Add credit expiration and rollover policies
  - Implement credit referral and bonus system
  - Add credit usage optimization recommendations

---

## 10) 📦 Deliverables Checklist
- [ ] Code changes (modularized into appropriate folders)
- [ ] Database migrations for new credit system tables
- [ ] Tests (unit/integration/e2e as appropriate)
- [ ] Documentation updates
- [ ] Example usage (credit system workflow, admin dashboard usage)
- [ ] Status updated; approvals recorded

---

## 11) Technical Implementation Details

### 11.1 Credit System Architecture
- **Credit Balance**: Real-time balance tracking on User model
- **Transaction Ledger**: Immutable record of all credit operations
- **Subscription Management**: Monthly billing with automatic credit allocation
- **Dispute System**: User-initiated disputes with admin review process

### 11.2 Database Schema Enhancements
- **CreditPackage**: Subscription package definitions with pricing and credit amounts
- **UserSubscription**: Active user subscriptions and billing status
- **CreditDispute**: Dispute records with status tracking and resolution
- **CreditTransaction**: Enhanced with dispute references and subscription context

### 11.3 Credit Operations
- **Credit Addition**: Admin manual addition, subscription allocation, one-time purchase
- **Credit Deduction**: Service consumption, admin removal, subscription cancellation
- **Balance Validation**: Prevent negative balances, enforce credit limits
- **Transaction History**: Complete audit trail of all credit movements

### 11.4 Subscription Management
- **Package Tiers**: $19.99, $49.99, $99.99 with configurable credit amounts
- **Monthly Billing**: Automatic Stripe billing with credit allocation
- **Admin Controls**: Edit package pricing, credit amounts, and availability
- **Discount System**: Promotional pricing and seasonal sales

### 11.5 Dispute System
- **User Initiation**: Dispute form with reason and explanation
- **Admin Review**: Dispute queue with resolution workflow
- **Resolution Process**: Credit refund, explanation, or rejection
- **Audit Trail**: Complete dispute history and resolution tracking

### 11.6 Admin Dashboard Features
- **Credit Overview**: Total credits in system, user distribution, usage patterns
- **User Management**: Individual user credit status, transaction history, account controls
- **Subscription Oversight**: Package performance, billing issues, revenue tracking
- **Dispute Resolution**: Dispute queue, resolution tools, credit adjustments

### 11.7 User Dashboard Features
- **Credit Balance**: Current balance, subscription status, upcoming billing
- **Transaction History**: Detailed log of all credit operations with context
- **Subscription Management**: View current plan, upgrade/downgrade options
- **Dispute Submission**: Easy dispute form with clear explanation requirements

### 11.8 Stripe Integration Points
- **Subscription Creation**: Create Stripe subscriptions for monthly packages
- **Webhook Handling**: Process billing events and credit allocation
- **Customer Portal**: Stripe customer portal for subscription management
- **Payment Processing**: Handle one-time credit purchases and failed payments

### 11.9 Environment Configuration
```bash
# Backend (.env)
CREDIT_SYSTEM_ENABLED=true
DEFAULT_CREDIT_RATE=0.10
SUBSCRIPTION_WEBHOOK_SECRET=whsec_xxx
CREDIT_DISPUTE_ENABLED=true

# Frontend (.env.local)
NEXT_PUBLIC_CREDIT_SYSTEM_ENABLED=true
NEXT_PUBLIC_CREDIT_RATE=0.10
NEXT_PUBLIC_SUBSCRIPTION_ENABLED=true
```

### 11.10 Testing Strategy
- **Unit Tests**: Credit calculations, subscription logic, dispute workflow
- **Integration Tests**: Credit operations, subscription lifecycle, Stripe integration
- **Security Tests**: Admin access control, dispute validation, credit manipulation
- **Performance Tests**: Credit operations speed, dispute processing time

---

## 12) Credit System Business Rules

### 12.1 Credit Pricing
- **Base Rate**: $0.10 per credit
- **Subscription Discounts**: Package subscribers get discounted credit rates
- **Bulk Discounts**: Larger credit purchases receive volume discounts
- **Promotional Pricing**: Seasonal sales and promotional offers

### 12.2 Subscription Packages
- **Starter Package**: $19.99/month - Basic credit allocation
- **Professional Package**: $49.99/month - Enhanced credit allocation
- **Enterprise Package**: $99.99/month - Premium credit allocation
- **Custom Packages**: Admin-configurable pricing and credit amounts

### 12.3 Credit Usage
- **Service Consumption**: Each automation service consumes defined credit amounts
- **Credit Validation**: Prevent service execution with insufficient credits
- **Usage Tracking**: Detailed logging of credit consumption by service
- **Efficiency Metrics**: Track credit usage efficiency and optimization opportunities

### 12.4 Dispute Resolution
- **Dispute Window**: Users can dispute charges within 30 days
- **Review Process**: Admin review with 48-hour response time
- **Resolution Options**: Full refund, partial refund, explanation, or rejection
- **Appeal Process**: Multi-level dispute resolution for complex cases

### 12.5 Admin Controls
- **Credit Management**: Add/remove credits, adjust balances, pause services
- **Subscription Control**: Edit packages, manage billing, handle cancellations
- **Dispute Oversight**: Review disputes, make resolutions, track outcomes
- **Financial Reporting**: Revenue tracking, credit flow analysis, usage metrics
