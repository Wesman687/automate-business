import { api } from '@/lib/https';
import {
  User,
  UserListResponse,
  UserCreate,
  UserUpdate,
  PasswordUpdate,
  UserFilter,
  UserStats,
  BulkUserUpdate,
  BulkUserStatusUpdate,
  ApiResponse,
  PaginatedResponse
} from '@/types';

export class UserService {
  private baseUrl = '/api/users';

  /**
   * Get a specific user by ID
   */
  async getUser(userId: number): Promise<User> {
    const response = await api.get(`${this.baseUrl}/${userId}`);
    return response.data;
  }

  /**
   * Get all users with filtering and pagination (admin only)
   */
  async getUsers(params: {
    skip?: number;
    limit?: number;
    user_type?: string;
    status?: string;
    search?: string;
  } = {}): Promise<UserListResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.user_type) queryParams.append('user_type', params.user_type);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<UserStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Create a new user
   */
  async createUser(userData: UserCreate): Promise<User> {
    const response = await api.post(`${this.baseUrl}`, userData);
    return response.data;
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    const response = await api.put(`${this.baseUrl}/${userId}`, userData);
    return response.data;
  }

  /**
   * Update user password
   */
  async updatePassword(userId: number, passwordData: PasswordUpdate): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${userId}/password`, passwordData);
    return response.data;
  }

  /**
   * Bulk update users (admin only)
   */
  async bulkUpdateUsers(bulkUpdate: BulkUserUpdate): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-update`, bulkUpdate);
    return response.data;
  }

  /**
   * Bulk update user status (admin only)
   */
  async bulkUpdateUserStatus(bulkStatusUpdate: BulkUserStatusUpdate): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-status-update`, bulkStatusUpdate);
    return response.data;
  }

  /**
   * Delete user (soft delete, admin only)
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${userId}`);
    return response.data;
  }

  /**
   * Update user credits (admin only)
   */
  async updateUserCredits(
    userId: number, 
    creditChange: number, 
    reason?: string
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${userId}/credits`, {
      credit_change: creditChange,
      reason
    });
    return response.data;
  }

  /**
   * Search users with advanced filtering
   */
  async searchUsers(filters: UserFilter, options: {
    skip?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<UserListResponse[]> {
    const queryParams = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    // Add pagination and sorting
    if (options.skip !== undefined) queryParams.append('skip', options.skip.toString());
    if (options.limit !== undefined) queryParams.append('limit', options.limit.toString());
    if (options.sortBy) queryParams.append('sort_by', options.sortBy);
    if (options.sortOrder) queryParams.append('sort_order', options.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get users by type (customers or admins)
   */
  async getUsersByType(userType: 'customer' | 'admin', limit: number = 100): Promise<UserListResponse[]> {
    return this.getUsers({ user_type: userType, limit });
  }

  /**
   * Get users by status
   */
  async getUsersByStatus(status: string, limit: number = 100): Promise<UserListResponse[]> {
    return this.getUsers({ status, limit });
  }

  /**
   * Get users with credits above a certain amount
   */
  async getUsersWithCredits(minCredits: number = 1, limit: number = 100): Promise<UserListResponse[]> {
    // This would need backend support for credit filtering
    const allUsers = await this.getUsers({ limit: 1000 });
    return allUsers.filter(user => user.credits >= minCredits).slice(0, limit);
  }

  /**
   * Get recent users (created within specified days)
   */
  async getRecentUsers(days: number = 30, limit: number = 100): Promise<UserListResponse[]> {
    const allUsers = await this.getUsers({ limit: 1000 });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return allUsers
      .filter(user => user.created_at && new Date(user.created_at) >= cutoffDate)
      .slice(0, limit);
  }

  /**
   * Export users to CSV (admin only)
   */
  async exportUsers(filters?: UserFilter): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${this.baseUrl}/export?${queryParams.toString()}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  }

  /**
   * Import users from CSV (admin only)
   */
  async importUsers(file: File, options: {
    skip_duplicates?: boolean;
    update_existing?: boolean;
    validate_data?: boolean;
  } = {}): Promise<{ message: string; imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  /**
   * Get user activity log (admin only)
   */
  async getUserActivity(userId: number, limit: number = 100): Promise<any[]> {
    // This endpoint would need to be implemented on the backend
    const response = await api.get(`${this.baseUrl}/${userId}/activity?limit=${limit}`);
    return response.data;
  }

  /**
   * Get user audit log (admin only)
   */
  async getUserAuditLog(userId: number, limit: number = 100): Promise<any[]> {
    // This endpoint would need to be implemented on the backend
    const response = await api.get(`${this.baseUrl}/${userId}/audit?limit=${limit}`);
    return response.data;
  }

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(
    userId: number, 
    preferences: Record<string, boolean>
  ): Promise<{ message: string }> {
    // This endpoint would need to be implemented on the backend
    const response = await api.put(`${this.baseUrl}/${userId}/notifications`, preferences);
    return response.data;
  }

  /**
   * Get user notification preferences
   */
  async getNotificationPreferences(userId: number): Promise<Record<string, boolean>> {
    // This endpoint would need to be implemented on the backend
    const response = await api.get(`${this.baseUrl}/${userId}/notifications`);
    return response.data;
  }

  /**
   * Validate user data before submission
   */
  validateUserData(userData: Partial<UserCreate>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.password && userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (userData.user_type === 'customer' && !userData.customer_fields) {
      errors.push('Customer fields are required for customer users');
    }

    if (userData.user_type === 'admin' && !userData.admin_fields) {
      errors.push('Admin fields are required for admin users');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format user data for display
   */
  formatUserForDisplay(user: User): {
    displayName: string;
    displayType: string;
    displayStatus: string;
    displayCredits: string;
    displayCreated: string;
  } {
    const displayName = user.name || user.email.split('@')[0] || 'Unknown User';
    const displayType = user.user_type === 'admin' ? 'Administrator' : 'Customer';
    const displayStatus = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    const displayCredits = user.credits.toLocaleString();
    const displayCreated = user.created_at 
      ? new Date(user.created_at).toLocaleDateString()
      : 'Unknown';

    return {
      displayName,
      displayType,
      displayStatus,
      displayCredits,
      displayCreated
    };
  }

  /**
   * Check if user has specific permissions
   */
  hasPermission(user: User, permission: string): boolean {
    if (user.user_type === 'admin') {
      // Admins have all permissions
      return true;
    }
    
    // For customers, check specific permissions
    switch (permission) {
      case 'view_profile':
      case 'edit_profile':
      case 'view_credits':
        return true;
      case 'admin_access':
      case 'manage_users':
      case 'view_analytics':
        return false;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
