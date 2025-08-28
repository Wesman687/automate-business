/**
 * UNIFIED FRONTEND TYPE SYSTEM
 * 
 * This file consolidates ALL TypeScript interfaces and types into a single location,
 * organized by business domain to match the clean backend structure.
 * 
 * NO MORE SCATTERED TYPES - Everything is here in one place!
 * 
 * Usage:
 * import { User, Job, CreditTransaction } from '@/types/types';
 * import type { LoginRequest, ApiResponse } from '@/types/types';
 */

// ============================================================================
// ENUMS - Centralized enum definitions
// ============================================================================

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

export enum JobStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ON_HOLD = "on_hold",
  CANCELLED = "cancelled"
}

export enum JobPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}

export enum LeadStatus {
  LEAD = "lead",
  QUALIFIED = "qualified",
  CUSTOMER = "customer",
  CLOSED = "closed"
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  TRIAL = "trial"
}

export enum DisputeStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  RESOLVED = "resolved",
  REJECTED = "rejected",
  APPEALED = "appealed"
}

export enum DisputeResolution {
  FULL_REFUND = "full_refund",
  PARTIAL_REFUND = "partial_refund",
  EXPLANATION = "explanation",
  REJECTED = "rejected"
}

export enum TransactionType {
  SERVICE = "service",
  SUBSCRIPTION = "subscription",
  ADMIN = "admin",
  DISPUTE = "dispute",
  PURCHASE = "purchase"
}

export enum AppStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_APPROVAL = "pending_approval"
}

export enum CrossAppSessionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked"
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show"
}

// ============================================================================
// USER MODELS - Core user interfaces
// ============================================================================

export interface User {
  id: number;
  user_id?: number; // For backward compatibility
  email: string;
  password_hash?: string; // Optional for frontend
  user_type: UserType;
  status: UserStatus;
  
  // Identity fields
  name?: string;
  username?: string;
  phone?: string;
  
  // Address fields (mainly for customers)
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  
  // Business fields (mainly for customers)
  business_site?: string;
  additional_websites?: string;
  business_type?: string;
  
  // Customer-specific fields
  lead_status?: LeadStatus;
  notes?: string;
  
  // Admin-specific fields
  is_super_admin?: boolean;
  is_active?: boolean; // For backward compatibility
  
  // Credit system
  credits?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  
  // Computed properties (frontend only)
  is_admin?: boolean;
  is_customer?: boolean;
}

// User update request interface for API calls
export interface UserUpdateRequest {
  name?: string;
  username?: string;
  phone?: string;
  email?: string;
  status?: UserStatus;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  business_site?: string;
  additional_websites?: string;
  notes?: string;
  credits?: number;
}

export interface Admin extends User {
  user_type: UserType.ADMIN;
  is_super_admin: boolean;
}

export interface Customer extends User {
  // Customer-specific properties - now nested under customer_fields
  customer_fields?: {
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    business_site?: string;
    additional_websites?: string;
    business_type?: string;
    lead_status?: string;
    notes?: string;
  };
  
  // Legacy flat fields for backward compatibility
  business_site?: string;
  additional_websites?: string;
  file_path?: string;
  chat_count?: number;
  chat_sessions?: any[];
  pain_points?: string; // For backward compatibility
  current_tools?: string; // For backward compatibility
  budget?: string; // For backward compatibility
}


export interface PortalInvite {
  id: number;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
  used_at?: string;
  invited_by_id: number;
  invited_by?: User;
}

export interface ChatSession {
  id: number;
  session_id: string;
  user_id: number;
  customer_id?: number;
  status: string;
  is_seen: boolean;
  created_at: string;
  updated_at: string;
  start_time?: string; // For backward compatibility
  end_time?: string; // For backward compatibility
  message_count: number;
  user?: User;
  customer?: User;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  text: string;
  is_bot: boolean;
  timestamp: string;
  session?: ChatSession;
}

export interface ChatLogData {
  session: ChatSession;
  customer?: Customer;
  messages: ChatMessage[];
}

// ============================================================================
// PAYMENT MODELS - Invoice and payment interfaces
// ============================================================================

export interface Invoice {
  id: number;
  customer_id: number;
  number?: string;
  invoice_number?: string; // For backward compatibility
  amount: number;
  total_amount?: number; // For backward compatibility
  currency?: string;
  status: string;
  due_date: string;
  issue_date?: string; // For backward compatibility
  created_at: string;
  paid_at?: string;
  description?: string;
  stripe_invoice_id?: string;
  customer?: User;
}

