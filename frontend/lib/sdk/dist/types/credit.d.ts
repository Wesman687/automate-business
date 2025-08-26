export interface CreditPackage {
    id: number;
    name: string;
    description?: string;
    monthly_price: number;
    credit_amount: number;
    credit_rate: number;
    features: string[];
    is_featured: boolean;
    stripe_price_id?: string;
}
export interface UserSubscription {
    id: number;
    package_name: string;
    status: string;
    monthly_credit_limit: number;
    current_month_credits: number;
    rollover_credits: number;
    next_billing_date: string;
    stripe_subscription_id?: string;
}
export interface CreditBalance {
    user_id: number;
    current_credits: number;
    can_consume: boolean;
    required_credits?: number;
    available_packages: CreditPackage[];
}
export interface CreditConsumption {
    success: boolean;
    credits_consumed: number;
    remaining_credits: number;
    transaction_id?: string;
    error?: string;
}
export interface CreditPurchase {
    checkout_url: string;
    session_id: string;
    expires_at: string;
}
export interface CreditPurchaseRequest {
    package_id?: number;
    credits: number;
    return_url: string;
}
export interface CreditConsumptionRequest {
    credits: number;
    service: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface CreditTransaction {
    id: number;
    user_id: number;
    amount: number;
    transaction_type: 'purchase' | 'consumption' | 'refund' | 'adjustment';
    description: string;
    metadata?: Record<string, any>;
    created_at: string;
}
export interface AppCreditUsage {
    credits_consumed: number;
    credits_purchased: number;
    last_consumption?: string;
    last_purchase?: string;
    app_metadata?: Record<string, any>;
}
export interface CreditValidation {
    has_sufficient_credits: boolean;
    required_credits: number;
    available_credits: number;
    deficit?: number;
}
export interface CreditPackageComparison {
    package: CreditPackage;
    cost_per_credit: number;
    total_cost: number;
    savings?: number;
    recommended: boolean;
}
//# sourceMappingURL=credit.d.ts.map