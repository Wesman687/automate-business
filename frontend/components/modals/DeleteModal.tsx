import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  variant = 'danger'
}: DeleteModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      border: 'border-red-700',
      bg: 'bg-red-900/20'
    },
    warning: {
      icon: 'text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      border: 'border-amber-700',
      bg: 'bg-amber-900/20'
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
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="text-center">
              <div className={`${styles.icon} mx-auto mb-4 p-3 rounded-full ${styles.bg} ${styles.border}`}>
                <Trash2 className="h-8 w-8" />
              </div>
              
              <p className="text-gray-300 mb-2">{message}</p>
              
              {itemName && (
                <div className="bg-gray-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-400 font-medium">Item to delete:</p>
                  <p className="text-white font-semibold truncate">{itemName}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-400 mb-6">
                This action cannot be undone. Please make sure this is what you want to do.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-800 px-6 py-4 flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${styles.button}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
