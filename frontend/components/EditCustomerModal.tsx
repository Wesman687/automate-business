'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building, Globe, MessageSquare, FileText, Lock, EyeOff, Eye } from 'lucide-react';
import { formatPhoneNumber, handlePhoneChange, isValidPhoneNumber } from '@/utils/phoneFormatter';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  business_site?: string;
  business_type?: string;
  additional_websites?: string;
  status: string;
  notes?: string;
  file_path?: string;
  created_at?: string;
  chat_sessions?: any[];
}

interface EditCustomerModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCustomer: Partial<Customer>, passwordData?: { password: string }) => Promise<void>;
}

export default function EditCustomerModal({ customer, isOpen, onClose, onSave }: EditCustomerModalProps) {
  const [formData, setFormData] = useState({
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
    status: 'lead',
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
        status: customer.status || 'lead',
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
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // URL validation for business site
    if (formData.business_site && formData.business_site.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.business_site)) {
        newErrors.business_site = 'Please enter a valid website URL';
      }
    }

    // Password validation if changing password
    if (changePassword) {
      if (!passwordData.password) {
        newErrors.password = 'Password is required';
      } else if (passwordData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
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

  const handleInputChange = (field: string, value: string) => {
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
        newErrors.password = 'Password must be at least 8 characters long';
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
      // Prepare the update data
      const updateData: Partial<Customer> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        zip_code: formData.zip_code.trim() || undefined,
        country: formData.country.trim() || undefined,
        business_site: formData.business_site.trim() || undefined,
        business_type: formData.business_type.trim() || undefined,
        additional_websites: formData.additional_websites.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined
      };

      // Include password data if changing password
      const passwordUpdateData = changePassword ? { password: passwordData.password } : undefined;

      await onSave(updateData, passwordUpdateData);
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      // You could set a general error state here
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" />
            Edit Customer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter customer name"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="(000) 000-0000"
                maxLength={14}
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              <p className="text-gray-500 text-xs mt-1">Format: (386) 227-4629</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="customer">Customer</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              Street Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter street address"
            />
          </div>

          {/* City, State, Zip, Country */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="ZIP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Country"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Business Type
              </label>
              <input
                type="text"
                value={formData.business_type}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Technology, Retail, Manufacturing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Business Website
              </label>
              <input
                type="url"
                value={formData.business_site}
                onChange={(e) => handleInputChange('business_site', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.business_site ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="https://example.com"
              />
              {errors.business_site && <p className="text-red-400 text-sm mt-1">{errors.business_site}</p>}
            </div>
          </div>

          {/* Additional Websites */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Additional Websites
            </label>
            <textarea
              value={formData.additional_websites}
              onChange={(e) => handleInputChange('additional_websites', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter additional websites (one per line)"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter any additional notes about this customer"
            />
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                <Lock className="h-4 w-4 inline mr-1" />
                Change Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setChangePassword(!changePassword);
                  if (!changePassword) {
                    // Reset password fields when enabling
                    setPasswordData({ password: '', confirmPassword: '' });
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  changePassword 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {changePassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.password}
                      onChange={(e) => handlePasswordChange('password', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10 ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  <p className="text-gray-500 text-xs mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
