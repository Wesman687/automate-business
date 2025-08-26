import { 
  SDKConfig, 
  User, 
  CrossAppSession, 
  AuthState, 
  LoginOptions, 
  TokenValidationResult, 
  TokenRefreshResult,
  AuthEvent,
  AuthEventListener,
  CrossAppAuthError
} from '../types/auth';

/**
 * Cross-App Authentication SDK
 * 
 * Provides seamless authentication across different applications using
 * the Stream-line AI Automate platform's unified authentication system.
 */
export class CrossAppAuthSDK {
  private config: SDKConfig;
  private state: AuthState;
  private eventListeners: AuthEventListener[] = [];
  private sessionToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private apiBase: string;

  constructor(config: SDKConfig) {
    this.config = config;
    this.apiBase = config.apiBase || `https://api.${config.domain}`;
    
    this.state = {
      isAuthenticated: false,
      user: null,
      session: null,
      loading: false,
      error: null
    };

    // Initialize from localStorage if available
    this.initializeFromStorage();
    
    // Set up automatic token refresh
    this.setupTokenRefresh();
    
    if (config.debug) {
      console.log('🔐 CrossAppAuthSDK initialized:', config);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.sessionToken;
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Get current session information
   */
  public getCurrentSession(): CrossAppSession | null {
    return this.state.session;
  }

  /**
   * Get current authentication state
   */
  public getAuthState(): AuthState {
    return { ...this.state };
  }

  /**
   * Login user with email and password
   */
  public async login(options: LoginOptions): Promise<User> {
    try {
      this.setState({ loading: true, error: null });

      const response = await fetch(`${this.apiBase}/api/cross-app/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          email: options.email,
          password: options.password,
          app_user_id: options.appUserId,
          app_metadata: options.appMetadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new CrossAppAuthError(
          errorData.detail || 'Authentication failed',
          'AUTH_FAILED',
          errorData
        );
      }

      const sessionData: CrossAppSession = await response.json();
      
      // Store session token
      this.sessionToken = sessionData.session_token;
      this.saveToStorage(sessionData);
      
      // Update state
      this.setState({
        isAuthenticated: true,
        user: sessionData.user,
        session: sessionData,
        loading: false,
        error: null
      });

      // Emit success event
      this.emitEvent({
        type: 'AUTH_SUCCESS',
        data: sessionData,
        timestamp: Date.now()
      });

      // Set up token refresh
      this.setupTokenRefresh();

      if (this.config.debug) {
        console.log('✅ Login successful:', sessionData.user.email);
      }

      return sessionData.user;

    } catch (error) {
      const authError = error instanceof CrossAppAuthError ? error : new CrossAppAuthError(
        error instanceof Error ? error.message : 'Authentication failed',
        'AUTH_ERROR',
        error
      );

      this.setState({
        loading: false,
        error: authError.message
      });

      // Emit failure event
      this.emitEvent({
        type: 'AUTH_FAILURE',
        data: { error: authError },
        timestamp: Date.now()
      });

      throw authError;
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    try {
      if (this.sessionToken) {
        // Call logout endpoint
        await fetch(`${this.apiBase}/api/cross-app/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_token: this.sessionToken,
            app_id: this.config.appId
          })
        });
      }
    } catch (error) {
      // Log error but continue with local cleanup
      if (this.config.debug) {
        console.warn('Warning: Logout API call failed:', error);
      }
    } finally {
      // Clear local state
      this.clearSession();
      
      // Emit logout event
      this.emitEvent({
        type: 'AUTH_LOGOUT',
        data: null,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(): Promise<string> {
    if (!this.sessionToken) {
      throw new CrossAppAuthError('No session token to refresh', 'NO_SESSION');
    }

    try {
      const response = await fetch(`${this.apiBase}/api/cross-app/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: this.sessionToken,
          app_id: this.config.appId
        })
      });

      if (!response.ok) {
        throw new CrossAppAuthError('Token refresh failed', 'REFRESH_FAILED');
      }

      const refreshData: TokenRefreshResult = await response.json();
      
      // Update session token
      this.sessionToken = refreshData.newSessionToken;
      
      // Update session with new expiry
      if (this.state.session) {
        this.state.session.session_token = refreshData.newSessionToken;
        this.state.session.expires_at = refreshData.expiresAt;
        this.state.session.permissions = refreshData.permissions;
      }
      
      // Save to storage
      this.saveToStorage(this.state.session!);
      
      // Emit refresh event
      this.emitEvent({
        type: 'TOKEN_REFRESH',
        data: refreshData,
        timestamp: Date.now()
      });

      if (this.config.debug) {
        console.log('🔄 Token refreshed successfully');
      }

      return refreshData.newSessionToken;

    } catch (error) {
      // If refresh fails, clear session
      this.clearSession();
      throw error;
    }
  }

  /**
   * Validate current session token
   */
  public async validateToken(): Promise<TokenValidationResult> {
    if (!this.sessionToken) {
      return { valid: false, error: 'No session token' };
    }

    try {
      const response = await fetch(`${this.apiBase}/api/cross-app/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: this.sessionToken,
          app_id: this.config.appId
        })
      });

      if (!response.ok) {
        return { valid: false, error: 'Token validation failed' };
      }

      const validationData = await response.json();
      
      if (validationData.valid) {
        // Update user data if validation successful
        this.setState({
          user: validationData.user,
          session: {
            ...this.state.session!,
            user: validationData.user,
            permissions: validationData.permissions,
            expires_at: validationData.expires_at
          }
        });
      } else {
        // Clear session if validation failed
        this.clearSession();
      }

      return validationData;

    } catch (error) {
      if (this.config.debug) {
        console.error('Token validation error:', error);
      }
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Check if user has a specific permission
   */
  public hasPermission(permission: string): boolean {
    return this.state.user?.permissions.includes(permission as any) || false;
  }

  /**
   * Listen for authentication events
   */
  public onAuthChange(callback: AuthEventListener): () => void {
    this.eventListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get session token for API calls
   */
  public getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Check if session is about to expire
   */
  public isSessionExpiringSoon(thresholdMinutes: number = 5): boolean {
    if (!this.state.session) return false;
    
    const expiryTime = new Date(this.state.session.expires_at).getTime();
    const thresholdTime = Date.now() + (thresholdMinutes * 60 * 1000);
    
    return expiryTime <= thresholdTime;
  }

  // Private methods

  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
  }

  private emitEvent(event: AuthEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        if (this.config.debug) {
          console.error('Error in auth event listener:', error);
        }
      }
    });
  }

  private clearSession(): void {
    this.sessionToken = null;
    this.setState({
      isAuthenticated: false,
      user: null,
      session: null,
      error: null
    });
    
    // Clear storage
    localStorage.removeItem(`cross_app_auth_${this.config.appId}`);
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private saveToStorage(session: CrossAppSession): void {
    try {
      localStorage.setItem(
        `cross_app_auth_${this.config.appId}`,
        JSON.stringify(session)
      );
    } catch (error) {
      if (this.config.debug) {
        console.warn('Failed to save session to localStorage:', error);
      }
    }
  }

  private initializeFromStorage(): void {
    try {
      const stored = localStorage.getItem(`cross_app_auth_${this.config.appId}`);
      if (stored) {
        const session: CrossAppSession = JSON.parse(stored);
        
        // Check if session is still valid
        const expiryTime = new Date(session.expires_at).getTime();
        if (expiryTime > Date.now()) {
          this.sessionToken = session.session_token;
          this.setState({
            isAuthenticated: true,
            user: session.user,
            session: session
          });
        } else {
          // Clear expired session
          localStorage.removeItem(`cross_app_auth_${this.config.appId}`);
        }
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn('Failed to restore session from localStorage:', error);
      }
    }
  }

  private setupTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (this.state.session) {
      const expiryTime = new Date(this.state.session.expires_at).getTime();
      const refreshTime = expiryTime - (5 * 60 * 1000); // Refresh 5 minutes before expiry
      const delay = Math.max(0, refreshTime - Date.now());

      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(() => {
          // If refresh fails, logout
          this.logout();
        });
      }, delay);
    }
  }
}
