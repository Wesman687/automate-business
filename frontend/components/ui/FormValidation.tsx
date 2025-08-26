'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Field validation hook
export const useFieldValidation = (value: any, rules: ValidationRule[]) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const validate = () => {
      const newErrors: string[] = [];
      const newWarnings: string[] = [];

      // Required validation
      if (rules.find(rule => rule.required) && (!value || value.toString().trim() === '')) {
        newErrors.push('This field is required');
      }

      // Length validations
      if (value && typeof value === 'string') {
        const minLength = rules.find(rule => rule.minLength)?.minLength;
        const maxLength = rules.find(rule => rule.maxLength)?.maxLength;

        if (minLength && value.length < minLength) {
          newErrors.push(`Minimum length is ${minLength} characters`);
        }

        if (maxLength && value.length > maxLength) {
          newWarnings.push(`Maximum length is ${maxLength} characters`);
        }
      }

      // Pattern validation
      if (value && rules.find(rule => rule.pattern)) {
        const pattern = rules.find(rule => rule.pattern)?.pattern;
        if (pattern && !pattern.test(value)) {
          newErrors.push('Invalid format');
        }
      }

      // Custom validation
      rules.forEach(rule => {
        if (rule.custom && value) {
          const customError = rule.custom(value);
          if (customError) {
            newErrors.push(customError);
          }
        }
      });

      setErrors(newErrors);
      setWarnings(newWarnings);
      setIsValid(newErrors.length === 0);
    };

    validate();
  }, [value, rules]);

  return { errors, warnings, isValid };
};

// Validation message component
export const ValidationMessage: React.FC<{
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  className?: string;
}> = ({ type, message, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
    }
  };

  return (
    <div className={`flex items-start space-x-2 p-3 rounded-md border ${getStyles()} ${className}`}>
      {getIcon()}
      <span className="text-sm">{message}</span>
    </div>
  );
};

// Form-level validation summary
export const FormValidationSummary: React.FC<{
  errors: string[];
  warnings: string[];
  className?: string;
}> = ({ errors, warnings, className = '' }) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Please review the following warnings:
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-500">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Common validation rules
export const commonValidationRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  url: { 
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
      return null;
    }
  },
  phone: { 
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: string) => {
      if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  minLength: (min: number) => ({ minLength: min }),
  maxLength: (max: number) => ({ maxLength: max }),
  range: (min: number, max: number) => ({ 
    minLength: min, 
    maxLength: max 
  })
};

// Form validation hook for entire forms
export const useFormValidation = (fields: Record<string, any>, rules: Record<string, ValidationRule[]>) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string[]>>({});
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const newFieldErrors: Record<string, string[]> = {};
    const newFieldWarnings: Record<string, string[]> = {};

    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName];
      const fieldValue = fields[fieldName];
      
      const errors: string[] = [];
      const warnings: string[] = [];

      // Apply validation rules
      fieldRules.forEach(rule => {
        if (rule.required && (!fieldValue || fieldValue.toString().trim() === '')) {
          errors.push('This field is required');
        }

        if (fieldValue && typeof fieldValue === 'string') {
          if (rule.minLength && fieldValue.length < rule.minLength) {
            errors.push(`Minimum length is ${rule.minLength} characters`);
          }

          if (rule.maxLength && fieldValue.length > rule.maxLength) {
            warnings.push(`Maximum length is ${rule.maxLength} characters`);
          }

          if (rule.pattern && !rule.pattern.test(fieldValue)) {
            errors.push('Invalid format');
          }
        }

        if (rule.custom && fieldValue) {
          const customError = rule.custom(fieldValue);
          if (customError) {
            errors.push(customError);
          }
        }
      });

      newFieldErrors[fieldName] = errors;
      newFieldWarnings[fieldName] = warnings;
    });

    setFieldErrors(newFieldErrors);
    setFieldWarnings(newFieldWarnings);

    // Check if form is valid
    const hasErrors = Object.values(newFieldErrors).some(errors => errors.length > 0);
    setIsFormValid(!hasErrors);
  }, [fields, rules]);

  return {
    fieldErrors,
    fieldWarnings,
    isFormValid,
    getFieldError: (fieldName: string) => fieldErrors[fieldName] || [],
    getFieldWarning: (fieldName: string) => fieldWarnings[fieldName] || [],
    hasFieldError: (fieldName: string) => (fieldErrors[fieldName] || []).length > 0,
    hasFieldWarning: (fieldName: string) => (fieldWarnings[fieldName] || []).length > 0
  };
};
