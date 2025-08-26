'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  icon?: LucideIcon;
  required?: boolean;
  error?: string;
  warning?: string;
  helpText?: string;
  className?: string;
  children: React.ReactNode;
  describedBy?: string;
  invalid?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  icon: Icon,
  required = false,
  error,
  warning,
  helpText,
  className = '',
  children,
  describedBy,
  invalid = false
}) => {
  const fieldId = `field-${name}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const warningId = warning ? `${fieldId}-warning` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  
  const ariaDescribedBy = [describedBy, errorId, warningId, helpId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />}
          <span>{label}</span>
          {required && <span className="text-red-500" aria-label="required">*</span>}
        </div>
      </label>
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: name,
          name,
          'aria-describedby': ariaDescribedBy || undefined,
          'aria-invalid': invalid || !!error,
          'aria-required': required
        })}
      </div>
      
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}
      
      {warning && (
        <p id={warningId} className="text-sm text-yellow-600" role="alert">
          ⚠️ {warning}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert" aria-live="polite">
          ❌ {error}
        </p>
      )}
    </div>
  );
};

// Standardized input components
export const FormInput: React.FC<{
  type?: 'text' | 'email' | 'url' | 'number' | 'date' | 'tel';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}> = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  className = '',
  min,
  max,
  step,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      onChange(parseFloat(e.target.value) || 0);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={`
        w-full px-3 py-2 border rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
        ${className}
      `}
    />
  );
};

export const FormTextarea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  error?: string;
}> = ({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  disabled = false,
  className = '',
  error
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`
        w-full px-3 py-2 border rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
        ${className}
      `}
    />
  );
};

export const FormSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}> = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false,
  className = '',
  error
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
        w-full px-3 py-2 border rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
        ${className}
      `}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Status badge component
export const StatusBadge: React.FC<{
  status: string;
  className?: string;
}> = ({ status, className = '' }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${getStatusStyles(status)}
        ${className}
      `}
    >
      {formatStatus(status)}
    </span>
  );
};

// Priority badge component
export const PriorityBadge: React.FC<{
  priority: string;
  className?: string;
}> = ({ priority, className = '' }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${getPriorityStyles(priority)}
        ${className}
      `}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};
