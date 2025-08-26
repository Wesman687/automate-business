export declare enum AppPermission {
    READ_USER_INFO = "read_user_info",
    READ_CREDITS = "read_credits",
    PURCHASE_CREDITS = "purchase_credits",
    CONSUME_CREDITS = "consume_credits",
    MANAGE_SUBSCRIPTIONS = "manage_subscriptions",
    READ_ANALYTICS = "read_analytics"
}
export declare enum AppStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING_APPROVAL = "pending_approval"
}
export interface User {
    id: number;
    email: string;
    name?: string;
    user_type: string;
    is_admin: boolean;
    is_customer: boolean;
    credits: number;
    permissions: AppPermission[];
}
export interface AppInfo {
    app_id: string;
    app_name: string;
    app_domain: string;
    description?: string;
    logo_url?: string;
    primary_color?: string;
}
export interface CrossAppSession {
    session_token: string;
    user: User;
    app_info: AppInfo;
    permissions: AppPermission[];
    expires_at: string;
}
export interface SDKConfig {
    appId: string;
    domain: string;
    redirectUrl?: string;
    apiBase?: string;
    debug?: boolean;
}
export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    session: CrossAppSession | null;
    loading: boolean;
    error: string | null;
}
export interface LoginOptions {
    email: string;
    password: string;
    appUserId?: string;
    appMetadata?: Record<string, any>;
}
export interface TokenValidationResult {
    valid: boolean;
    user?: User;
    permissions?: AppPermission[];
    expiresAt?: string;
    error?: string;
}
export interface TokenRefreshResult {
    newSessionToken: string;
    expiresAt: string;
    permissions: AppPermission[];
}
export interface AuthEvent {
    type: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'AUTH_LOGOUT' | 'TOKEN_REFRESH' | 'PERMISSION_UPDATE';
    data: any;
    timestamp: number;
}
export interface AuthEventListener {
    (event: AuthEvent): void;
}
export interface SDKError extends Error {
    code: string;
    details?: any;
    timestamp: number;
}
export declare class CrossAppAuthError extends Error implements SDKError {
    code: string;
    details?: any;
    timestamp: number;
    constructor(message: string, code: string, details?: any);
}
//# sourceMappingURL=auth.d.ts.map