# Frontend Type System

## 🎯 **UNIFIED TYPE SYSTEM - NO MORE CONFUSION!**

This directory now contains a **single, centralized type system** that eliminates all the scattered type definitions that were making development confusing.

## 📁 **File Structure**

```
frontend/types/
├── types.ts          # 🎯 ALL TYPES ARE HERE - Single source of truth
├── index.ts          # 📤 Simple re-export from types.ts
└── README.md         # 📖 This documentation
```

## 🚀 **How to Use**

### **Import Any Type (Simple!)**
```typescript
// Import from the main types index
import { User, Job, CreditTransaction } from '@/types';

// Or import directly from types.ts
import { User, Job, CreditTransaction } from '@/types/types';
```

### **Import Multiple Types**
```typescript
import { 
  User, 
  UserType, 
  UserStatus,
  Job, 
  JobStatus, 
  JobPriority,
  CreditTransaction,
  TransactionType
} from '@/types';
```

### **Import API Types**
```typescript
import { 
  LoginRequest, 
  ApiResponse, 
  PaginatedResponse,
  UserCreate,
  JobUpdate
} from '@/types';
```

### **Import Enums and Constants**
```typescript
import { 
  UserType, 
  JobStatus, 
  JOB_STATUSES, 
  JOB_PRIORITIES 
} from '@/types';
```

### **Import Type Guards**
```typescript
import { 
  isAdmin, 
  isCustomer, 
  isSuperAdmin, 
  hasCredits 
} from '@/types';
```

## 🏗️ **Type Organization**

All types are organized by business domain, matching your clean backend structure:

### **User Models**
- `User`, `Admin`, `Customer`
- `PortalInvite`, `ChatSession`, `ChatMessage`
- `UserType`, `UserStatus`, `LeadStatus`

### **Payment Models**
- `Invoice`, `RecurringPayment`, `TimeEntry`

### **Credit Models**
- `CreditPackage`, `UserSubscription`, `CreditTransaction`
- `CreditDispute`, `CreditPromotion`
- `TransactionType`, `DisputeStatus`

### **Automation Models**
- `Job`, `CustomerChangeRequest`, `Video`, `Appointment`
- `JobStatus`, `JobPriority`, `AppointmentStatus`

### **File Models**
- `FileUpload`

### **Stripe Models**
- `StripeCustomer`, `StripeSubscription`, `StripePaymentIntent`
- `StripePaymentMethod`, `StripeWebhookEvent`, `StripeProduct`

### **Scraper Models**
- `ExtractorSchema`, `ScrapingJob`, `Run`, `Result`, `Export`

### **Cross-App Models**
- `AppIntegration`, `CrossAppSession`, `AppCreditUsage`
- `AppStatus`, `CrossAppSessionStatus`

### **Email Models**
- `EmailAccount`

## 🔧 **API Types**

### **Request/Response Types**
- `LoginRequest`, `LoginResponse`
- `ApiResponse<T>`, `PaginatedResponse<T>`
- `UserCreate`, `UserUpdate`, `JobCreate`, `JobUpdate`

### **Filter Types**
- `UserFilter`, `JobFilter`

## 🎭 **Type Guards & Utilities**

### **Type Guards**
```typescript
// Check user types
if (isAdmin(user)) {
  // user is now typed as Admin
  console.log(user.is_super_admin);
}

if (isCustomer(user)) {
  // user is now typed as Customer
  console.log(user.lead_status);
}

// Check permissions
if (isSuperAdmin(user)) {
  // User has super admin privileges
}

if (hasCredits(user, 100)) {
  // User has at least 100 credits
}
```

### **Constants**
```typescript
// Use predefined arrays for dropdowns, etc.
const statusOptions = JOB_STATUSES;        // ['pending', 'in_progress', ...]
const priorityOptions = JOB_PRIORITIES;    // ['low', 'medium', 'high', 'urgent']
const userTypeOptions = USER_TYPES;        // ['admin', 'customer']
```

## 🚫 **What We Eliminated**

### **Old Scattered Files (GONE!)**
- ❌ `database.ts` - Had duplicate User, UserType definitions
- ❌ `user.ts` - Had duplicate User, UserType definitions  
- ❌ `credits.ts` - Had duplicate CreditTransaction definitions
- ❌ `stripe.ts` - Had duplicate Stripe model definitions
- ❌ `api.ts` - Had scattered API type definitions

### **Old Confusing Imports (GONE!)**
- ❌ `import { User } from './user'`
- ❌ `import { User } from './database'`
- ❌ `import { UserType } from './user'`
- ❌ `import { UserType } from './database'`

## ✅ **Benefits of the New System**

1. **Single Source of Truth** - All types in one place
2. **No More Duplicates** - Eliminated conflicting definitions
3. **Easy to Find** - Know exactly where to look for any type
4. **Consistent Naming** - All types follow the same patterns
5. **Backend Alignment** - Matches your clean backend structure
6. **Better IntelliSense** - IDE autocomplete works perfectly
7. **Type Safety** - Catch errors at compile time
8. **Easy Maintenance** - Update types in one place

## 🔄 **Migration Guide**

### **Old Way (Confusing)**
```typescript
// ❌ Multiple import sources
import { User } from './types/user';
import { UserType } from './types/database';
import { Job } from './types/database';
import { CreditTransaction } from './types/credits';
```

### **New Way (Simple!)**
```typescript
// ✅ Single import source
import { User, UserType, Job, CreditTransaction } from '@/types';
```

## 🎉 **Result**

**NO MORE CONFUSION!** You now have:
- ✅ **One place** to find all types
- ✅ **No duplicates** or conflicts
- ✅ **Clean imports** that make sense
- ✅ **Perfect alignment** with your backend
- ✅ **Type safety** throughout your app

Happy coding! 🚀
