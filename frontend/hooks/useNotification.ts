'use client'

import { useState, useCallback } from 'react'

export interface NotificationState {
  show: boolean
  type: 'success' | 'error' | 'info' | 'custom'
  title: string
  message: string
  icon?: React.ReactNode
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  const showNotification = useCallback((
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'custom' = 'success',
    icon?: React.ReactNode
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      icon
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }))
  }, [])

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string) => {
    showNotification(title, message, 'success')
  }, [showNotification])

  const showError = useCallback((title: string, message: string) => {
    showNotification(title, message, 'error')
  }, [showNotification])

  const showInfo = useCallback((title: string, message: string) => {
    showNotification(title, message, 'info')
  }, [showNotification])

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo
  }
}

export default useNotification
