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
    // TEMPORARY: Disable automatic token validation to stop infinite loop
    // TODO: Fix the cookie/authentication issue then re-enable
    console.log('🚫 AuthProvider: Automatic token validation disabled to prevent infinite loop');
    setLoading(false);
    
    // Original code (commented out):
    // Check for existing token on mount
    // const savedToken = localStorage.getItem('admin_token')
    // if (savedToken) {
    //   validateToken(savedToken)
    // } else {
    //   setLoading(false)
    // }
  }, [])

  const validateToken = async (tokenToValidate: string) => {
    try {
      // Use Next.js API route instead of direct server call
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setToken(tokenToValidate)
      } else {
        // Token is invalid
        localStorage.removeItem('admin_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('admin_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('admin_token', data.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
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
