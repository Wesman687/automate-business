# Cross-App Authentication & Credit SDK Task

**Instructions** This task implements comprehensive cross-app authentication with credit integration and SDK development for easy integration into other projects.

---

## 0) Metadata
- **Task ID:** AUTH-001
- **Owner:** Stream-line AI (Paul Wesley Miracle)
- **Date:** 2024-12-19
- **Repo / Branch:** atuomate-web / feature/cross-app-auth-sdk
- **Related Issues / PRs:** N/A

---

## 1) 🎯 Task Summary
Implement enhanced cross-app authentication system that allows other applications on the same domain to share authentication, sign up new credit-specific accounts, and integrate with the existing credit system through a comprehensive SDK.

---

## 2) 🧭 Strategic Analysis & Recommended Solution

1. **Goal & Constraints**
   - **Goal:** Create a seamless cross-app authentication system with credit integration that bypasses the new user modal and directly integrates with the credit system
   - **Constraints:** Must work with existing authentication, credit system, and Stripe integration; must be easily integrable into other projects

2. **Possible Approaches**
   - A) **JWT-based cross-domain authentication** with shared secret and domain validation
   - B) **OAuth 2.0 flow** with custom authorization server
   - C) **Cookie-based cross-subdomain sharing** with enhanced security

3. **Recommended Solution**
   - **Choice:** Approach A (JWT-based cross-domain authentication) + SDK
   - **Primary reason (specific justification):** Leverages existing JWT infrastructure, provides secure cross-domain authentication without complex OAuth setup
   - **Secondary reason (supporting evidence):** Current system already uses JWT tokens and has cross-domain cookie support; this extends that pattern
   - **Additional reason (long-term consideration):** JWT-based approach scales better for multiple apps, provides better security controls, and enables fine-grained permissions
   - **Risks / Trade-offs:** JWT size limitations, need for secure secret management, potential token refresh complexity

> **Approval checkpoint:** Proceed only after the recommended solution is approved in writing.

---

## 3) ✅ User Approval Required
**Do you approve the recommended solution above?**  
- [ ] Yes — proceed  
- [ ] No — revise the approach per comments

> Capture any decision notes here before moving forward.

---

## 4) 🔍 Project Analysis & Current State

### System Overview
The current system has:
- **Unified User Model**: Single `users` table with `user_type` field (admin/customer)
- **JWT Authentication**: Token-based auth with cookie support for cross-domain
- **Credit System**: Wallet + ledger with Stripe integration for payments
- **Cross-App Support**: Basic iframe embedding and postMessage communication
- **Stripe Integration**: Checkout sessions, subscriptions, and webhook handling

### Architecture References
- **Backend**: FastAPI with SQLAlchemy models, JWT authentication
- **Frontend**: Next.js with embedded authentication support
- **Database**: PostgreSQL with credit models and user management
- **External**: Stripe for payments, email verification system

### Existing Code Touchpoints
- `backend/services/auth_service.py` - JWT token creation and validation
- `backend/utils/cookies.py` - Cross-domain cookie configuration
- `backend/models/credit_models.py` - Credit system models
- `backend/services/stripe_service.py` - Payment processing
- `frontend/public/js/embedded-auth.js` - Basic iframe authentication
- `frontend/app/portal/page.tsx` - Portal with embedded mode support

### Data Contracts & Validation
- **User Schema**: `UserCreate`, `UserUpdate`, `UserResponse` with customer/admin variants
- **Credit Schema**: `CreditTransaction`, `CreditPackage`, `UserSubscription`
- **Auth Schema**: `LoginRequest`, `LoginResponse` with JWT tokens

### External Services / Integrations
- **Stripe**: Payment processing, subscription management
- **Email Service**: Verification codes and notifications
- **Cross-Domain Cookies**: Shared authentication across subdomains

### Environment / Config
- **JWT_SECRET**: For token signing
- **STRIPE_*_KEY**: Payment processing
- **EMAIL_*_URL**: Email service configuration
- **CORS_ORIGINS**: Allowed cross-origin domains

### Dependencies & Versions
- **Backend**: FastAPI, SQLAlchemy, PyJWT, Stripe
- **Frontend**: Next.js, React, TypeScript
- **Database**: PostgreSQL 14+, Alembic migrations

### Gaps & Risks
- **Current Gap**: No standardized SDK for easy integration
- **Security Risk**: Cross-domain JWT sharing needs proper validation
- **Integration Risk**: Different apps may have different authentication needs

---

## 5) 🧩 Task Implementation Plan

