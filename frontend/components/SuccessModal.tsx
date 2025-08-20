import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'info' | 'warning';
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success'
}: SuccessModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    success: {
      icon: 'text-green-400',
      bg: 'bg-green-900/20',
      border: 'border-green-700',
      button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    },
    info: {
      icon: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    },
    warning: {
      icon: 'text-amber-400',
      bg: 'bg-amber-900/20',
      border: 'border-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all">
        {/* Header */}
        <div className={`${styles.bg} ${styles.border} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${styles.icon} p-2 rounded-full bg-gray-800 shadow-sm`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-center">
            <div className={`${styles.icon} mx-auto mb-4 p-3 rounded-full ${styles.bg} ${styles.border}`}>
              <CheckCircle className="h-8 w-8" />
            </div>
            
            <p className="text-gray-300 mb-6">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 px-6 py-4 flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
          >
            Continue
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
