'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

// Skeleton loader for form fields
export const FormFieldSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

// Skeleton loader for text areas
export const TextAreaSkeleton: React.FC<{ rows?: number; className?: string }> = ({ rows = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

// Skeleton loader for select fields
export const SelectSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

// Loading spinner component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`} />
  );
};

// Loading button component
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}> = ({ 
  loading, 
  children, 
  className = '', 
  disabled = false,
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md
        transition-all duration-200 font-medium
        ${loading 
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  );
};

// Loading overlay for entire sections
export const LoadingOverlay: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode;
  className?: string;
}> = ({ loading, children, className = '' }) => {
  if (!loading) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
};

// Skeleton for entire form sections
export const FormSectionSkeleton: React.FC<{ 
  fields?: number; 
  className?: string;
}> = ({ fields = 4, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header skeleton */}
    <div className="flex items-center space-x-2">
      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    
    {/* Form fields skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: fields }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
    </div>
  </div>
);