export interface RecurringPayment {
  id: number;
  customer_id: number;
  name?: string; // For backward compatibility
  amount: number;
  frequency: string;
  interval?: string; // For backward compatibility
  status: string;
  next_payment_date: string;
  next_billing_date?: string; // For backward compatibility
  created_at: string;
  customer?: User;
}

export interface TimeEntry {
  id: number;
  job_id: number;
  admin_id: number;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  description?: string;
  billable: boolean;
  hourly_rate?: number;
  amount?: number;
  created_at: string;
  updated_at: string;
  job?: Job;
  admin?: User;
}

// ============================================================================
// CREDIT MODELS - Credit system interfaces
// ============================================================================

export interface CreditPackage {
  id: number;
  name: string;
  description?: string;
  credits: number;
  price: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  package_id: number;
  status: SubscriptionStatus;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  package?: CreditPackage;
}

export interface CreditTransaction {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  transaction_type: TransactionType;
  status: string;
  transaction_metadata?: any;
  created_at: string;
  user?: User;
}

export interface CreditDispute {
  id: number;
  user_id: number;
  transaction_id: number;
  reason: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  admin_notes?: string;
  requested_refund?: number;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
  user?: User;
  transaction?: CreditTransaction;
}

export interface CreditPromotion {
  id: number;
  code: string;
  description: string;
  credits: number;
  max_uses?: number;
  current_uses: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// AUTOMATION MODELS - Job and automation interfaces
// ============================================================================

export interface Job {
  // Core Job Information
  id: number;
  customer_id: number;
  title: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  progress_percentage: number;
  
  // Business Information
  business_name?: string;
  business_type?: string;
  industry?: string;
  industry_other?: string;
  
  // Project Details
  project_goals?: string;
  target_audience?: string;
  timeline?: string;
  budget_range?: string;
  
  // Branding & Design
  brand_colors?: string[];
  brand_color_tags?: Record<number, string>;
  brand_color_tag_others?: Record<number, string>;
  brand_style?: string;
  brand_style_other?: string;
  logo_files?: number[];
  brand_guidelines?: string;
  
  // Resources & Links
  website_url?: string;
  github_url?: string;
  portfolio_url?: string;
  social_media?: SocialMediaLinks;
  
  // Unified Resources
  resources?: JobResource[];
  additional_tools?: JobTool[];
  server_details?: ServerDetail[];
  meeting_links?: MeetingLink[];
  
  // Legacy Resource Arrays (for backward compatibility)
  google_drive_links?: Array<{ name: string; url: string; type?: string }>;
  github_repositories?: Array<{ name: string; url: string; type?: string }>;
  workspace_links?: Array<{ name: string; url: string; type?: string }>;
  calendar_links?: Array<{ name: string; url: string; type?: string }>;
  
  // Project Planning
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  
  // Financial Information
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  
  // Files & Assets
  project_files?: number[];
  reference_files?: number[];
  requirements_doc?: string;
  
  // Additional Information
  notes?: string;
  additional_resource_info?: string;
  
  // Metadata
  created_at: string;
  updated_at?: string;
  customer?: User;
  time_entries?: TimeEntry[];
}

// Supporting interfaces for Job
export interface JobResource {
  type: 'website' | 'github' | 'drive' | 'workspace' | 'service';
  name: string;
  url?: string;
  description?: string;
}

export interface JobTool {
  name: string;
  api_key?: string;
  url?: string;
  description?: string;
  type?: string;
}

export interface ServerDetail {
  name: string;
  url?: string;
  type?: string;
  description?: string;
}

export interface MeetingLink {
  name: string;
  url: string;
  type?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  snapchat?: string;
  [key: string]: string | undefined; // Add index signature for dynamic access
}

export interface Milestone {
  id?: number;
  name: string;
  description?: string;
  completed: boolean;
  due_date?: string;
}

export interface Deliverable {
  id?: number;
  name: string;
  description?: string;
  delivered: boolean;
  date?: string;
}

export interface JobFile {
  id: number;
  filename: string;
  folder: string;
  public_url: string;
  created_at: string;
  file_size: number;
}

export interface FinancialBreakdown {
  estimated_hours: number;
  recommended_hourly_rate: number;
  fixed_price_estimate: number;
  labor_cost: number;
  project_costs: number;
  total_project_cost: number;
  monthly_maintenance: number;
  monthly_support: number;
  monthly_hosting: number;
  total_monthly_cost: number;
  breakdown_notes: string;
  cost_breakdown: {
    [key: string]: number;
  };
}

// For backward compatibility - JobDetailData is now an alias for Job
export type JobDetailData = Job;

// Form data interface for job creation/editing
export interface JobFormData {
  customer_id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  start_date: string;
  deadline: string;
  estimated_hours: string;
  hourly_rate: string;
  fixed_price: string;
  website_url: string;
  notes: string;
  milestones: Array<{ name: string; description: string; due_date: string; completed: boolean }>;
  
