# AI Task Template

**Instructions** This template helps you create comprehensive task documents for AI-driven development.  Fill out each section thoroughly to ensure the 

# AI-Driven Task Template (Cursor-First)

> Use this template to drive high-quality AI development inside Cursor. It promotes strategic alignment, collects current-state context before coding, and enforces modular, testable deliverables.

---

## 0) Metadata
- **Task ID:** <!-- e.g., APP-123 -->
- **Owner:** <!-- Name -->
- **Date:** <!-- YYYY-MM-DD -->
- **Repo / Branch:** <!-- repo-name / feature/short-name -->
- **Related Issues / PRs:** <!-- links or IDs -->

---

## 1) 🎯 Task Summary
Briefly state *what* needs to be built or fixed in 1–2 sentences.  
**Example:** “Create a POST `/api/appointments` endpoint to schedule appointments with conflict checks and validation.”

---

## 2) 🧭 Strategic Analysis & Recommended Solution
1. **Goal & Constraints**
   - **Goal:** <!-- Business/technical objective -->
   - **Constraints:** <!-- performance, security, compatibility, deadline, budgets -->

2. **Possible Approaches**
   - A) <!-- Short approach description -->
   - B) <!-- Short approach description -->
   - (Optional) C) <!-- Another viable approach -->

3. **Recommended Solution**
   - **Choice:** <!-- e.g., Approach A -->
   - **Primary reason (specific justification):** <!-- exact/quantifiable -->
   - **Secondary reason (supporting evidence):** <!-- references, benchmarks, precedent -->
   - **Additional reason (long-term consideration):** <!-- scalability, maintainability, roadmap -->
   - **Risks / Trade-offs:** <!-- what we accept by choosing this -->

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

- **System Overview (where this fits):** <!-- module/service + data flow -->
- **Architecture References:** <!-- link to diagram(s)/docs -->
- **Existing Code Touchpoints:** <!-- files, functions, modules that will be read/modified -->
- **Data Contracts & Validation:** <!-- schemas, DTOs, interfaces -->
- **External Services / Integrations:** <!-- email, payment, auth, third-party APIs -->
- **Environment / Config:** <!-- env vars, secrets, feature flags -->
- **Dependencies & Versions:** <!-- libraries, runtimes, drivers -->
- **Gaps & Risks:** <!-- unknowns, blockers, migrations needed -->

> The purpose is to avoid misdiagnosing the root cause and ensure the chosen solution truly fits the system.

---

## 5) 🧩 Task Implementation Plan
1. **Context & Reference Files to Read First**
   - `<!-- path/to/file1 -->`
   - `<!-- path/to/file2 -->`
   - `<!-- path/to/docs.md -->`

2. **Development Rules (Snapshot of .cursorrules)**
   - Follow SOLID principles and strict TypeScript typings.
   - Validate changes against architecture and technical docs before saving.
   - Update project status notes after significant changes (see §9).

3. **Step-by-Step Instructions**
   1) <!-- Step 1: create schema / add route / write test first, etc. -->
   2) <!-- Step 2: implement core logic -->
   3) <!-- Step 3: error handling & edge cases -->
   4) <!-- Step 4: wiring / integration / DI -->
   5) <!-- Step 5: docs & polishing -->

4. **Multitasking & Shortcuts**
   - Tasks that can run in parallel: <!-- e.g., tests + schema generation -->
   - Helpful editor commands/shortcuts: <!-- Cursor actions -->

5. **Dev / Run Commands**
   - **Install:** `<!-- e.g., pnpm i -->`
   - **Dev:** `<!-- e.g., pnpm dev -->`
   - **Test:** `<!-- e.g., pnpm test -->`

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
- **Notifications & Errors:** **Never** use plain `alert()` calls. Use the project’s **professional modal** component for notifications and error reporting.

**Suggested Folder Shape**
src/
components/
Button/
Button.tsx
Button.test.tsx
index.ts
hooks/
useAppointments.ts
types/
appointment.ts
services/
appointments.ts
lib/
fetcher.ts

php-template
Always show details

Copy

---

## 7) 📌 Acceptance Criteria
Use checkboxes and make criteria measurable:

- [ ] **Functional:** <!-- e.g., POST /api/appointments validates and stores records -->
- [ ] **Validation:** <!-- e.g., rejects past dates, missing fields -->
- [ ] **Error Handling:** <!-- structured errors surfaced via modal component -->
- [ ] **Performance:** <!-- e.g., endpoint responds < 200ms p95 in dev -->
- [ ] **Security:** <!-- e.g., input sanitization, auth/authorization rules -->
- [ ] **Testing:** <!-- unit + integration coverage targets -->
- [ ] **Docs:** <!-- README or /docs updated with endpoints & usage -->

---

## 8) 🧪 Test Plan
- **Unit Tests:** <!-- list key units and edge cases -->
- **Integration Tests:** <!-- API + DB + external services -->
- **E2E (if applicable):** <!-- user flow or contract tests -->
- **Fixtures / Mocks:** <!-- how to simulate external systems -->

---

## 9) 🔄 Status & Next Steps
- **Status Updates:** Record meaningful progress in the team’s status doc/board (e.g., `docs/status.md`) when:
  - Logic is stubbed, implemented, or refactored
  - Tests added/passing
  - Risks discovered or resolved
- **Next Steps:** <!-- follow-up tasks, future refactors, tech debt -->

---

## 10) 📦 Deliverables Checklist
- [ ] Code changes (modularized into appropriate folders)
- [ ] Tests (unit/integration/e2e as appropriate)
- [ ] Documentation updates
- [ ] Example usage (curl/HTTPie, screen recording, or screenshots)
- [ ] Status updated; approvals recorded

## 11) Save a Instructions Task
- Save the tasks so we can easily re-use this later and do not need to re-analyze code base everytime we use the components.
- Be detailed on how it works, endpoints, databases, types, models, etc.
- save in ai_docs/tasks