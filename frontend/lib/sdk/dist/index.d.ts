import { CrossAppAuthSDK } from './core/CrossAppAuthSDK';
import { CreditSDK } from './core/CreditSDK';
export { CrossAppAuthSDK } from './core/CrossAppAuthSDK';
export { CreditSDK } from './core/CreditSDK';
export * from './types/auth';
export * from './types/credit';
export declare function createCrossAppSDK(config: any): {
    auth: CrossAppAuthSDK;
    credits: CreditSDK;
    isAuthenticated: () => boolean;
    getCurrentUser: () => import("./types/auth").User | null;
    login: (options: any) => Promise<import("./types/auth").User>;
    logout: () => Promise<void>;
    getCreditBalance: (required?: number) => Promise<import("./types/credit").CreditBalance>;
    hasSufficientCredits: (required: number) => Promise<boolean>;
    consumeCredits: (credits: number, service: string, description?: string) => Promise<import("./types/credit").CreditConsumption>;
    purchaseCredits: (request: any) => Promise<import("./types/credit").CreditPurchase>;
};
export default createCrossAppSDK;
export declare const SDK_VERSION = "1.0.0";
export declare const SDK_NAME = "Cross-App Authentication & Credit SDK";
export declare const QUICK_START_EXAMPLE = "\n// Quick start example:\nimport { createCrossAppSDK } from '@streamline/cross-app-sdk';\n\nconst sdk = createCrossAppSDK({\n  appId: 'my-video-app',\n  domain: 'stream-lineai.com',\n  debug: true\n});\n\n// Check authentication\nif (!sdk.isAuthenticated()) {\n  // Login user\n  const user = await sdk.login({\n    email: 'user@example.com',\n    password: 'password123'\n  });\n}\n\n// Use credits\nconst hasCredits = await sdk.hasSufficientCredits(10);\nif (hasCredits) {\n  await sdk.consumeCredits(10, 'video-generation');\n} else {\n  // Purchase credits\n  await sdk.purchaseCredits({\n    credits: 50,\n    returnUrl: 'https://myapp.com/credits-purchased'\n  });\n}\n";
//# sourceMappingURL=index.d.ts.map