  // Business Information
  business_name: string;
  business_type: string;
  industry: string;
  industry_other: string;
  
  // Project Details
  project_goals: string;
  target_audience: string;
  timeline: string;
  budget_range: string;
  
  // Branding & Design
  brand_style: string;
  brand_style_other: string;
  brand_guidelines: string;
  
  // Resources & Links
  github_url: string;
  portfolio_url: string;
  
  // Social Media
  social_media: {
    facebook: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
    pinterest: string;
    snapchat: string;
  };
  
  // Unified Resources
  resources: Array<{
    type: 'website' | 'github' | 'drive' | 'workspace' | 'service';
    name: string;
    url?: string;
    description?: string;
  }>;
  
  // Additional Tools
  additional_tools: Array<{
    name: string;
    api_key?: string;
    url?: string;
    description?: string;
  }>;
  
  // Server Details
  server_details: Array<{
    name: string;
    url?: string;
    type?: string;
    description?: string;
  }>;
  
  // Project Planning
  deliverables: Array<{ name: string; description?: string; delivered: boolean; date?: string }>;
  
  // Additional Information
  additional_resource_info: string[];
}
export interface SocialMediaManagerProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  onFieldChange: (field: string, value: any) => void;
}

export interface CustomerChangeRequest {
  id: number;
  job_id: number;
  user_id: number;
  title: string;
  description: string;
  priority: JobPriority;
  status: string;
  requested_via: string;
  admin_notes?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  user?: User;
}

export interface Video {
  id: number;
  job_id: number;
  user_id: number;
  title: string;
  description?: string;
  file_path?: string;
  thumbnail_path?: string;
  duration?: number;
  status: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  user?: User;
}

export interface Appointment {
  id: number;
  customer_id: number;
  scheduled_date: string;
  appointment_date?: string; // For backward compatibility
  appointment_time?: string; // For backward compatibility
  duration_minutes: number;
  appointment_type: string;
  meeting_type?: string; // For backward compatibility
  status: AppointmentStatus;
  customer_notes?: string;
  admin_notes?: string;
  notes?: string; // For backward compatibility
  title?: string; // For backward compatibility
  description?: string; // For backward compatibility
  created_at: string;
  updated_at: string;
  customer?: User;
}

// ============================================================================
// FILE MODELS - File upload interfaces
// ============================================================================

export interface FileUpload {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_type: string;
  file_server_url?: string;
  file_id?: string;
  description?: string;
  tags?: string;
  user_id?: number;
  customer_id?: number;
  job_id?: number;
  access_email?: string;
  created_at: string;
  updated_at: string;
  uploaded_at?: string; // For backward compatibility
  file_url?: string; // For backward compatibility
  public_url?: string; // For backward compatibility
  user?: User;
  customer?: User;
  job?: Job;
}

// ============================================================================
// STRIPE MODELS - Payment processing interfaces
// ============================================================================

