import { api } from '../lib/https';
import {
  CreditBalance,
  CreditTransactionHistory,
  CreditTransaction,
  CreditPurchaseRequest,
  CreditPurchaseValidation,
  UserCreditSummary,
  CreditRate,
  CreditPackageResponse
} from '@/types';

export class CreditsService {
  private baseUrl = '/api/credits';

  /**
   * Get current credit balance for the authenticated user
   */
  async getBalance(): Promise<CreditBalance> {
    const response = await apiClient.get<CreditBalance>(`${this.baseUrl}/balance`);
    return response.data;
  }

  /**
   * Get comprehensive credit summary for the authenticated user
   */
  async getSummary(): Promise<UserCreditSummary> {
    const response = await apiClient.get<UserCreditSummary>(`${this.baseUrl}/summary`);
    return response.data;
  }

  /**
   * Get paginated transaction history for the authenticated user
   */
  async getTransactionHistory(
    page: number = 1,
    pageSize: number = 50,
    transactionType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<CreditTransactionHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (transactionType) params.append('transaction_type', transactionType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get<CreditTransactionHistory>(
      `${this.baseUrl}/transactions?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Validate if user can purchase credits and get estimated cost
   */
  async validatePurchase(amount: number): Promise<CreditPurchaseValidation> {
    const response = await apiClient.post<CreditPurchaseValidation>(
      `${this.baseUrl}/purchase/validate`,
      null,
      { params: { amount } }
    );
    return response.data;
  }

  /**
   * Purchase credits (requires successful Stripe payment)
   */
  async purchaseCredits(
    amount: number,
    description: string,
    stripePaymentIntentId?: string
  ): Promise<CreditTransaction> {
    const params = new URLSearchParams({
      amount: amount.toString(),
      description
    });

    if (stripePaymentIntentId) {
      params.append('stripe_payment_intent_id', stripePaymentIntentId);
    }

    const response = await apiClient.post<CreditTransaction>(
      `${this.baseUrl}/purchase?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get current credit rate (price per credit)
   */
  async getCreditRate(): Promise<CreditRate> {
    const response = await apiClient.get<CreditRate>(`${this.baseUrl}/rate`);
    return response.data;
  }

  /**
   * Get available credit subscription packages
   */
  async getCreditPackages(): Promise<CreditPackageResponse> {
    const response = await apiClient.get<CreditPackageResponse>(`${this.baseUrl}/packages`);
    return response.data;
  }
}

// Admin Credits Service
export class AdminCreditsService {
  private baseUrl = '/api/admin/credits';

  /**
   * Add credits to a user account
   */
  async addCredits(
    userId: number,
    amount: number,
    reason: string,
    adminNotes?: string
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/add`, {
      user_id: userId,
      amount,
      reason,
      admin_notes: adminNotes
    });
    return response.data;
  }

  /**
   * Remove credits from a user account
   */
  async removeCredits(
    userId: number,
    amount: number,
    reason: string,
    adminNotes?: string
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/remove`, {
      user_id: userId,
      amount,
      reason,
      admin_notes: adminNotes
    });
    return response.data;
  }

  /**
   * Pause credit service for a user
   */
  async pauseCreditService(
    userId: number,
    reason: string,
    adminNotes?: string
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/pause`, {
      user_id: userId,
      reason,
      admin_notes: adminNotes
    });
    return response.data;
  }

  /**
   * Resume credit service for a user
   */
  async resumeCreditService(
    userId: number,
    adminNotes?: string
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/resume`, {
      user_id: userId,
      admin_notes: adminNotes
    });
    return response.data;
  }

  /**
   * Get credit balance for a specific user
   */
  async getUserBalance(userId: number): Promise<CreditBalance> {
    const response = await apiClient.get<CreditBalance>(`${this.baseUrl}/user/${userId}/balance`);
    return response.data;
  }

  /**
   * Get transaction history for a specific user
   */
  async getUserTransactions(
    userId: number,
    page: number = 1,
    pageSize: number = 50,
    transactionType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<CreditTransactionHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (transactionType) params.append('transaction_type', transactionType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get<CreditTransactionHistory>(
      `${this.baseUrl}/user/${userId}/transactions?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get comprehensive credit summary for a specific user
   */
  async getUserSummary(userId: number): Promise<UserCreditSummary> {
    const response = await apiClient.get<UserCreditSummary>(`${this.baseUrl}/user/${userId}/summary`);
    return response.data;
  }

  /**
   * Get system-wide credit summary
   */
  async getSystemSummary(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/system/summary`);
    return response.data;
  }

  /**
   * Get paginated list of users with their credit status
   */
  async getUsersCreditStatus(
    page: number = 1,
    pageSize: number = 50,
    statusFilter?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (statusFilter) params.append('status_filter', statusFilter);

    const response = await apiClient.get(`${this.baseUrl}/users/status?${params.toString()}`);
    return response.data;
  }
}

// Disputes Service
export class DisputesService {
  private baseUrl = '/api/disputes';

  /**
   * Submit a new credit dispute
   */
  async submitDispute(disputeData: {
    user_id: number;
    transaction_id?: string;
    reason: string;
    description: string;
    requested_refund?: number;
  }): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/submit`, disputeData);
    return response.data;
  }

  /**
   * Get disputes submitted by the current user
   */
  async getMyDisputes(status?: string): Promise<any[]> {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get<any[]>(`${this.baseUrl}/my-disputes${params}`);
    return response.data;
  }

  /**
   * Get details of a specific dispute
   */
  async getDispute(disputeId: number): Promise<any> {
    const response = await apiClient.get<any>(`${this.baseUrl}/${disputeId}`);
    return response.data;
  }

  /**
   * Admin: Get dispute queue
   */
  async getDisputeQueue(
    status?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (status) params.append('status', status);

    const response = await apiClient.get(`${this.baseUrl}/admin/queue?${params.toString()}`);
    return response.data;
  }

  /**
   * Admin: Review and update dispute status
   */
  async reviewDispute(
    disputeId: number,
    updateData: {
      status?: string;
      resolution?: string;
      resolved_amount?: number;
      admin_notes?: string;
      resolution_notes?: string;
    }
  ): Promise<any> {
    const response = await apiClient.put(`${this.baseUrl}/admin/${disputeId}/review`, updateData);
    return response.data;
  }

  /**
   * Admin: Resolve a dispute
   */
  async resolveDispute(
    disputeId: number,
    resolutionData: {
      resolution: string;
      resolved_amount?: number;
      resolution_notes: string;
      admin_notes?: string;
    }
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/admin/${disputeId}/resolve`, resolutionData);
    return response.data;
  }

  /**
   * Admin: Get dispute statistics
   */
  async getDisputeStatistics(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/admin/statistics`);
    return response.data;
  }
}

// Export service instances
export const creditsService = new CreditsService();
export const adminCreditsService = new AdminCreditsService();
export const disputesService = new DisputesService();
