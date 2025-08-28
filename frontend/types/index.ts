/**
 * Frontend Types Index - Single import point for all TypeScript interfaces
 * 
 * This file provides a single import point for all frontend types,
 * making it easy to import the types you need in your components and services.
 * 
 * ALL TYPES ARE NOW CENTRALIZED IN types.ts - NO MORE SCATTERED DEFINITIONS!
 * 
 * Usage:
 * import { User, Job, CreditTransaction } from '@/types';
 * import type { LoginRequest, ApiResponse } from '@/types';
 */

// Re-export everything from the unified types file
export * from './types';