export interface StripeCustomer {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: any;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface StripeSubscription {
  id: number;
  user_id: number;
  stripe_subscription_id: string;
  product_name?: string;
  status: string;
  amount?: number;
  currency?: string;
  interval?: string;
  interval_count?: number;
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface StripePaymentIntent {
  id: number;
  user_id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method_types: string[];
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface StripePaymentMethod {
  id: number;
  user_id: number;
  stripe_payment_method_id: string;
  type: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface StripeWebhookEvent {
  id: number;
  stripe_event_id: string;
  event_type: string;
  event_data: any;
  processed: boolean;
  created_at: string;
  processed_at?: string;
}

export interface StripeProduct {
  id: number;
  stripe_product_id: string;
  name: string;
  description?: string;
  active: boolean;
  prices?: Array<{
    id: string;
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CustomerBillingData {
  invoices: Invoice[];
  subscriptions: StripeSubscription[];
  disputes: CreditDispute[];
  credit_balance: number;
  payment_methods: Array<{
    id: string;
    type: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  }>;
}
// ============================================================================
// SCRAPER MODELS - Data extraction interfaces
// ============================================================================

export interface ExtractorSchema {
  id: number;
  name: string;
  description?: string;
  schema_definition: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScrapingJob {
  id: number;
  name: string;
  description?: string;
  url: string;
  schema_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  schema?: ExtractorSchema;
}

export interface Run {
  id: number;
  job_id: number;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  job?: ScrapingJob;
}

export interface Result {
  id: number;
  run_id: number;
  data: any;
  created_at: string;
  run?: Run;
}

export interface Export {
  id: number;
  run_id: number;
  format: string;
  file_path?: string;
  status: string;
  created_at: string;
  run?: Run;
}

// ============================================================================
// CROSS-APP MODELS - Integration interfaces
// ============================================================================

export interface AppIntegration {
  id: number;
  app_name: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  status: AppStatus;
  created_at: string;
  updated_at: string;
}

export interface CrossAppSession {
  id: number;
  user_id: number;
  app_id: number;
  session_token: string;
  status: CrossAppSessionStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  user?: User;
  app?: AppIntegration;
}

export interface AppCreditUsage {
  id: number;
  user_id: number;
  app_id: number;
  credits_used: number;
  description: string;
  created_at: string;
  user?: User;
  app?: AppIntegration;
}

// ============================================================================
// EMAIL MODELS - Email account interfaces
// ============================================================================

export interface EmailAccount {
  id: number;
  user_id: number;
  email: string;
  provider: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Email {
  id: string;
  account: string;
  from: string;
  subject: string;
  received_date: string;
  preview: string;
  is_important: boolean;
  is_read: boolean;
  body?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES - API communication interfaces
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ============================================================================
// COMPONENT-SPECIFIC TYPES - UI component interfaces
// ============================================================================

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

export interface UserCreate {
  email: string;
  password: string;
  name?: string;
  username?: string;
  phone?: string;
  user_type: UserType;
  status?: UserStatus;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  customer_fields?: any; // For backward compatibility
  admin_fields?: any; // For backward compatibility
}

export interface UserUpdate {
  name?: string;
  username?: string;
  phone?: string;
  status?: UserStatus;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
}

export interface JobCreate {
  customer_id: number;
  title: string;
  description?: string;
  priority: JobPriority;
  estimated_hours?: number;
  start_date?: string;
  due_date?: string;
}

export interface JobUpdate {
  // Core Job Information
  title?: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  progress_percentage?: number;
  
  // Business Information
  business_name?: string;
  business_type?: string;
  industry?: string;
  industry_other?: string;
  
  // Project Details
  project_goals?: string;
  target_audience?: string;
  timeline?: string;
  budget_range?: string;
  
  // Branding & Design
  brand_style?: string;
  brand_style_other?: string;
  brand_guidelines?: string;
  brand_colors?: string[];
  brand_color_tags?: Record<number, string>;
  brand_color_tag_others?: Record<number, string>;
  
  // Resources & Links
  website_url?: string;
  github_url?: string;
  portfolio_url?: string;
  social_media?: SocialMediaLinks;
  
  // Unified Resources
  resources?: JobResource[];
  
  // Additional Tools
  additional_tools?: JobTool[];
  
  // Server Details
  server_details?: ServerDetail[];
  
  // Project Planning
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  
  // Financial Information
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  
  // Additional Information
  notes?: string;
  additional_resource_info?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}


// Legacy type names for backward compatibility
export interface JobCreateRequest extends JobCreate {}
export interface JobUpdateRequest extends JobUpdate {}

export interface AppointmentCreate {
  customer_id: number;
  scheduled_date: string;
  duration_minutes: number;
  appointment_type: string;
  customer_notes?: string;
  status?: AppointmentStatus;
  title?: string; // For backward compatibility
  description?: string; // For backward compatibility
  notes?: string; // For backward compatibility
  meeting_type?: string; // For backward compatibility
}

export interface AppointmentUpdate {
  scheduled_date?: string;
  duration_minutes?: number;
  appointment_type?: string;
  customer_notes?: string;
  admin_notes?: string;
  status?: AppointmentStatus;
  title?: string; // For backward compatibility
  description?: string; // For backward compatibility
  notes?: string; // For backward compatibility
  meeting_type?: string; // For backward compatibility
}

// Legacy type names for backward compatibility
export interface AppointmentCreateRequest extends AppointmentCreate {}
export interface AppointmentUpdateRequest extends AppointmentUpdate {}

export interface BulkUserUpdate {
  user_ids: number[];
  updates: Partial<UserUpdate>;
}

export interface BulkUserStatusUpdate {
  user_ids: number[];
  status: UserStatus;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  pending_users: number;
  suspended_users: number;
  total_customers: number;
  total_admins: number;
  new_users_this_month: number;
}

export interface SeenStatusRequest {
  is_seen: boolean;
}

// JobExtended is no longer needed as the main Job interface now includes all properties

// Extended FileUpload interface with additional properties
export interface FileUploadExtended extends FileUpload {
  uploaded_at?: string;
  file_url?: string;
}

// Job Setup Wizard Types
export interface JobSetupData {
  business_name: string;
  business_type: string;
  industry: string;
  description: string;
  project_title: string;
  project_description: string;
  project_goals: string;
  target_audience: string;
  timeline: string;
  budget_range: string;
  brand_colors: string[];
  brand_style: string;
  logo_files: number[];
  brand_guidelines: string;
  website_url: string;
  github_url: string;
  social_media: Record<string, string>;
  project_files: number[];
  reference_files: number[];
  requirements_doc: string;
}

// Appointment Scheduling Types
export interface TimeSlot {
  datetime: string;
  date: string;
  time: string;
  display_time: string;
  label?: string;
}

export interface DateSlot {
  formatted_date: string;
  day_name: string;
  is_today: boolean;
  is_tomorrow: boolean;
  slots_count: number;
  time_slots: TimeSlot[];
}

export interface AvailableDate {
  date: string;
  day_name: string;
  is_today: boolean;
  is_tomorrow: boolean;
  slots_count: number;
  time_slots: TimeSlot[];
}

export interface SmartSlotsResponse {
  recommended_times: TimeSlot[];
  available_dates: DateSlot[];
  next_available?: TimeSlot;
}

// Extended Appointment interface with additional properties
export interface AppointmentExtended extends Appointment {
  title?: string;
  description?: string;
  appointment_date?: string;
  appointment_time?: string;
  scheduled_time?: string;
  meeting_type?: string;
  notes?: string;
  customer_name?: string;
  customer_email?: string;
}

// ============================================================================
// CONSTANTS - Centralized constant definitions
// ============================================================================

// Validation patterns for form inputs
export interface Validation_Patterns {
  email: RegExp;
  phone: RegExp;
  zip_code: RegExp;
  password: RegExp;
  username: RegExp;
  url: RegExp;
  numeric: RegExp;
  alphanumeric: RegExp;
  date: RegExp;
}

// Validation error messages
export interface Validation_messages {
  email: string;
  phone: string;
  zip_code: string;
  password: string;
  username: string;
  url: string;
  required: string;
  min_length: string;
  max_length: string;
  invalid_format: string;
  password_mismatch: string;
  email_exists: string;
  username_exists: string;
}

// Actual validation patterns (constants)
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  NUMERIC: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/
} as const;

// Validation error messages (constants)
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  ZIP_CODE: 'Please enter a valid ZIP code',
  PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  USERNAME: 'Username must be 3-20 characters, letters, numbers, and underscores only',
  URL: 'Please enter a valid URL',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
  MAX_LENGTH: (length: number) => `Must be no more than ${length} characters`,
  INVALID_FORMAT: 'Invalid format',
  PASSWORD_MISMATCH: 'Passwords do not match',
  EMAIL_EXISTS: 'Email already exists',
  USERNAME_EXISTS: 'Username already exists'
} as const;

// Array constants for iteration
export const JOB_STATUSES = Object.values(JobStatus);
export const JOB_PRIORITIES = Object.values(JobPriority);
export const USER_TYPES = Object.values(UserType);
export const USER_STATUSES = Object.values(UserStatus);
export const APPOINTMENT_STATUSES = Object.values(AppointmentStatus);

// Object constants for backward compatibility (used by components)
export const JOB_STATUSES_OBJ = {
  PENDING: JobStatus.PENDING,
  IN_PROGRESS: JobStatus.IN_PROGRESS,
  COMPLETED: JobStatus.COMPLETED,
  ON_HOLD: JobStatus.ON_HOLD,
  CANCELLED: JobStatus.CANCELLED,
  PLANNING: JobStatus.PENDING // Map old 'planning' to 'pending'
} as const;

export const JOB_PRIORITIES_OBJ = {
  LOW: JobPriority.LOW,
  MEDIUM: JobPriority.MEDIUM,
  HIGH: JobPriority.HIGH,
  URGENT: JobPriority.URGENT
} as const;

export const USER_TYPES_OBJ = {
  ADMIN: UserType.ADMIN,
  CUSTOMER: UserType.CUSTOMER
} as const;

export const USER_STATUSES_OBJ = {
  ACTIVE: UserStatus.ACTIVE,
  INACTIVE: UserStatus.INACTIVE,
  PENDING: UserStatus.PENDING,
  SUSPENDED: UserStatus.SUSPENDED
} as const;

// ============================================================================
// TYPE GUARDS - Runtime type checking utilities
// ============================================================================

export function isAdmin(user: User): user is Admin {
  return user.user_type === UserType.ADMIN;
}

export function isCustomer(user: User): user is Customer {
  return user.user_type === UserType.CUSTOMER;
}

export function isSuperAdmin(user: User): boolean {
  return isAdmin(user) && user.is_super_admin === true;
}

export function hasCredits(user: User, required: number): boolean {
  return (user.credits || 0) >= required;
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailCreateRequest {
  to: string;
  subject: string;
  body: string;
  template?: string;
  variables?: Record<string, any>;
}

export interface EmailResponse {
  id: string;
  status: 'sent' | 'failed' | 'pending';
  message?: string;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface InvoiceCreateRequest {
  customer_id: number;
  amount: number;
  currency: string;
  due_date: string;
  description?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// ============================================================================
// RECURRING PAYMENT TYPES
// ============================================================================

export interface RecurringPaymentCreateRequest {
  customer_id: number;
  name: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'weekly';
  start_date: string;
  description?: string;
}

// ============================================================================
// CREDIT TYPES
// ============================================================================

export interface CreditBalance {
  user_id: number;
  balance: number;
  last_updated: string;
}

export interface CreditTransactionHistory {
  transactions: CreditTransaction[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface UserCreditSummary {
  user_id: number;
  current_balance: number;
  total_earned: number;
  total_spent: number;
  last_transaction_date?: string;
}

export interface CreditPurchaseRequest {
  user_id: number;
  amount: number;
  payment_method: string;
  currency: string;
}

export interface CreditPurchaseValidation {
  is_valid: boolean;
  estimated_cost: number;
  currency: string;
  errors?: string[];
}

export interface CreditRate {
  rate: number;
  currency: string;
  bulk_discounts?: Record<number, number>;
}

export interface CreditPackageResponse {
  packages: CreditPackage[];
  recommended?: CreditPackage;
}

export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  currency: string;
  discount_percentage?: number;
}

// ============================================================================
// STRIPE TYPES
// ============================================================================

export interface CheckoutSessionCreate {
  price_id: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
}

export interface SubscriptionCreate {
  price_id: string;
  customer_email: string;
  trial_period_days?: number;
}

export interface SubscriptionResponse {
  subscription_id: string;
  status: string;
  current_period_end: string;
}

export interface CustomerPortalResponse {
  portal_url: string;
}

export interface StripeProductWithPrices {
  id: string;
  name: string;
  description?: string;
  prices: StripePrice[];
}

export interface StripePrice {
  id: string;
  currency: string;
  unit_amount: number;
  recurring?: {
    interval: 'month' | 'year';
    interval_count: number;
  };
}

export interface StripeError {
  message: string;
  code?: string;
  type?: string;
}

// ============================================================================
// USER HOOK TYPES
// ============================================================================

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  createUser: (userData: Partial<UserCreate>) => Promise<void>;
  updateUser: (userId: number, userData: Partial<UserUpdate>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (userData: Partial<UserUpdate>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface UseUserStatsReturn {
  stats: UserStats;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  users_by_type: Record<UserType, number>;
}

// ============================================================================
// USER FILTER TYPES
// ============================================================================

export interface UserFilter {
  status?: UserStatus;
  user_type?: UserType;
  lead_status?: LeadStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// CHANGE REQUEST TYPES
// ============================================================================

export interface ChangeRequest {
  id: number;
  customer_id: number;
  customer_name?: string;
  job_title?: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  session_id?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// FILE MANAGEMENT TYPES
// ============================================================================

export interface FileUploadExtended extends FileUpload {
  upload_type: string;
  description?: string;
  tags?: string;
  folder?: string;
  is_folder?: boolean;
}
