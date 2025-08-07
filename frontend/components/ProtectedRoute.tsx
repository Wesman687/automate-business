'use client'

import { useAuth } from '../hooks/useAuth'
import AdminLogin from './AdminLogin'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 text-center max-w-md w-full">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You are not an admin. Please login with an admin account.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Or contact{' '}
            <a 
              href="mailto:tech@stream-lineai.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              tech@stream-lineai.com
            </a>{' '}
            to setup an admin account.
          </p>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Currently logged in as: {user?.email}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Login with Different Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
