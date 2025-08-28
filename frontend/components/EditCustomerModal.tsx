'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building, Globe, MessageSquare, FileText, Lock, EyeOff, Eye } from 'lucide-react';
import { formatPhoneNumber, handlePhoneChange, isValidPhoneNumber } from '@/utils/phoneFormatter';
import { 
  User as UserType, 
  UserStatus, 
  LeadStatus,
  UserUpdateRequest,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES
} from '@/types';

interface EditCustomerModalProps {
  customer: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCustomer: UserUpdateRequest, passwordData?: { password: string }) => Promise<void>;
}

export default function EditCustomerModal({ customer, isOpen, onClose, onSave }: EditCustomerModalProps) {
  const [formData, setFormData] = useState<UserUpdateRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    business_site: '',
    business_type: '',
    additional_websites: '',
    status: UserStatus.PENDING,
    notes: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone ? formatPhoneNumber(customer.phone) : '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        country: customer.country || '',
        business_site: customer.business_site || '',
        business_type: customer.business_type || '',
        additional_websites: customer.additional_websites || '',
        status: customer.status || UserStatus.PENDING,
        notes: customer.notes || ''
      });
      
      // Reset password fields when customer changes
      setPasswordData({
        password: '',
        confirmPassword: ''
      });
      setChangePassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = VALIDATION_MESSAGES.REQUIRED;
    }

    if (!formData.email?.trim()) {
      newErrors.email = VALIDATION_MESSAGES.REQUIRED;
    } else if (!VALIDATION_PATTERNS.EMAIL.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    }

    // Phone validation
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      newErrors.phone = VALIDATION_MESSAGES.INVALID_PHONE;
    }

    // URL validation for business site
    if (formData.business_site && formData.business_site.trim()) {
      if (!VALIDATION_PATTERNS.URL.test(formData.business_site)) {
        newErrors.business_site = VALIDATION_MESSAGES.INVALID_URL;
      }
    }

    // Password validation if changing password
    if (changePassword) {
      if (!passwordData.password) {
        newErrors.password = VALIDATION_MESSAGES.REQUIRED;
      } else if (passwordData.password.length < 8) {
        newErrors.password = VALIDATION_MESSAGES.MIN_LENGTH(8);
      }

      if (!passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (passwordData.password !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserUpdateRequest, value: string) => {
    if (field === 'phone') {
      // Use the phone formatter
      value = handlePhoneChange(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field: 'password' | 'confirmPassword', value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation for immediate feedback
    const newErrors = { ...errors };
    
    if (field === 'password') {
      if (value.length === 0) {
        delete newErrors.password;
      } else if (value.length < 8) {
        newErrors.password = VALIDATION_MESSAGES.MIN_LENGTH(8);
      } else {
        delete newErrors.password;
      }
      
      // Also check confirm password if it exists
      if (passwordData.confirmPassword && value !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (passwordData.confirmPassword && value === passwordData.confirmPassword) {
        delete newErrors.confirmPassword;
      }
    } else if (field === 'confirmPassword') {
      if (value.length === 0) {
        delete newErrors.confirmPassword;
      } else if (passwordData.password !== value) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Transform the flat form data into the nested structure the backend expects
      const transformedData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        customer_fields: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          country: formData.country,
          business_site: formData.business_site,
          additional_websites: formData.additional_websites,
          business_type: formData.business_type,
          notes: formData.notes
        }
      };

      const finalPasswordData = changePassword ? { password: passwordData.password } : undefined;
      await onSave(transformedData, finalPasswordData);
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Failed to update customer. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Customer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Customer name"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={UserStatus.ACTIVE}>Active</option>
                  <option value={UserStatus.PENDING}>Pending</option>
                  <option value={UserStatus.INACTIVE}>Inactive</option>
                  <option value={UserStatus.SUSPENDED}>Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.business_type || ''}
                    onChange={(e) => handleInputChange('business_type', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.business_site || ''}
                    onChange={(e) => handleInputChange('business_site', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="https://example.com"
                  />
                </div>
                {errors.business_site && <p className="text-red-400 text-xs mt-1">{errors.business_site}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Websites
              </label>
              <textarea
                value={formData.additional_websites || ''}
                onChange={(e) => handleInputChange('additional_websites', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="List additional websites, one per line"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Notes & Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Additional notes about the customer..."
                />
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <label htmlFor="changePassword" className="text-sm font-medium text-gray-300">
                Change Password
              </label>
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.password}
                      onChange={(e) => handlePasswordChange('password', e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
