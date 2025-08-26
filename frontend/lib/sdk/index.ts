// Cross-App Authentication & Credit SDK
// Main export file for easy integration

import { CrossAppAuthSDK } from './core/CrossAppAuthSDK';
import { CreditSDK } from './core/CreditSDK';

export { CrossAppAuthSDK } from './core/CrossAppAuthSDK';
export { CreditSDK } from './core/CreditSDK';

// Export all types
export * from './types/auth';
export * from './types/credit';

// SDK Factory function for easy initialization
export function createCrossAppSDK(config: any) {
  const authSDK = new CrossAppAuthSDK(config);
  const creditSDK = new CreditSDK(authSDK);
  
  return {
    auth: authSDK,
    credits: creditSDK,
    
    // Convenience methods
    isAuthenticated: () => authSDK.isAuthenticated(),
    getCurrentUser: () => authSDK.getCurrentUser(),
    login: (options: any) => authSDK.login(options),
    logout: () => authSDK.logout(),
    
    // Credit convenience methods
    getCreditBalance: (required?: number) => creditSDK.getCreditBalance(required),
    hasSufficientCredits: (required: number) => creditSDK.hasSufficientCredits(required),
    consumeCredits: (credits: number, service: string, description?: string) => 
      creditSDK.consumeCredits(credits, service, description),
    purchaseCredits: (request: any) => creditSDK.purchaseCredits(request)
  };
}

// Default export for backward compatibility
export default createCrossAppSDK;

// Version information
export const SDK_VERSION = '1.0.0';
export const SDK_NAME = 'Cross-App Authentication & Credit SDK';

// Quick start example
export const QUICK_START_EXAMPLE = `
// Quick start example:
import { createCrossAppSDK } from '@streamline/cross-app-sdk';

const sdk = createCrossAppSDK({
  appId: 'my-video-app',
  domain: 'stream-lineai.com',
  debug: true
});

// Check authentication
if (!sdk.isAuthenticated()) {
  // Login user
  const user = await sdk.login({
    email: 'user@example.com',
    password: 'password123'
  });
}

// Use credits
const hasCredits = await sdk.hasSufficientCredits(10);
if (hasCredits) {
  await sdk.consumeCredits(10, 'video-generation');
} else {
  // Purchase credits
  await sdk.purchaseCredits({
    credits: 50,
    returnUrl: 'https://myapp.com/credits-purchased'
  });
}
`;
