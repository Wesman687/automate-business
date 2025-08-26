// User type definitions that match backend schemas
// These types ensure consistency between frontend and backend

export enum UserType {
  ADMIN = "admin",
  CUSTOMER = "customer"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended"
}

export enum LeadStatus {
  LEAD = "lead",
  QUALIFIED = "qualified",
  CUSTOMER = "customer",
  CLOSED = "closed"
}

// Base user interface with common fields
export interface UserBase {
  id: number;
  email: string;
  name?: string;
  username?: string;
  phone?: string;
  status: UserStatus;
  user_type: UserType;
  credits: number;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

// Customer-specific fields - aligned with existing EditCustomerModal
export interface CustomerFields {
  // Address fields
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  
  // Business fields
  business_site?: string;
  additional_websites?: string;
  business_type?: string;
  
  // Customer-specific fields
  lead_status: LeadStatus;
  notes?: string;
}

// Admin-specific fields
export interface AdminFields {
  is_super_admin: boolean;
}

// Complete user interfaces
export interface Customer extends UserBase {
  user_type: UserType.CUSTOMER;
  customer_fields: CustomerFields;
}

export interface Admin extends UserBase {
  user_type: UserType.ADMIN;
  admin_fields: AdminFields;
}

// Union type for any user
export type User = Customer | Admin;

// User list response (for admin views)
export interface UserListResponse {
  id: number;
  email: string;
  name?: string;
  user_type: UserType;
  status: UserStatus;
  credits: number;
  created_at?: string;
  last_login?: string;
}

// User creation
export interface UserCreate {
  email: string;
  password: string;
  name?: string;
  username?: string;
  phone?: string;
  user_type: UserType;
  status?: UserStatus;
  
  // Include customer fields if creating customer
  customer_fields?: CustomerFields;
  
  // Include admin fields if creating admin
  admin_fields?: AdminFields;
}

// User updates
export interface UserUpdate {
  name?: string;
  username?: string;
  phone?: string;
  status?: UserStatus;
  
  // Customer fields (only for customer users)
  customer_fields?: Partial<CustomerFields>;
  
  // Admin fields (only for admin users)
  admin_fields?: Partial<AdminFields>;
}

// Password update
export interface PasswordUpdate {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// User filters for search
export interface UserFilter {
  user_type?: UserType;
  status?: UserStatus;
  lead_status?: LeadStatus;
  industry?: string;
  business_type?: string;
  created_after?: string;
  created_before?: string;
  has_credits?: boolean;
  search?: string;
}

// User statistics
export interface UserStats {
  total_users: number;
  total_customers: number;
  total_admins: number;
  active_users: number;
  pending_users: number;
  suspended_users: number;
  users_with_credits: number;
  total_credits: number;
  new_users_this_month: number;
  new_users_this_week: number;
}

// Bulk operations
export interface BulkUserUpdate {
  user_ids: number[];
  updates: UserUpdate;
}

export interface BulkUserStatusUpdate {
  user_ids: number[];
  status: UserStatus;
  reason?: string;
}

// User activity
export interface UserActivity {
  user_id: number;
  action: string;
  details?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// User management hooks return types
export interface UseUsersReturn {
  users: UserListResponse[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: UserFilter;
  setFilters: (filters: Partial<UserFilter>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refresh: () => void;
}

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (updates: UserUpdate) => Promise<void>;
  updatePassword: (passwordData: PasswordUpdate) => Promise<void>;
  refresh: () => void;
}

export interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Form validation schemas (for use with libraries like Zod or Yup)
export interface UserFormValidation {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  industry?: string;
}

// User search and filtering utilities
export interface UserSearchOptions {
  query: string;
  filters: UserFilter;
  sortBy?: 'name' | 'email' | 'created_at' | 'last_login' | 'credits';
  sortOrder?: 'asc' | 'desc';
}

// User export/import types
export interface UserExport {
  users: UserListResponse[];
  export_date: string;
  filters_applied: UserFilter;
  total_exported: number;
}

export interface UserImport {
  file: File;
  mapping: Record<string, string>;
  options: {
    skip_duplicates: boolean;
    update_existing: boolean;
    validate_data: boolean;
  };
}

// User notification preferences
export interface UserNotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  appointment_reminders: boolean;
  credit_alerts: boolean;
  system_updates: boolean;
}

// User session and activity
export interface UserSession {
  user_id: number;
  session_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
}

// User permissions and roles
export interface UserPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: UserPermission[];
  is_default: boolean;
}

// User audit log
export interface UserAuditLog {
  id: string;
  user_id: number;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  admin_user_id?: number;
}
