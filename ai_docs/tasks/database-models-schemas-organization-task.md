# AI-Driven Task Template (Cursor-First)

> Use this template to drive high-quality AI development inside Cursor. It promotes strategic alignment, collects current-state context before coding, and enforces modular, testable deliverables.

---

## 0) Metadata
- **Task ID:** DB-001
- **Owner:** AI Agent
- **Date:** 2025-01-27
- **Repo / Branch:** atuomate-web / main
- **Related Issues / PRs:** Database organization and schema cleanup

---

## 1) 🎯 Task Summary
Organize and consolidate the database models and schemas to eliminate duplication, fix import conflicts, establish proper separation of concerns, and create a clean, maintainable database architecture.

---

## 2) 🧭 Strategic Analysis & Recommended Solution
1. **Goal & Constraints**
   - **Goal:** Create a clean, organized database structure with no duplication, proper imports, and consistent patterns
   - **Constraints:** Must maintain backward compatibility, fix linter errors, ensure proper SQLAlchemy registration

2. **Possible Approaches**
   - A) **Consolidate and Reorganize** - Merge duplicate models, fix import structure, create proper domain separation
   - B) **Complete Rewrite** - Start fresh with new database architecture
   - C) **Patch and Fix** - Fix only critical issues without major reorganization

3. **Recommended Solution**
   - **Choice:** Approach A - Consolidate and Reorganize
   - **Primary reason (specific justification):** The current structure has working models but suffers from import conflicts, duplicate definitions, and poor organization that will cause maintenance issues
   - **Secondary reason (supporting evidence):** Multiple Base declarations, duplicate StripeCustomer models, import circular dependencies, and linter errors indicate structural problems
   - **Additional reason (long-term consideration):** Proper organization will make the codebase more maintainable, reduce bugs, and improve developer experience
   - **Risks / Trade-offs:** Risk of breaking existing functionality during reorganization, but the benefits outweigh the risks

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

- **System Overview (where this fits):** Database layer is the foundation for all business logic, user management, payments, and automation features
- **Architecture References:** 
  - FastAPI backend with SQLAlchemy ORM
  - PostgreSQL database with Alembic migrations
  - Modular frontend with TypeScript
- **Existing Code Touchpoints:** 
  - `backend/database/` - Database configuration and models
  - `backend/models/` - Additional model files
  - `backend/schemas/` - Pydantic validation schemas
  - `backend/migrations/` - Database migration files
- **Data Contracts & Validation:** 
  - SQLAlchemy models define database structure
  - Pydantic schemas handle API validation
  - TypeScript interfaces for frontend type safety
- **External Services / Integrations:** 
  - Stripe payment processing
  - File server integration
  - Email services
- **Environment / Config:** 
  - PostgreSQL database
  - Environment variables for configuration
- **Dependencies & Versions:** 
  - SQLAlchemy 2.x
  - Pydantic 2.x
  - Alembic for migrations
- **Gaps & Risks:** 
  - **Duplicate Base declarations** in multiple files
  - **Duplicate StripeCustomer models** in different locations
  - **Import circular dependencies** between database and models
  - **Linter errors** with func.now() calls
  - **Inconsistent model organization** across files
  - **Missing proper domain separation**

---

## 5) 🧩 Task Implementation Plan
1. **Context & Reference Files to Read First**
   - `backend/database/__init__.py` - Database configuration
   - `backend/database/models.py` - Main models file
   - `backend/database/stripe_models.py` - Stripe-specific models
   - `backend/models/credit_models.py` - Credit system models
   - `backend/models/cross_app_models.py` - Cross-app integration models
   - `backend/schemas/` - All Pydantic schemas

2. **Development Rules (Snapshot of .cursorrules)**
   - Follow SOLID principles and maintain clean separation of concerns
   - Ensure all models are properly registered with SQLAlchemy
   - Maintain backward compatibility for existing data
   - Update related documentation and schemas

