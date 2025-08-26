import { useState, useEffect, useCallback } from 'react';
import { creditsService } from '../services/credits';
import {
  CreditBalance,
  CreditTransactionHistory,
  UserCreditSummary,
  CreditPurchaseValidation,
  CreditTransaction
} from '../types/credits';

interface UseCreditsReturn {
  // State
  balance: CreditBalance | null;
  summary: UserCreditSummary | null;
  transactionHistory: CreditTransactionHistory | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  refreshTransactionHistory: (page?: number, pageSize?: number) => Promise<void>;
  validatePurchase: (amount: number) => Promise<CreditPurchaseValidation | null>;
  purchaseCredits: (amount: number, description: string, stripePaymentIntentId?: string) => Promise<CreditTransaction | null>;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}

export const useCredits = (): UseCreditsReturn => {
  // State
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [summary, setSummary] = useState<UserCreditSummary | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<CreditTransactionHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await creditsService.getBalance();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit balance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh summary
  const refreshSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await creditsService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit summary');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh transaction history
  const refreshTransactionHistory = useCallback(async (page: number = currentPage, size: number = pageSize) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await creditsService.getTransactionHistory(page, size);
      setTransactionHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // Validate purchase
  const validatePurchase = useCallback(async (amount: number): Promise<CreditPurchaseValidation | null> => {
    try {
      setError(null);
      const data = await creditsService.validatePurchase(amount);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate purchase');
      return null;
    }
  }, []);

  // Purchase credits
  const purchaseCredits = useCallback(async (
    amount: number, 
    description: string, 
    stripePaymentIntentId?: string
  ): Promise<CreditTransaction | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await creditsService.purchaseCredits(amount, description, stripePaymentIntentId);
      
      // Refresh balance and summary after successful purchase
      await Promise.all([refreshBalance(), refreshSummary()]);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase credits');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBalance, refreshSummary]);

  // Load initial data
  useEffect(() => {
    refreshBalance();
    refreshSummary();
  }, [refreshBalance, refreshSummary]);

  // Load transaction history when page or page size changes
  useEffect(() => {
    refreshTransactionHistory();
  }, [currentPage, pageSize, refreshTransactionHistory]);

  return {
    // State
    balance,
    summary,
    transactionHistory,
    isLoading,
    error,
    
    // Actions
    refreshBalance,
    refreshSummary,
    refreshTransactionHistory,
    validatePurchase,
    purchaseCredits,
    
    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize
  };
};

// Hook for admin credit operations
interface UseAdminCreditsReturn {
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addCredits: (userId: number, amount: number, reason: string, adminNotes?: string) => Promise<any>;
  removeCredits: (userId: number, amount: number, reason: string, adminNotes?: string) => Promise<any>;
  pauseCreditService: (userId: number, reason: string, adminNotes?: string) => Promise<any>;
  resumeCreditService: (userId: number, adminNotes?: string) => Promise<any>;
  getUserBalance: (userId: number) => Promise<CreditBalance | null>;
  getUserSummary: (userId: number) => Promise<UserCreditSummary | null>;
  getSystemSummary: () => Promise<any>;
}

export const useAdminCredits = (): UseAdminCreditsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCredits = useCallback(async (
    userId: number, 
    amount: number, 
    reason: string, 
    adminNotes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.addCredits(userId, amount, reason, adminNotes);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credits');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeCredits = useCallback(async (
    userId: number, 
    amount: number, 
    reason: string, 
    adminNotes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.removeCredits(userId, amount, reason, adminNotes);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove credits');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseCreditService = useCallback(async (
    userId: number, 
    reason: string, 
    adminNotes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.pauseCreditService(userId, reason, adminNotes);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause credit service');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resumeCreditService = useCallback(async (
    userId: number, 
    adminNotes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.resumeCreditService(userId, adminNotes);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume credit service');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserBalance = useCallback(async (userId: number): Promise<CreditBalance | null> => {
    try {
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.getUserBalance(userId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user balance');
      return null;
    }
  }, []);

  const getUserSummary = useCallback(async (userId: number): Promise<UserCreditSummary | null> => {
    try {
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.getUserSummary(userId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user summary');
      return null;
    }
  }, []);

  const getSystemSummary = useCallback(async () => {
    try {
      setError(null);
      const { adminCreditsService } = await import('../services/credits');
      const result = await adminCreditsService.getSystemSummary();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get system summary');
      throw err;
    }
  }, []);

  return {
    isLoading,
    error,
    addCredits,
    removeCredits,
    pauseCreditService,
    resumeCreditService,
    getUserBalance,
    getUserSummary,
    getSystemSummary
  };
};