### 1) Context & Reference Files to Read First
- `backend/services/auth_service.py` - Current JWT implementation
- `backend/utils/cookies.py` - Cross-domain cookie setup
- `backend/models/credit_models.py` - Credit system structure
- `backend/services/stripe_service.py` - Payment integration
- `frontend/public/js/embedded-auth.js` - Current iframe auth
- `ai_docs/instructions.md` - Project architecture and conventions

### 2) Development Rules (Snapshot of .cursorrules)
- Follow SOLID principles and strict TypeScript typings
- Validate changes against architecture and technical docs before saving
- Update project status notes after significant changes
- Use modular code organization with reusable components
- Implement proper error handling and validation

### 3) Step-by-Step Instructions

#### Phase 1: Enhanced Cross-App Authentication Backend
1. **Extend Auth Service** (`backend/services/auth_service.py`)
   - Add cross-app JWT validation with domain/app validation
   - Implement app-specific permission system
   - Add token refresh and cross-domain token sharing

2. **Create Cross-App API Endpoints** (`backend/api/cross_app_auth.py`)
   - `POST /api/cross-app/validate-token` - Validate JWT from other apps
   - `POST /api/cross-app/refresh-token` - Refresh expired tokens
   - `GET /api/cross-app/user-info` - Get user info for cross-app use
   - `POST /api/cross-app/credit-check` - Check credit balance

3. **Enhanced User Management** (`backend/services/cross_app_user_service.py`)
   - Create credit-specific user accounts (bypass new user modal)
   - Direct integration with credit system
   - App-specific user metadata and permissions

#### Phase 2: Credit Integration & Bypass
1. **Credit System Integration** (`backend/services/credit_integration_service.py`)
   - Direct credit purchase flow (bypass dashboard)
   - Subscription management for cross-app users
   - Credit balance checking and validation

2. **Stripe Integration Enhancement** (`backend/services/stripe_service.py`)
   - Cross-app checkout sessions
   - App-specific success/cancel URLs
   - Webhook handling for cross-app payments

#### Phase 3: Frontend SDK Development
1. **Core SDK** (`frontend/lib/sdk/`)
   - `CrossAppAuthSDK` - Authentication management
   - `CreditSDK` - Credit system integration
   - `PaymentSDK` - Stripe payment handling

2. **Embedded Components** (`frontend/components/sdk/`)
   - `CrossAppLogin` - Embedded login component
   - `CreditPurchase` - Direct credit purchase flow
   - `SubscriptionManager` - Subscription management

3. **Communication Layer** (`frontend/lib/sdk/communication.ts`)
   - PostMessage handling for cross-app communication
   - Event-driven architecture for auth state changes
   - Error handling and retry logic

#### Phase 4: Integration & Testing
1. **SDK Documentation** (`ai_docs/sdk/`)
   - Installation and setup guides
   - API reference documentation
   - Integration examples for different frameworks

2. **Testing Suite** (`tests/sdk/`)
   - Unit tests for SDK components
   - Integration tests for cross-app scenarios
   - E2E tests for complete user flows

### 4) Multitasking & Shortcuts
- **Parallel Tasks**: Backend API development + Frontend SDK development
- **Helpful Commands**: `npm run dev`, `pytest -v`, `alembic revision`

### 5) Dev / Run Commands
- **Install:** `pip install -r requirements.txt` (backend), `npm install` (frontend)
- **Dev:** `uvicorn app.main:app --reload` (backend), `npm run dev` (frontend)
- **Test:** `pytest` (backend), `npm test` (frontend)

---

## 6) 🏗️ Project-Specific Guidelines (Must Follow)
- **API Routing Convention**: Use `api.` subdomain for frontend requests mapping to backend `/api`
- **Email Endpoints**: Must target production server over HTTPS
- **Code Organization**: Break into manageable modules by purpose
- **Notifications**: Use professional modal components, never `alert()`
- **Cross-Domain Security**: Implement proper CORS and domain validation
- **Credit System**: Maintain wallet + ledger with immutable transactions

---

## 7) 📌 Acceptance Criteria

- [ ] **Functional**: Cross-app authentication works seamlessly across different domains
- [ ] **Credit Integration**: New users bypass dashboard and go directly to credit purchase
- [ ] **SDK Functionality**: Comprehensive SDK provides easy integration for other projects
- [ ] **Security**: JWT validation includes app-specific permissions and domain validation
- [ ] **Payment Flow**: Stripe integration works for cross-app credit purchases
- [ ] **Error Handling**: Proper error handling and user feedback via modals
- [ ] **Testing**: Unit and integration tests cover all SDK functionality
- [ ] **Documentation**: Complete SDK documentation with examples and integration guides

---

## 8) 🧪 Test Plan

