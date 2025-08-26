import { CrossAppAuthSDK } from './CrossAppAuthSDK';
import {
  CreditBalance,
  CreditConsumption,
  CreditPurchase,
  CreditPurchaseRequest,
  CreditConsumptionRequest,
  CreditPackage,
  UserSubscription,
  CreditValidation
} from '../types/credit';

/**
 * Credit SDK for Cross-App Integration
 * 
 * Provides credit management functionality for applications integrating
 * with the Stream-line AI Automate platform's credit system.
 */
export class CreditSDK {
  private authSDK: CrossAppAuthSDK;
  private apiBase: string;

  constructor(authSDK: CrossAppAuthSDK) {
    this.authSDK = authSDK;
    this.apiBase = authSDK['apiBase'] || `https://api.${authSDK['config'].domain}`;
  }

  /**
   * Get user's current credit balance and available packages
   */
  public async getCreditBalance(requiredCredits?: number): Promise<CreditBalance> {
    if (!this.authSDK.isAuthenticated()) {
      throw new Error('User must be authenticated to check credit balance');
    }

    const sessionToken = this.authSDK.getSessionToken();
    if (!sessionToken) {
      throw new Error('No valid session token');
    }

    const response = await fetch(`${this.apiBase}/api/cross-app/credits/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: sessionToken,
        app_id: this.authSDK['config'].appId,
        required_credits: requiredCredits
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to check credit balance');
    }

    return await response.json();
  }

  /**
   * Check if user has sufficient credits for a service
   */
  public async hasSufficientCredits(requiredCredits: number): Promise<boolean> {
    try {
      const balance = await this.getCreditBalance(requiredCredits);
      return balance.can_consume;
    } catch (error) {
      console.error('Error checking credit sufficiency:', error);
      return false;
    }
  }

  /**
   * Consume credits for a service
   */
  public async consumeCredits(
    credits: number,
    service: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<CreditConsumption> {
    if (!this.authSDK.isAuthenticated()) {
      throw new Error('User must be authenticated to consume credits');
    }

    const sessionToken = this.authSDK.getSessionToken();
    if (!sessionToken) {
      throw new Error('No valid session token');
    }

    const request: CreditConsumptionRequest = {
      credits,
      service,
      description,
      metadata
    };

    const response = await fetch(`${this.apiBase}/api/cross-app/credits/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: sessionToken,
        app_id: this.authSDK['config'].appId,
        ...request
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to consume credits');
    }

    return await response.json();
  }

