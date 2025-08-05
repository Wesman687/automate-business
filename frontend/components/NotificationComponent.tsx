'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, AlertCircle, Info, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface NotificationProps {
  show: boolean
  onClose: () => void
  type?: 'success' | 'error' | 'info' | 'custom'
  title: string
  message: string
  duration?: number // Auto-hide duration in ms (0 = manual close only)
  icon?: React.ReactNode
  position?: 'top' | 'bottom'
  className?: string
}

const NotificationComponent = ({
  show,
  onClose,
  type = 'success',
  title,
  message,
  duration = 5000,
  icon,
  position = 'top',
  className = ''
}: NotificationProps) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const getIcon = () => {
    if (icon) return icon
    
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6" />
      case 'error':
        return <AlertCircle className="w-6 h-6" />
      case 'info':
        return <Info className="w-6 h-6" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-electric-blue',
          iconText: 'text-black',
          statusDot: 'bg-electric-blue',
          border: 'border-electric-blue'
        }
      case 'error':
        return {
          iconBg: 'bg-red-500',
          iconText: 'text-white',
          statusDot: 'bg-red-500',
          border: 'border-red-500'
        }
      case 'info':
        return {
          iconBg: 'bg-blue-500',
          iconText: 'text-white',
          statusDot: 'bg-blue-500',
          border: 'border-blue-500'
        }
      default:
        return {
          iconBg: 'bg-electric-blue',
          iconText: 'text-black',
          statusDot: 'bg-electric-blue',
          border: 'border-electric-blue'
        }
    }
  }

  const colors = getColors()
  const positionClasses = position === 'top' 
    ? 'top-6 left-1/2 transform -translate-x-1/2' 
    : 'bottom-6 right-6'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : 100, 
            scale: 0.95 
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : 100, 
            scale: 0.95 
          }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 500,
            duration: 0.3 
          }}
          className={`fixed ${positionClasses} z-50 max-w-md w-full mx-4 ${className}`}
        >
          <div className={`bg-dark-card ${colors.border} border rounded-lg shadow-2xl p-6 backdrop-blur-sm bg-opacity-95`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${colors.iconBg} ${colors.iconText} rounded-full flex items-center justify-center`}>
                  {getIcon()}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {title}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {message}
                </p>
                <div className="flex items-center text-xs text-electric-blue">
                  <div className={`w-2 h-2 ${colors.statusDot} rounded-full mr-2 animate-pulse`}></div>
                  <span>Streamline AI</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationComponent
