import { CrossAppAuthSDK } from './CrossAppAuthSDK';
import { CreditBalance, CreditConsumption, CreditPurchase, CreditPurchaseRequest, CreditPackage, UserSubscription, CreditValidation } from '../types/credit';
/**
 * Credit SDK for Cross-App Integration
 *
 * Provides credit management functionality for applications integrating
 * with the Stream-line AI Automate platform's credit system.
 */
export declare class CreditSDK {
    private authSDK;
    private apiBase;
    constructor(authSDK: CrossAppAuthSDK);
    /**
     * Get user's current credit balance and available packages
     */
    getCreditBalance(requiredCredits?: number): Promise<CreditBalance>;
    /**
     * Check if user has sufficient credits for a service
     */
    hasSufficientCredits(requiredCredits: number): Promise<boolean>;
    /**
     * Consume credits for a service
     */
    consumeCredits(credits: number, service: string, description?: string, metadata?: Record<string, any>): Promise<CreditConsumption>;
    /**
     * Purchase credits directly (bypasses dashboard)
     */
    purchaseCredits(request: CreditPurchaseRequest): Promise<CreditPurchase>;
    /**
     * Get available credit packages
     */
    getCreditPackages(): Promise<CreditPackage[]>;
    /**
     * Get user's active subscriptions
     */
    getUserSubscriptions(): Promise<UserSubscription[]>;
    /**
     * Validate credit requirements for a service
     */
    validateCreditRequirements(requiredCredits: number, service: string): Promise<CreditValidation>;
    /**
     * Get recommended credit package for a specific amount
     */
    getRecommendedPackage(targetCredits: number): Promise<CreditPackage | null>;
    /**
     * Calculate cost per credit for a package
     */
    calculateCostPerCredit(creditPackage: CreditPackage): number;
    /**
     * Compare credit packages by value
     */
    comparePackages(packages: CreditPackage[]): CreditPackage[];
    /**
     * Quick credit check for immediate service usage
     */
    quickCreditCheck(requiredCredits: number): Promise<{
        canProceed: boolean;
        currentCredits: number;
        deficit: number;
        recommendedPackage?: CreditPackage;
    }>;
    /**
     * Get credit usage statistics for the current app
     */
    getAppCreditUsage(): Promise<{
        credits_consumed: number;
        credits_purchased: number;
        last_consumption?: string;
        last_purchase?: string;
    }>;
}
//# sourceMappingURL=CreditSDK.d.ts.map