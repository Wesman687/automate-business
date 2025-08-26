# AI Task: User Database Interaction System

**Instructions** This template helps you create comprehensive task documents for AI-driven development.  Fill out each section thoroughly to ensure the 

# AI-Driven Task Template (Cursor-First)

> Use this template to drive high-quality AI development inside Cursor. It promotes strategic alignment, collects current-state context before coding, and enforces modular, testable deliverables.

---

## 0) Metadata
- **Task ID:** USER-DB-001
- **Owner:** AI Agent
- **Date:** 2025-01-27
- **Repo / Branch:** atuomate-web / main
- **Related Issues / PRs:** None

---

## 1) 🎯 Task Summary
Create a comprehensive user database interaction system that provides easy access to the unified User table for both customers and admins, with proper validation, CRUD operations, and type safety across frontend and backend.

---

## 2) 🧭 Strategic Analysis & Recommended Solution
1. **Goal & Constraints**
   - **Goal:** Establish a robust, type-safe system for interacting with the unified User table that supports both customer and admin user types
   - **Constraints:** Must maintain backward compatibility, follow existing API conventions, ensure security through proper authorization

2. **Possible Approaches**
   - A) **Unified Service Layer**: Create a single UserService that handles both customer and admin operations with role-based logic
   - B) **Separate Services**: Maintain separate CustomerService and AdminService with shared utilities
   - C) **Repository Pattern**: Implement repository pattern with user-specific repositories

3. **Recommended Solution**
   - **Choice:** Approach A - Unified Service Layer
   - **Primary reason (specific justification):** The database already uses a unified User model with `user_type` field, so the service layer should reflect this design
   - **Secondary reason (supporting evidence):** Current code shows mixed approaches causing confusion - some endpoints use User model directly while others use separate services
   - **Additional reason (long-term consideration):** Unified approach reduces code duplication, simplifies maintenance, and provides consistent API patterns
   - **Risks / Trade-offs:** Need to carefully handle role-based logic to prevent security issues

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

- **System Overview (where this fits):** The user system is central to the entire application, handling authentication, authorization, and user data management for both customers and admins
- **Architecture References:** 
  - Backend uses FastAPI with SQLAlchemy ORM
  - Frontend uses Next.js with TypeScript
  - Database is PostgreSQL with Alembic migrations
- **Existing Code Touchpoints:** 
  - `backend/database/models.py` - User model definition
  - `backend/schemas/` - Pydantic validation schemas
  - `backend/services/` - Business logic services
  - `backend/api/` - REST API endpoints
  - `frontend/components/` - UI components
  - `frontend/hooks/` - Custom React hooks
  - `frontend/types/` - TypeScript type definitions
- **Data Contracts & Validation:** 
  - User model has extensive fields for both customer and admin data
  - Pydantic schemas exist but are incomplete
  - Frontend interfaces are scattered and inconsistent
- **External Services / Integrations:** 
  - Authentication system (JWT-based)
  - File upload system
  - Credit system
- **Environment / Config:** 
  - PostgreSQL database
  - Environment variables for database connection
- **Dependencies & Versions:** 
  - SQLAlchemy for ORM
  - Pydantic for validation
  - FastAPI for backend
  - Next.js for frontend
- **Gaps & Risks:** 
  - Inconsistent user data handling between frontend and backend
  - Missing comprehensive user schemas
  - No centralized user service
  - Type safety gaps between layers

---

## 5) 🧩 Task Implementation Plan
1. **Context & Reference Files to Read First**
   - `backend/database/models.py` - User model structure
   - `backend/schemas/auth.py` - Existing auth schemas
   - `backend/schemas/customer.py` - Customer schemas
   - `backend/services/auth_service.py` - Authentication logic
   - `backend/services/customer_service.py` - Customer operations
   - `frontend/hooks/useAuth.tsx` - Frontend auth hook
   - `frontend/components/` - User-related components

2. **Development Rules (Snapshot of .cursorrules)**
   - Follow SOLID principles and strict TypeScript typings
   - Validate changes against architecture and technical docs before saving
   - Update project status notes after significant changes (see §9)

3. **Step-by-Step Instructions**
   1) **Create comprehensive User schemas** - Define Pydantic models for all user operations
   2) **Implement unified UserService** - Create service layer with role-based logic
   3) **Update API endpoints** - Ensure all user endpoints use consistent patterns
   4) **Create frontend types** - Define TypeScript interfaces for user data
   5) **Update frontend components** - Ensure components use proper types and services
   6) **Add comprehensive validation** - Input validation and error handling
   7) **Write tests** - Unit and integration tests for user operations

4. **Multitasking & Shortcuts**
   - Tasks that can run in parallel: Backend schemas + Frontend types, Service layer + API updates
   - Helpful editor commands/shortcuts: Use Cursor's AI features for code generation

5. **Dev / Run Commands**
   - **Install:** `pip install -r requirements.txt` (backend), `npm install` (frontend)
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
  - (optional) `services/` — domain/service logic
  - (optional) `lib/` — shared utilities
- **Notifications & Errors:** **Never** use plain `alert()` calls. Use the project's **professional modal** component for notifications and error reporting.

**Suggested Folder Shape**
src/
components/
UserProfile/
UserProfile.tsx
UserProfile.test.tsx
index.ts
hooks/
useUser.ts
types/
user.ts
services/
userService.ts
lib/
userUtils.ts

