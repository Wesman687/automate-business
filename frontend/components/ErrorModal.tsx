'use client';

import { useEffect } from 'react';
import { X, AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
}

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'error' 
}: ErrorModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="h-6 w-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-400" />;
      default:
        return <XCircle className="h-6 w-6 text-red-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-900/20 border-red-400/30';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-400/30';
      case 'success':
        return 'bg-green-900/20 border-green-400/30';
      case 'info':
        return 'bg-blue-900/20 border-blue-400/30';
      default:
        return 'bg-red-900/20 border-red-400/30';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-md transform overflow-hidden rounded-lg border ${getBackgroundColor()} bg-gray-800/95 backdrop-blur-sm p-6 text-left shadow-xl transition-all`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-300">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${getButtonColor()}`}
              onClick={onClose}
            >
              Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