  /**
   * Purchase credits directly (bypasses dashboard)
   */
  public async purchaseCredits(
    request: CreditPurchaseRequest
  ): Promise<CreditPurchase> {
    if (!this.authSDK.isAuthenticated()) {
      throw new Error('User must be authenticated to purchase credits');
    }

    const sessionToken = this.authSDK.getSessionToken();
    if (!sessionToken) {
      throw new Error('No valid session token');
    }

    const response = await fetch(`${this.apiBase}/api/cross-app/credits/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_token: sessionToken,
        app_id: this.authSDK['config'].appId,
        ...request
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create credit purchase');
    }

    return await response.json();
  }

  /**
   * Get available credit packages
   */
  public async getCreditPackages(): Promise<CreditPackage[]> {
    if (!this.authSDK.isAuthenticated()) {
      throw new Error('User must be authenticated to view credit packages');
    }

    const sessionToken = this.authSDK.getSessionToken();
    if (!sessionToken) {
      throw new Error('No valid session token');
    }

    const response = await fetch(
      `${this.apiBase}/api/cross-app/credits/packages?session_token=${sessionToken}&app_id=${this.authSDK['config'].appId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get credit packages');
    }

    const data = await response.json();
    return data.packages || [];
  }

  /**
   * Get user's active subscriptions
   */
  public async getUserSubscriptions(): Promise<UserSubscription[]> {
    if (!this.authSDK.isAuthenticated()) {
      throw new Error('User must be authenticated to view subscriptions');
    }

    const sessionToken = this.authSDK.getSessionToken();
    if (!sessionToken) {
      throw new Error('No valid session token');
    }

    const response = await fetch(
      `${this.apiBase}/api/cross-app/credits/subscriptions?session_token=${sessionToken}&app_id=${this.authSDK['config'].appId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get user subscriptions');
    }

    const data = await response.json();
    return data.subscriptions || [];
  }

  /**
   * Validate credit requirements for a service
   */
  public async validateCreditRequirements(
    requiredCredits: number,
    service: string
  ): Promise<CreditValidation> {
    try {
      const balance = await this.getCreditBalance(requiredCredits);
      
      return {
        has_sufficient_credits: balance.can_consume,
        required_credits: requiredCredits,
        available_credits: balance.current_credits,
        deficit: balance.can_consume ? 0 : requiredCredits - balance.current_credits
      };
    } catch (error) {
      console.error('Error validating credit requirements:', error);
      return {
        has_sufficient_credits: false,
        required_credits: requiredCredits,
        available_credits: 0,
        deficit: requiredCredits
      };
    }
  }

  /**
   * Get recommended credit package for a specific amount
   */
  public async getRecommendedPackage(targetCredits: number): Promise<CreditPackage | null> {
    try {
      const packages = await this.getCreditPackages();
      
      // Find exact match first
      const exactMatch = packages.find(pkg => pkg.credit_amount === targetCredits);
      if (exactMatch) {
        return exactMatch;
      }
      
      // Find the smallest package that covers the requirement
      const coveringPackages = packages
        .filter(pkg => pkg.credit_amount >= targetCredits)
        .sort((a, b) => a.credit_amount - b.credit_amount);
      
      return coveringPackages[0] || null;
    } catch (error) {
      console.error('Error getting recommended package:', error);
      return null;
    }
  }

  /**
   * Calculate cost per credit for a package
   */
  public calculateCostPerCredit(creditPackage: CreditPackage): number {
    return creditPackage.monthly_price / creditPackage.credit_amount;
  }

  /**
   * Compare credit packages by value
   */
  public comparePackages(packages: CreditPackage[]): CreditPackage[] {
    return packages
      .map(pkg => ({
        ...pkg,
        cost_per_credit: this.calculateCostPerCredit(pkg)
      }))
      .sort((a, b) => a.cost_per_credit - b.cost_per_credit);
  }

  /**
   * Quick credit check for immediate service usage
   */
  public async quickCreditCheck(requiredCredits: number): Promise<{
    canProceed: boolean;
    currentCredits: number;
    deficit: number;
    recommendedPackage?: CreditPackage;
  }> {
    try {
      const balance = await this.getCreditBalance(requiredCredits);
      
      if (balance.can_consume) {
        return {
          canProceed: true,
          currentCredits: balance.current_credits,
          deficit: 0
        };
      }
      
      // Get recommended package for quick purchase
      const recommendedPackage = await this.getRecommendedPackage(requiredCredits);
      
      return {
        canProceed: false,
        currentCredits: balance.current_credits,
        deficit: requiredCredits - balance.current_credits,
        recommendedPackage: recommendedPackage || undefined
      };
    } catch (error) {
      console.error('Quick credit check failed:', error);
      return {
        canProceed: false,
        currentCredits: 0,
        deficit: requiredCredits
      };
    }
  }

  /**
   * Get credit usage statistics for the current app
   */
  public async getAppCreditUsage(): Promise<{
    credits_consumed: number;
    credits_purchased: number;
    last_consumption?: string;
    last_purchase?: string;
  }> {
    if (!this.authSDK.isAuthenticated()) {
      throw new Error('User must be authenticated to view credit usage');
    }

    const sessionToken = this.authSDK.getSessionToken();
    if (!sessionToken) {
      throw new Error('No valid session token');
    }

    const response = await fetch(`${this.apiBase}/api/cross-app/user-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
      },
      // Note: This endpoint might need to be updated to include credit usage
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get credit usage');
    }

    const userInfo = await response.json();
    
    // For now, return basic info - this can be enhanced when the API supports it
    return {
      credits_consumed: 0, // TODO: Get from user info when available
      credits_purchased: 0,
      last_consumption: undefined,
      last_purchase: undefined
    };
  }
}
