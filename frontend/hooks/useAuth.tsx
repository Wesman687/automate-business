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

// Use direct server calls with JWT tokens (no cookie/domain issues)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server.stream-lineai.com' 
  : 'http://localhost:8005'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔑 JWT AuthProvider: Initializing with encryption key...')
    
    // Check for existing JWT token in localStorage
    const savedToken = localStorage.getItem('admin_token')
    console.log('🔑 JWT AuthProvider: Saved token:', savedToken ? `${savedToken.substring(0, 20)}...` : 'none')
    
    if (savedToken) {
      console.log('🔑 JWT AuthProvider: Validating existing JWT token...')
      validateToken(savedToken)
    } else {
      console.log('🔑 JWT AuthProvider: No token found, user not authenticated')
      setLoading(false)
    }
  }, [])

  const validateToken = async (tokenToValidate: string) => {
    console.log('🔑 JWT Validation: Starting validation...')
    console.log('🔑 JWT Validation: Token to validate:', tokenToValidate.substring(0, 30) + '...')
    console.log('🔑 JWT Validation: API_BASE_URL:', API_BASE_URL)
    console.log('🔑 JWT Validation: Full URL:', `${API_BASE_URL}/auth/verify`)
    
    try {
      console.log('🔑 JWT Validation: About to make fetch request with Authorization header...')
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToValidate}` // JWT standard
        },
        credentials: 'omit' // IMPORTANT: Prevent browser from sending cookies
      })
      
      console.log('🔑 JWT Validation: Response status:', response.status)
      console.log('🔑 JWT Validation: Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const userData = await response.json()
        console.log('🔑 JWT Validation: Token valid, user:', userData.user?.email)
        setUser(userData.user)
        setToken(tokenToValidate)
      } else {
        console.log('🔑 JWT Validation: Token invalid or expired')
        localStorage.removeItem('admin_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('🔑 JWT Validation: Network error:', error)
      localStorage.removeItem('admin_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔑 JWT Login: Attempting login for:', email)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'omit' // IMPORTANT: Prevent browser from sending cookies
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔑 JWT Login: Success! Token received:', data.token?.substring(0, 20) + '...')
        
        // Store JWT token in localStorage
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('admin_token', data.token)
        
        return true
      } else {
        console.log('🔑 JWT Login: Failed with status:', response.status)
        return false
      }
    } catch (error) {
      console.error('🔑 JWT Login: Network error:', error)
      return false
    }
  }

  const logout = () => {
    console.log('🔑 JWT Logout: Clearing authentication')
    setUser(null)
    setToken(null)
    localStorage.removeItem('admin_token')
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_super_admin || false,
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
