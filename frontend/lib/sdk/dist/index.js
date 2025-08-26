"use strict";
// Cross-App Authentication & Credit SDK
// Main export file for easy integration
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUICK_START_EXAMPLE = exports.SDK_NAME = exports.SDK_VERSION = exports.CreditSDK = exports.CrossAppAuthSDK = void 0;
exports.createCrossAppSDK = createCrossAppSDK;
const CrossAppAuthSDK_1 = require("./core/CrossAppAuthSDK");
const CreditSDK_1 = require("./core/CreditSDK");
var CrossAppAuthSDK_2 = require("./core/CrossAppAuthSDK");
Object.defineProperty(exports, "CrossAppAuthSDK", { enumerable: true, get: function () { return CrossAppAuthSDK_2.CrossAppAuthSDK; } });
var CreditSDK_2 = require("./core/CreditSDK");
Object.defineProperty(exports, "CreditSDK", { enumerable: true, get: function () { return CreditSDK_2.CreditSDK; } });
// Export all types
__exportStar(require("./types/auth"), exports);
__exportStar(require("./types/credit"), exports);
// SDK Factory function for easy initialization
function createCrossAppSDK(config) {
    const authSDK = new CrossAppAuthSDK_1.CrossAppAuthSDK(config);
    const creditSDK = new CreditSDK_1.CreditSDK(authSDK);
    return {
        auth: authSDK,
        credits: creditSDK,
        // Convenience methods
        isAuthenticated: () => authSDK.isAuthenticated(),
        getCurrentUser: () => authSDK.getCurrentUser(),
        login: (options) => authSDK.login(options),
        logout: () => authSDK.logout(),
        // Credit convenience methods
        getCreditBalance: (required) => creditSDK.getCreditBalance(required),
        hasSufficientCredits: (required) => creditSDK.hasSufficientCredits(required),
        consumeCredits: (credits, service, description) => creditSDK.consumeCredits(credits, service, description),
        purchaseCredits: (request) => creditSDK.purchaseCredits(request)
    };
}
// Default export for backward compatibility
exports.default = createCrossAppSDK;
// Version information
exports.SDK_VERSION = '1.0.0';
exports.SDK_NAME = 'Cross-App Authentication & Credit SDK';
// Quick start example
exports.QUICK_START_EXAMPLE = `
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
//# sourceMappingURL=index.js.map