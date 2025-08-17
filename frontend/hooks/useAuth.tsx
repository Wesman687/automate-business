'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: number
  email: string
  username: string
  full_name?: string
  is_super_admin: boolean
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Use Next.js API routes instead of direct server calls
const API_BASE_URL = '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('� AuthProvider: useEffect triggered');
    
    // Check for existing token on mount
    const savedToken = localStorage.getItem('admin_token')
    console.log('🔍 AuthProvider: localStorage admin_token:', savedToken ? `${savedToken.substring(0, 20)}...` : 'null');
    
    if (savedToken) {
      console.log('🔍 AuthProvider: Found token, validating...');
      validateToken(savedToken)
    } else {
      console.log('🔍 AuthProvider: No token found, setting loading to false');
      setLoading(false)
    }
  }, [])

  const validateToken = async (tokenToValidate: string) => {
    console.log('🔍 AuthProvider: validateToken called with token:', tokenToValidate.substring(0, 20) + '...');
    console.log('🔍 AuthProvider: API_BASE_URL:', API_BASE_URL);
    console.log('🔍 AuthProvider: About to call:', `${API_BASE_URL}/auth/verify`);
    
    try {
      // Use Next.js API route instead of direct server call
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('🔍 AuthProvider: Response status:', response.status);
      console.log('🔍 AuthProvider: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const userData = await response.json()
        console.log('🔍 AuthProvider: Valid token, user data:', userData);
        setUser(userData.user)
        setToken(tokenToValidate)
      } else {
        // Token is invalid
        console.log('🔍 AuthProvider: Invalid token, response:', await response.text());
        localStorage.removeItem('admin_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('🔍 AuthProvider: Token validation failed:', error)
      localStorage.removeItem('admin_token')
      setToken(null)
      setUser(null)
    } finally {
      console.log('🔍 AuthProvider: validateToken complete, setting loading to false');
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 AuthProvider: Login attempt for email:', email);
    console.log('🔍 AuthProvider: Login URL:', `${API_BASE_URL}/auth/login`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('🔍 AuthProvider: Login response status:', response.status);
      console.log('🔍 AuthProvider: Login response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 AuthProvider: Login success, data:', data);
        
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('admin_token', data.token)
        
        console.log('🔍 AuthProvider: Token saved to localStorage:', data.token.substring(0, 20) + '...');
        
        // Check if cookies were set
        console.log('🔍 AuthProvider: Checking document.cookie after login:', document.cookie);
        
        return true
      } else {
        const errorText = await response.text();
        console.log('🔍 AuthProvider: Login failed, response:', errorText);
      }
      return false
    } catch (error) {
      console.error('🔍 AuthProvider: Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('admin_token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: !!user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