- **Unit Tests**: SDK components, authentication logic, credit integration
- **Integration Tests**: Cross-app authentication flow, payment processing
- **E2E Tests**: Complete user journey from signup to credit purchase
- **Security Tests**: JWT validation, domain validation, permission checks
- **Performance Tests**: Token validation speed, payment processing time

---

## 9) 🔄 Status & Next Steps

- **Status Updates**: Record progress in `ai_docs/status.md`
- **Next Steps**: SDK maintenance, additional app integrations, advanced permission system

---

## 10) 📦 Deliverables Checklist

- [ ] Enhanced cross-app authentication backend
- [ ] Credit integration service with bypass functionality
- [ ] Comprehensive frontend SDK with TypeScript support
- [ ] Embedded authentication components
- [ ] Cross-app payment integration
- [ ] Complete SDK documentation and examples
- [ ] Test suite covering all functionality
- [ ] Status updates and approval records

---

## 11) SDK Architecture & Implementation Details

### SDK Structure
```
frontend/lib/sdk/
├── index.ts                 # Main SDK export
├── types/                   # TypeScript definitions
│   ├── auth.ts             # Authentication types
│   ├── credit.ts           # Credit system types
│   └── payment.ts          # Payment types
├── core/                    # Core SDK functionality
│   ├── CrossAppAuthSDK.ts  # Main authentication class
│   ├── CreditSDK.ts        # Credit management
│   └── PaymentSDK.ts       # Payment processing
├── components/              # React components
│   ├── CrossAppLogin.tsx   # Embedded login
│   ├── CreditPurchase.tsx  # Credit purchase flow
│   └── SubscriptionManager.tsx
└── communication/           # Cross-app communication
    ├── postMessage.ts      # PostMessage handling
    └── events.ts           # Event system
```

### Key SDK Methods

#### CrossAppAuthSDK
```typescript
class CrossAppAuthSDK {
  // Initialize SDK with app configuration
  constructor(config: SDKConfig)
  
  // Check if user is authenticated
  isAuthenticated(): boolean
  
  // Get current user info
  getCurrentUser(): User | null
  
  // Login user (opens embedded login)
  login(): Promise<User>
  
  // Logout user
  logout(): Promise<void>
  
  // Refresh authentication token
  refreshToken(): Promise<string>
  
  // Listen for authentication changes
  onAuthChange(callback: (user: User | null) => void): void
}
```

#### CreditSDK
```typescript
class CreditSDK {
  // Get user's current credit balance
  getCreditBalance(): Promise<number>
  
  // Purchase credits directly
  purchaseCredits(amount: number, packageId?: string): Promise<PaymentResult>
  
  // Get available credit packages
  getCreditPackages(): Promise<CreditPackage[]>
  
  // Check if user has sufficient credits
  hasSufficientCredits(required: number): Promise<boolean>
  
  // Consume credits for service
  consumeCredits(amount: number, service: string): Promise<boolean>
}
```

### Integration Example
```typescript
// In another project
import { CrossAppAuthSDK, CreditSDK } from '@streamline/cross-app-sdk';

const authSDK = new CrossAppAuthSDK({
  appId: 'my-video-app',
  domain: 'stream-lineai.com',
  redirectUrl: 'https://myapp.com/auth-callback'
});

const creditSDK = new CreditSDK(authSDK);

// Check authentication
if (!authSDK.isAuthenticated()) {
  // Open embedded login
  const user = await authSDK.login();
}

// Use credits
const hasCredits = await creditSDK.hasSufficientCredits(10);
if (hasCredits) {
  await creditSDK.consumeCredits(10, 'video-generation');
} else {
  // Open credit purchase flow
  await creditSDK.purchaseCredits(50);
}
```

### Security Considerations
- **JWT Validation**: Include app ID and domain in token claims
- **Domain Validation**: Verify requesting domain matches allowed origins
- **Permission System**: App-specific permissions for different features
- **Token Refresh**: Secure token refresh with app validation
- **CORS Configuration**: Proper CORS setup for cross-domain requests

### Database Changes
- **New Table**: `app_integrations` - Track connected applications
- **New Table**: `cross_app_sessions` - Manage cross-app authentication
- **Enhanced User Model**: Add app-specific metadata and permissions
- **Credit Transactions**: Track app-specific credit usage

### API Endpoints
- `POST /api/cross-app/register` - Register new application
- `POST /api/cross-app/auth` - Authenticate cross-app user
- `GET /api/cross-app/credits` - Get credit balance and packages
- `POST /api/cross-app/credits/purchase` - Purchase credits
- `POST /api/cross-app/credits/consume` - Consume credits for service
- `GET /api/cross-app/user` - Get user information for app

This comprehensive task will create a robust, secure, and easy-to-integrate cross-app authentication system with full credit integration capabilities.