3. **Step-by-Step Instructions**
   1) **Audit and Document Current Issues** - Identify all duplications, import conflicts, and structural problems
   2) **Consolidate Base Declaration** - Ensure single Base declaration in database/__init__.py
   3) **Reorganize Model Files** - Group models by domain (users, payments, credits, etc.)
   4) **Fix Import Structure** - Resolve circular dependencies and import issues
   5) **Consolidate Duplicate Models** - Merge duplicate StripeCustomer and other duplicated models
   6) **Fix Linter Errors** - Resolve func.now() and other syntax issues
   7) **Update Model Registration** - Ensure all models are properly imported and registered
   8) **Validate Schema Consistency** - Ensure Pydantic schemas align with SQLAlchemy models
   9) **Test Database Operations** - Verify all models work correctly
   10) **Update Documentation** - Document new structure and relationships

4. **Multitasking & Shortcuts**
   - Tasks that can run in parallel: Model consolidation + schema updates
   - Helpful editor commands/shortcuts: Use search/replace for systematic fixes

5. **Dev / Run Commands**
   - **Install:** `pip install -r requirements.txt`
   - **Dev:** `uvicorn app.main:app --reload`
   - **Test:** `pytest -q`
   - **Migrations:** `alembic upgrade head`

---

## 6) 🏗️ Project-Specific Guidelines (Must Follow)
- **Database Organization:** Group models by business domain (users, payments, credits, automation)
- **Import Structure:** Single Base declaration in database/__init__.py, all models import from there
- **Model Registration:** All models must be imported in the correct order to avoid circular dependencies
- **Schema Consistency:** Pydantic schemas must accurately reflect SQLAlchemy model structure
- **Backward Compatibility:** Maintain existing table structures and relationships

**Suggested Folder Shape**
backend/
database/
__init__.py          # Single Base declaration, database config
models/
__init__.py          # Model imports and registration
user_models.py       # User, Admin, PortalInvite, etc.
payment_models.py    # Stripe, Invoice, RecurringPayment, etc.
credit_models.py     # Credits, Subscriptions, Disputes, etc.
automation_models.py # Jobs, Scraping, Videos, etc.
file_models.py       # FileUpload, etc.
schemas/
__init__.py          # Schema imports
user_schemas.py      # User-related Pydantic models
payment_schemas.py   # Payment-related Pydantic models
credit_schemas.py    # Credit-related Pydantic models
automation_schemas.py # Automation-related Pydantic models

---

## 7) 📌 Acceptance Criteria
Use checkboxes and make criteria measurable:

- [ ] **Functional:** All database models load without errors and can perform CRUD operations
- [ ] **Organization:** Models are properly grouped by domain with clear separation of concerns
- [ ] **No Duplication:** Eliminate all duplicate model definitions and Base declarations
- [ ] **Import Structure:** Single Base declaration with proper import hierarchy
- [ ] **Linter Clean:** No linter errors in database model files
- [ ] **Schema Alignment:** Pydantic schemas accurately reflect SQLAlchemy model structure
- [ ] **Migration Compatibility:** Existing migrations work with new structure
- [ ] **Documentation:** Clear documentation of model relationships and organization

---

## 8) 🧪 Test Plan
- **Unit Tests:** Test each model can be instantiated and relationships work correctly
- **Integration Tests:** Test database operations with multiple related models
- **Migration Tests:** Verify existing migrations work with new structure
- **Schema Tests:** Validate Pydantic schemas work with SQLAlchemy models
- **Fixtures / Mocks:** Use test database for all database operations

---

## 9) 🔄 Status & Next Steps
- **Status Updates:** Record progress on model consolidation, import fixes, and testing
- **Next Steps:** After completion, consider adding database indexes, optimizing queries, and implementing caching

---

## 10) 📦 Deliverables Checklist
- [ ] Consolidated and organized database models
- [ ] Fixed import structure and circular dependencies
- [ ] Eliminated duplicate model definitions
- [ ] Resolved all linter errors
- [ ] Updated Pydantic schemas for consistency
- [ ] Comprehensive testing of all models
- [ ] Documentation of new structure
- [ ] Status updated; approvals recorded

## 11) Save a Instructions Task
- Save the tasks so we can easily re-use this later and do not need to re-analyze code base everytime we use the components.
- Be detailed on how it works, endpoints, databases, types, models, etc.
- save in ai_docs/tasks
