'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Building2, Phone, MapPin, Globe, Eye, EyeOff, CheckCircle, X, Zap, CreditCard } from 'lucide-react';
import { api } from '@/lib/https';

interface CustomerSignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerData: any) => void;
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
  customerData: any;
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
  const [customerData, setCustomerData] = useState<any>(null);
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
      const signupResponse = await api.post('/customers/signup', formData);
      
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
        setError('Invalid verification code. Please check your email and try again.');
      }
    } catch (error: any) {
      setError(error?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSignupAction = (action: 'job' | 'credits') => {
    setShowPostSignupModal(false);
    onSuccess(customerData);
    
    if (action === 'job') {
      // Redirect to job creation or show job modal
      console.log('Redirecting to job creation...');
    } else if (action === 'credits') {
      // Show credits coming soon message
      console.log('Credits feature coming soon...');
    }
  };

  const resetForm = () => {
    setStep('signup');
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
    setError('');
    setCustomerData(null);
    setShowPostSignupModal(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-xl border border-dark-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-electric-blue/20 rounded-lg">
                    <User className="h-6 w-6 text-electric-blue" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Create Customer Account</h2>
                    <p className="text-gray-400 text-sm">
                      {step === 'signup' && 'Fill in your business information to get started'}
                      {step === 'verification' && 'Verify your email and set a password'}
                      {step === 'complete' && 'Account created successfully!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <User className="inline h-4 w-4 mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Mail className="inline h-4 w-4 mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                          placeholder="Enter your email address"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Building2 className="inline h-4 w-4 mr-2" />
                          Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                          placeholder="Enter your company name"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Phone className="inline h-4 w-4 mr-2" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <MapPin className="inline h-4 w-4 mr-2" />
                          Business Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                          placeholder="Enter your business address"
                        />
                      </div>

                      {/* Business Website */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Globe className="inline h-4 w-4 mr-2" />
                          Business Website
                        </label>
                        <input
                          type="url"
                          value={formData.business_site}
                          onChange={(e) => handleInputChange('business_site', e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    {/* Business Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Business Type
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) => handleInputChange('business_type', e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
                      >
                        <option value="">Select business type</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="consulting">Consulting</option>
                        <option value="education">Education</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-electric-blue hover:bg-electric-blue/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Create Account
                        </>
                      )}
                    </button>
                  </form>
                )}

                {step === 'verification' && (
                  <form onSubmit={handleVerification} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="text-center">
                      <div className="p-3 bg-green-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
                      <p className="text-gray-400">
                        We've sent a verification code to <span className="text-white font-medium">{formData.email}</span>
                      </p>
                    </div>

                    {/* Verification Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue text-center text-lg tracking-widest"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Set Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue pr-12"
                          placeholder="Create a secure password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-electric-blue hover:bg-electric-blue/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Verify & Complete
                        </>
                      )}
                    </button>
                  </form>
                )}

                {step === 'complete' && (
                  <div className="text-center py-8">
                    <div className="p-3 bg-green-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Account Created Successfully!</h3>
                    <p className="text-gray-400 mb-6">
                      Welcome to StreamlineAI! Your account has been created and verified.
                    </p>
                    <button
                      onClick={() => setShowPostSignupModal(true)}
                      className="px-6 py-3 bg-electric-blue hover:bg-electric-blue/80 text-white font-medium rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Signup Modal */}
      <PostSignupModal
        isOpen={showPostSignupModal}
        onClose={() => setShowPostSignupModal(false)}
        customerData={customerData}
        onAction={handlePostSignupAction}
      />
    </>
  );
}

// Post-Signup Modal Component
function PostSignupModal({ isOpen, onClose, customerData, onAction }: PostSignupModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-card rounded-xl border border-dark-border shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="p-6 border-b border-dark-border">
            <div className="text-center">
              <div className="p-3 bg-electric-blue/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-electric-blue" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">What would you like to do next?</h2>
              <p className="text-gray-400 text-sm">
                Welcome to StreamlineAI! Choose how you'd like to get started.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Start New Automation Job */}
            <button
              onClick={() => onAction('job')}
              className="w-full flex items-center gap-3 p-4 bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-blue/30 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-electric-blue/20 rounded-lg group-hover:bg-electric-blue/30 transition-colors">
                <Zap className="h-6 w-6 text-electric-blue" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Start a New Automation Job</h3>
                <p className="text-sm text-gray-400">Create your first automation workflow</p>
              </div>
            </button>

            {/* Buy Credits */}
            <button
              onClick={() => onAction('credits')}
              className="w-full flex items-center gap-3 p-4 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-neon-green/20 rounded-lg group-hover:bg-neon-green/30 transition-colors">
                <CreditCard className="h-6 w-6 text-neon-green" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Buy Credits</h3>
                <p className="text-sm text-gray-400">
                  Purchase credits for AI services
                  <span className="ml-2 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                    Coming Soon
                  </span>
                </p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-dark-border">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
