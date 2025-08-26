/**
 * TypeScript types for Stripe integration
 */

export interface StripeCustomer {
  id: number;
  stripe_customer_id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface StripeSubscription {
  id: number;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  amount: number;
  currency: string;
  product_name: string;
  interval: string;
  interval_count: number;
}

export interface StripePaymentIntent {
  id: number;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  created_at: string;
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: string;
    interval_count: number;
  };
}

export interface StripeProductWithPrices {
  id: string;
  name: string;
  description?: string;
  prices: StripePrice[];
}

export interface CheckoutSessionCreate {
  user_id: number;
  price_id: string;
  success_url: string;
  cancel_url: string;
  mode: 'payment' | 'subscription';
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface SubscriptionCreate {
  user_id: number;
  price_id: string;
  payment_method_id?: string;
  trial_period_days?: number;
}

export interface SubscriptionResponse {
  id: number;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  amount: number;
  currency: string;
  product_name: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface StripeWebhookEvent {
  id: number;
  stripe_event_id: string;
  event_type: string;
  processed: boolean;
  created_at: string;
  processed_at?: string;
  error_message?: string;
}

// Payment form types
export interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
  description?: string;
  metadata?: Record<string, string>;
}

// Subscription manager types
export interface SubscriptionManagerProps {
  userId: number;
}

// Financial dashboard types
export interface FinancialOverview {
  total_users: number;
  total_credits: number;
  active_subscriptions: number;
  total_subscription_revenue: number;
}

export interface MonthlyStats {
  credits_spent: number;
  credits_added: number;
  net_change: number;
}

export interface Transaction {
  id: string;
  user_email: string;
  amount: number;
  description: string;
  created_at: string;
  type: 'credit' | 'debit';
}

export interface FinancialDashboardData {
  overview: FinancialOverview;
  monthly_stats: MonthlyStats;
  recent_transactions: Transaction[];
}

// Credit management types
export interface CreditBalance {
  current_balance: number;
  total_earned: number;
  total_spent: number;
  recent_transactions: Transaction[];
}

export interface CreditTransaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  type: 'credit' | 'debit';
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StripeError {
  code: string;
  message: string;
  details?: any;
}