---

## 7) 📌 Acceptance Criteria
Use checkboxes and make criteria measurable:

- [ ] **Functional:** Unified UserService handles all user operations (CRUD) for both customers and admins
- [ ] **Validation:** Comprehensive Pydantic schemas validate all user data with proper error messages
- [ ] **Error Handling:** Structured errors surfaced via modal component with proper HTTP status codes
- [ ] **Performance:** User endpoints respond < 200ms p95 in development environment
- [ ] **Security:** Role-based access control enforced, users can only access/modify their own data unless admin
- [ ] **Testing:** Unit tests cover all user operations, integration tests cover API endpoints
- [ ] **Docs:** README updated with user endpoints, schemas, and usage examples
- [ ] **Type Safety:** Frontend and backend share consistent user type definitions

---

## 8) 🧪 Test Plan
- **Unit Tests:** 
  - UserService methods for CRUD operations
  - Schema validation for various user types
  - Authorization logic for different user roles
- **Integration Tests:** 
  - API endpoints with database operations
  - Authentication and authorization flows
  - Error handling scenarios
- **E2E (if applicable):** 
  - Complete user registration and profile update flow
  - Admin user management operations
- **Fixtures / Mocks:** 
  - Database fixtures for different user types
  - Mock authentication for testing

---

## 9) 🔄 Status & Next Steps
- **Status Updates:** Record meaningful progress in the team's status doc/board (e.g., `docs/status.md`) when:
  - ✅ User schemas are created and validated
  - ✅ UserService is implemented and tested
  - ✅ API endpoints are updated and working
  - ✅ Frontend types are synchronized
  - ✅ **INTEGRATED** with existing admin dashboard and user management
  - ✅ **ALIGNED** user schemas with existing customer management components
- **Next Steps:** 
  - ✅ **INTEGRATED** user statistics into existing admin dashboard
  - ✅ **ENHANCED** admin users page with system overview
  - ✅ **REMOVED** redundant UserManagement component (existing system is comprehensive)
  - ⏳ Add real-time user statistics to admin dashboard
  - ⏳ Implement user activity logging (backend endpoints ready)
  - ⏳ Add comprehensive testing
  - ⏳ Create user import/export functionality
  - ⏳ Add user search and filtering to existing admin interfaces

---

## 10) 📦 Deliverables Checklist
- [ ] Comprehensive User Pydantic schemas
- [ ] Unified UserService with role-based logic
- [ ] Updated API endpoints using consistent patterns
- [ ] Frontend TypeScript interfaces for user data
- [ ] Updated frontend components using proper types
- [ ] Unit and integration tests
- [ ] Documentation updates
- [ ] Example usage and API documentation

## 11) Save a Instructions Task
- Save the tasks so we can easily re-use this later and do not need to re-analyze code base everytime we use the components.
- Be detailed on how it works, endpoints, databases, types, models, etc.
- save in ai_docs/tasks

---

## 12) 📋 Current User System Analysis

### Database Schema (User Model)
The system uses a **unified User table** that handles both customers and admins:

**Core Fields:**
- `id` (Primary Key)
- `email` (Unique, indexed)
- `password_hash` (Required)
- `user_type` ('admin' or 'customer', indexed)
- `status` ('active', 'inactive', 'pending', 'suspended')

**Identity Fields:**
- `name` (Full name for customers, display name for admins)
- `username` (Optional, mainly for admins)
- `phone` (Optional, indexed)

**Address Fields (Customer-focused):**
- `address`, `city`, `state`, `zip_code`, `country`

**Business Fields (Customer-focused):**
- `business_site`, `additional_websites`, `business_type`

**Customer-specific Fields:**
- `lead_status` ('lead', 'qualified', 'customer', 'closed')
- `notes`

**Admin-specific Fields:**
- `is_super_admin` (Boolean)

**Customer-specific Fields:**
- `lead_status` ('lead', 'qualified', 'customer', 'closed')
- `notes`

**Authentication Fields:**
- `is_authenticated`, `email_verified`
- `verification_code`, `verification_expires`

**Credits System:**
- `credits` (Integer, default 0)

**Timestamps:**
- `created_at`, `updated_at`, `last_login`

### Current API Endpoints
- `GET /api/users/{user_id}` - Get specific user (self or admin)
- `PUT /api/users/{user_id}` - Update user (self or admin)
- `POST /api/users/{user_id}/password` - Update password
- `GET /api/users` - Get all users (admin only)

### Current Services
- `AuthService` - Handles authentication and user verification
- `CustomerService` - Customer-specific operations
- Mixed usage of direct User model queries

### Frontend Types
- Scattered user interfaces across components
- Inconsistent property naming (`id` vs `user_id`)
- Missing comprehensive user type definitions

### Key Relationships
- `chat_sessions` - User's chat history
- `appointments` - User's appointments
- `portal_invites` - User's portal access
- `file_uploads` - User's uploaded files
- `credit_transactions` - User's credit history
- `videos` - User's generated videos

### Security Model
- Users can only access/modify their own data
- Admins can access all user data
- Role-based permissions through `user_type` field
- JWT-based authentication with role information

### Migration History
- Previously had separate `customers` and `admins` tables
- Migrated to unified `users` table with `user_type` field
- All foreign key references updated to use `users.id`
- Legacy data preserved during migration
