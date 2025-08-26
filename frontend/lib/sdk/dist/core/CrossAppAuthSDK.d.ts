import { SDKConfig, User, CrossAppSession, AuthState, LoginOptions, TokenValidationResult, AuthEventListener } from '../types/auth';
/**
 * Cross-App Authentication SDK
 *
 * Provides seamless authentication across different applications using
 * the Stream-line AI Automate platform's unified authentication system.
 */
export declare class CrossAppAuthSDK {
    private config;
    private state;
    private eventListeners;
    private sessionToken;
    private refreshTimer;
    private apiBase;
    constructor(config: SDKConfig);
    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get current user information
     */
    getCurrentUser(): User | null;
    /**
     * Get current session information
     */
    getCurrentSession(): CrossAppSession | null;
    /**
     * Get current authentication state
     */
    getAuthState(): AuthState;
    /**
     * Login user with email and password
     */
    login(options: LoginOptions): Promise<User>;
    /**
     * Logout current user
     */
    logout(): Promise<void>;
    /**
     * Refresh authentication token
     */
    refreshToken(): Promise<string>;
    /**
     * Validate current session token
     */
    validateToken(): Promise<TokenValidationResult>;
    /**
     * Check if user has a specific permission
     */
    hasPermission(permission: string): boolean;
    /**
     * Listen for authentication events
     */
    onAuthChange(callback: AuthEventListener): () => void;
    /**
     * Get session token for API calls
     */
    getSessionToken(): string | null;
    /**
     * Check if session is about to expire
     */
    isSessionExpiringSoon(thresholdMinutes?: number): boolean;
    private setState;
    private emitEvent;
    private clearSession;
    private saveToStorage;
    private initializeFromStorage;
    private setupTokenRefresh;
}
//# sourceMappingURL=CrossAppAuthSDK.d.ts.map