import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/lib/services/userService';
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
  UseUsersReturn,
  UseUserReturn,
  UseUserStatsReturn
} from '@/types/user';

/**
 * Hook for managing multiple users (admin functionality)
 */
export function useUsers(initialFilters: Partial<UserFilter> = {}): UseUsersReturn {
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(100);
  const [filters, setFilters] = useState<UserFilter>({
    user_type: undefined,
    status: undefined,
    lead_status: undefined,
    industry: undefined,
    business_type: undefined,
    created_after: undefined,
    created_before: undefined,
    has_credits: undefined,
    search: undefined,
    ...initialFilters
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const skip = page * limit;
      const userList = await userService.getUsers({
        skip,
        limit,
        user_type: filters.user_type,
        status: filters.status,
        search: filters.search
      });
      
      setUsers(userList);
      setTotal(userList.length); // Note: This is approximate without backend pagination support
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  const refresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateFilters = useCallback((newFilters: Partial<UserFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filters change
  }, []);

  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(0); // Reset to first page when limit changes
  }, []);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    total,
    page,
    limit,
    filters,
    setFilters: updateFilters,
    setPage: updatePage,
    setLimit: updateLimit,
    refresh
  };
}

/**
 * Hook for managing a single user
 */
export function useUser(userId: number): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getUser(userId);
      setUser(userData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateUser = useCallback(async (updates: UserUpdate) => {
    try {
      setError(null);
      
      const updatedUser = await userService.updateUser(userId, updates);
      setUser(updatedUser);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, [userId]);

  const updatePassword = useCallback(async (passwordData: PasswordUpdate) => {
    try {
      setError(null);
      
      await userService.updatePassword(userId, passwordData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      throw err;
    }
  }, [userId]);

  const refresh = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  // Fetch user when userId changes
  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  return {
    user,
    loading,
    error,
    updateUser,
    updatePassword,
    refresh
  };
}

/**
 * Hook for user statistics (admin functionality)
 */
export function useUserStats(): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userStats = await userService.getUserStats();
      setStats(userStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh
  };
}

/**
 * Hook for user search with debouncing
 */
export function useUserSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<UserListResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);
      
      const results = await userService.searchUsers({ search: searchQuery });
      setSearchResults(results);
      
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  return {
    query,
    setQuery,
    searchResults,
    searching,
    searchError,
    searchUsers
  };
}

/**
 * Hook for bulk user operations (admin functionality)
 */
export function useBulkUserOperations() {
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const bulkUpdateUsers = useCallback(async (bulkUpdate: BulkUserUpdate) => {
    try {
      setBulkLoading(true);
      setBulkError(null);
      
      const result = await userService.bulkUpdateUsers(bulkUpdate);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk update failed';
      setBulkError(errorMessage);
      throw err;
    } finally {
      setBulkLoading(false);
    }
  }, []);

  const bulkUpdateUserStatus = useCallback(async (bulkStatusUpdate: BulkUserStatusUpdate) => {
    try {
      setBulkLoading(true);
      setBulkError(null);
      
      const result = await userService.bulkUpdateUserStatus(bulkStatusUpdate);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk status update failed';
      setBulkError(errorMessage);
      throw err;
    } finally {
      setBulkLoading(false);
    }
  }, []);

  const clearBulkError = useCallback(() => {
    setBulkError(null);
  }, []);

  return {
    bulkLoading,
    bulkError,
    bulkUpdateUsers,
    bulkUpdateUserStatus,
    clearBulkError
  };
}

/**
 * Hook for user creation
 */
export function useUserCreation() {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createUser = useCallback(async (userData: UserCreate) => {
    try {
      setCreating(true);
      setCreateError(null);
      
      // Validate user data
      const validation = userService.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const newUser = await userService.createUser(userData);
      return newUser;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'User creation failed';
      setCreateError(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const clearCreateError = useCallback(() => {
    setCreateError(null);
  }, []);

  return {
    creating,
    createError,
    createUser,
    clearCreateError
  };
}

/**
 * Hook for user deletion (admin functionality)
 */
export function useUserDeletion() {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      setDeleting(true);
      setDeleteError(null);
      
      const result = await userService.deleteUser(userId);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'User deletion failed';
      setDeleteError(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  const clearDeleteError = useCallback(() => {
    setDeleteError(null);
  }, []);

  return {
    deleting,
    deleteError,
    deleteUser,
    clearDeleteError
  };
}
