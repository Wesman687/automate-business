/**
 * Frontend service for Stripe API interactions
 */

import {
  CheckoutSessionCreate,
  CheckoutSessionResponse,
  SubscriptionCreate,
  SubscriptionResponse,
  CustomerPortalResponse,
  StripeProductWithPrices,
  ApiResponse,
  StripeError
} from '../types/stripe';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

class StripeService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create a Stripe Checkout session
   */
  async createCheckoutSession(
    checkoutData: CheckoutSessionCreate
  ): Promise<ApiResponse<CheckoutSessionResponse>> {
    return this.makeRequest<CheckoutSessionResponse>('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    subscriptionData: SubscriptionCreate
  ): Promise<ApiResponse<SubscriptionResponse>> {
    return this.makeRequest<SubscriptionResponse>('/api/stripe/create-subscription', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/stripe/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get customer portal URL
   */
  async getCustomerPortalUrl(): Promise<ApiResponse<CustomerPortalResponse>> {
    return this.makeRequest<CustomerPortalResponse>('/api/stripe/customer-portal');
  }

  /**
   * Get available products and pricing
   */
  async getProducts(): Promise<ApiResponse<{ products: StripeProductWithPrices[] }>> {
    return this.makeRequest<{ products: StripeProductWithPrices[] }>('/api/stripe/products');
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId: number): Promise<ApiResponse<{ subscriptions: any[] }>> {
    return this.makeRequest<{ subscriptions: any[] }>(`/api/stripe/subscriptions/${userId}`);
  }

  /**
   * Create a payment intent for direct payments
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    description?: string,
    metadata?: Record<string, string>
  ): Promise<ApiResponse<{ clientSecret: string }>> {
    return this.makeRequest<{ clientSecret: string }>('/api/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency,
        description,
        metadata,
      }),
    });
  }

  /**
   * Redirect to Stripe Checkout
   */
  redirectToCheckout(sessionUrl: string): void {
    window.location.href = sessionUrl;
  }

  /**
   * Open customer portal in new window
   */
  openCustomerPortal(portalUrl: string): void {
    window.open(portalUrl, '_blank');
  }

  /**
   * Format amount for display (convert from cents)
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  /**
   * Format amount for API (convert to cents)
   */
  formatAmountForAPI(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Validate card number (basic Luhn algorithm check)
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Validate expiry date
   */
  validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    if (expMonth < 1 || expMonth > 12) return false;
    
    return true;
  }

  /**
   * Validate CVC
   */
  validateCVC(cvc: string): boolean {
    return /^\d{3,4}$/.test(cvc);
  }

  /**
   * Get card brand from number
   */
  getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    if (/^35/.test(cleaned)) return 'jcb';
    if (/^2/.test(cleaned)) return 'mastercard'; // Mastercard 2-series
    
    return 'unknown';
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return cardNumber;
    
    const last4 = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return masked + last4;
  }

  /**
   * Format expiry date for display
   */
  formatExpiryDate(month: string, year: string): string {
    if (!month || !year) return '';
    return `${month}/${year.slice(-2)}`;
  }

  /**
   * Parse expiry date from MM/YY format
   */
  parseExpiryDate(expiryString: string): { month: string; year: string } {
    const [month, year] = expiryString.split('/');
    return {
      month: month || '',
      year: year ? `20${year}` : '',
    };
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;
