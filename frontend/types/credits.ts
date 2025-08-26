// Credit System Types

export interface CreditBalance {
  user_id: number;
  current_credits: number;
  credit_status: string;
  subscription?: UserSubscription;
  next_billing_date?: string;
}

export interface CreditTransaction {
  id: string;
  user_id: number;
  amount: number;
  description: string;
  transaction_type: TransactionType;
  subscription_id?: number;
  job_id?: string;
  dollar_amount?: number;
  stripe_payment_intent_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  subscription?: UserSubscription;
}

export interface CreditTransactionHistory {
  transactions: CreditTransaction[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface CreditPackage {
  id: number;
  name: string;
  description?: string;
  monthly_price: number;
  credit_amount: number;
  credit_rate: number;
  features?: string[];
  max_credits_per_month?: number;
  rollover_enabled: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  stripe_price_id?: string;
  stripe_product_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  package_id: number;
  status: SubscriptionStatus;
  start_date: string;
  next_billing_date: string;
  end_date?: string;
  monthly_credit_limit: number;
  current_month_credits: number;
  rollover_credits: number;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  stripe_invoice_id?: string;
  is_paused: boolean;
  pause_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  package: CreditPackage;
}

export interface CreditDispute {
  id: number;
  user_id: number;
  transaction_id?: string;
  reason: string;
  description: string;
  requested_refund?: number;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolved_amount?: number;
  admin_id?: number;
  admin_notes?: string;
  resolution_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  resolved_at?: string;
}

export interface CreditPromotion {
  id: number;
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  max_discount?: number;
  package_ids?: number[];
  user_groups?: string[];
  min_purchase?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_uses?: number;
  current_uses: number;
  max_uses_per_user: number;
  created_at: string;
  updated_at?: string;
}

export interface DisputeQueue {
  disputes: CreditDispute[];
  total_count: number;
  pending_count: number;
  under_review_count: number;
}

export interface SubscriptionSummary {
  active_subscriptions: number;
  total_monthly_revenue: number;
  average_credits_per_user: number;
  paused_subscriptions: number;
}

export interface SystemCreditSummary {
  total_users: number;
  users_with_credits: number;
  total_credits: number;
  total_value_usd: number;
  recent_transactions_24h: number;
  credit_status_distribution: Record<string, number>;
  credit_rate: number;
}

// Enums
export enum TransactionType {
  SERVICE = "service",
  SUBSCRIPTION = "subscription",
  ADMIN = "admin",
  DISPUTE = "dispute",
  PURCHASE = "purchase"
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

// Request Types
export interface AddCreditsRequest {
  user_id: number;
  amount: number;
  reason: string;
  admin_notes?: string;
}

export interface RemoveCreditsRequest {
  user_id: number;
  amount: number;
  reason: string;
  admin_notes?: string;
}

export interface PauseCreditServiceRequest {
  user_id: number;
  reason: string;
  admin_notes?: string;
}

export interface ResumeCreditServiceRequest {
  user_id: number;
  admin_notes?: string;
}

export interface DisputeResolutionRequest {
  dispute_id: number;
  resolution: DisputeResolution;
  resolved_amount?: number;
  resolution_notes: string;
  admin_notes?: string;
}

export interface CreditPurchaseRequest {
  amount: number;
  description: string;
  stripe_payment_intent_id?: string;
}

export interface CreditPurchaseValidation {
  can_purchase: boolean;
  reason?: string;
  estimated_cost: number;
  credit_rate: number;
  credits_to_add: number;
}

// Credit Summary Types
export interface UserCreditSummary {
  current_balance: number;
  credit_status: string;
  monthly_credits_added: number;
  monthly_credits_spent: number;
  monthly_net_change: number;
  subscription?: UserSubscription;
  total_transactions: number;
  credit_rate: number;
  estimated_monthly_cost: number;
}

// Utility Types
export interface CreditRate {
  credit_rate: number;
  currency: string;
  description: string;
}

export interface CreditPackageResponse {
  message: string;
  packages: CreditPackage[];
}

// Form Types
export interface DisputeFormData {
  reason: string;
  description: string;
  requested_refund?: number;
  transaction_id?: string;
}

export interface CreditPurchaseFormData {
  amount: number;
  description: string;
}

// Admin Credit Management Types
export interface AdminCreditAction {
  user_id: number;
  amount: number;
  reason: string;
  admin_notes?: string;
}

export interface AdminCreditResponse {
  success: boolean;
  message: string;
  transaction?: CreditTransaction;
  new_balance?: number;
}

export interface AdminPauseResponse {
  success: boolean;
  message: string;
  reason?: string;
}

export interface AdminResumeResponse {
  success: boolean;
  message: string;
}

// Dispute Statistics
export interface DisputeStatistics {
  total_disputes: number;
  pending_disputes: number;
  under_review_disputes: number;
  resolved_disputes: number;
  rejected_disputes: number;
  average_resolution_time_hours: number;
  disputes_this_month: number;
  disputes_last_month: number;
}
