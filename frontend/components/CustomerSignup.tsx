'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Building2, Phone, MapPin, Globe, Eye, EyeOff, CheckCircle, X, Zap, CreditCard } from 'lucide-react';
import { api } from '@/lib/https';
import { 
  UserCreateRequest,
  User as UserType
} from '@/types';

interface CustomerSignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerData: UserType) => void;
}

interface SignupForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  business_site: string;
  business_type: string;
}

interface PostSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: UserType;
}

export default function CustomerSignup({ isOpen, onClose, onSuccess }: CustomerSignupProps) {
  const [step, setStep] = useState<'signup' | 'verification' | 'complete'>('signup');
  const [formData, setFormData] = useState<SignupForm>({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    business_site: '',
    business_type: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerData, setCustomerData] = useState<UserType | null>(null);
  const [showPostSignupModal, setShowPostSignupModal] = useState(false);

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, create the customer account
      const signupResponse = await api.post<UserType>('/customers/signup', formData);
      
      if (signupResponse) {
        setCustomerData(signupResponse);
        setStep('verification');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify email with code
      const verifyResponse = await api.post('/customers/verify-email', {
        email: formData.email,
        verification_code: verificationCode
      });

      if (verifyResponse) {
        // Set password for the account
        const passwordResponse = await api.post('/customers/set-password', {
          email: formData.email,
          password: password
        });

        if (passwordResponse) {
          setStep('complete');
          setShowPostSignupModal(true);
        } else {
          setError('Failed to set password. Please try again.');
        }
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (customerData) {
      onSuccess(customerData);
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      business_site: '',
      business_type: ''
    });
    setVerificationCode('');
    setPassword('');
    setStep('signup');
    setError('');
    setCustomerData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Customer Signup</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Business Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter business address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Business Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <input
                          type="url"
                          value={formData.business_site}
                          onChange={(e) => handleInputChange('business_site', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Business Type
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => handleInputChange('business_type', e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select business type</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-white/80 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Check Your Email</h3>
                  <p className="text-white/80">
                    We've sent a verification code to <strong>{formData.email}</strong>
                  </p>

                  <form onSubmit={handleVerification} className="space-y-4">
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Set Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pr-10 pl-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep('signup')}
                        className="px-4 py-2 text-white/80 hover:text-white transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Verifying...' : 'Verify & Complete'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Account Created Successfully!</h3>
                  <p className="text-white/80">
                    Welcome to StreamlineAI! Your account has been created and verified.
                  </p>

                  <div className="flex justify-center space-x-3 pt-4">
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showPostSignupModal && customerData && (
          <PostSignupModal
            isOpen={showPostSignupModal}
            onClose={() => setShowPostSignupModal(false)}
            customerData={customerData}
          />
        )}
      </div>
    </div>
  );
}

function PostSignupModal({ isOpen, onClose, customerData }: PostSignupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-md">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Welcome to StreamlineAI!</h3>
          <p className="text-white/80">
            Your account is ready. Here's what you can do next:
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3 text-white/80">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <span>Set up your billing information</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <User className="h-4 w-4 text-green-400" />
              <span>Complete your profile</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span>Start your first project</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Let's Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
