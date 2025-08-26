import React, { useState } from 'react';
import { X, Link, Globe, Shield, CreditCard, Settings } from 'lucide-react';

interface CrossAppIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppFormData {
  app_name: string;
  app_domain: string;
  app_url?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  permissions: string[];
  max_users?: number;
  is_public: boolean;
  webhook_url?: string;
  allowed_origins?: string[];
}

const CrossAppIntegrationModal: React.FC<CrossAppIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<AppFormData>({
    app_name: '',
    app_domain: '',
    app_url: '',
    description: '',
    logo_url: '',
    primary_color: '#3B82F6',
    permissions: [],
    max_users: 1000,
    is_public: false,
    webhook_url: '',
    allowed_origins: []
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const availablePermissions = [
    { id: 'read_user_info', label: 'Read User Info', description: 'Access basic user profile information', icon: Shield },
    { id: 'read_credits', label: 'Read Credits', description: 'Check user credit balance', icon: CreditCard },
    { id: 'purchase_credits', label: 'Purchase Credits', description: 'Allow users to buy credits', icon: CreditCard },
    { id: 'consume_credits', label: 'Consume Credits', description: 'Use credits for services', icon: CreditCard },
    { id: 'manage_subscriptions', label: 'Manage Subscriptions', description: 'Handle user subscriptions', icon: Settings },
    { id: 'read_analytics', label: 'Read Analytics', description: 'Access usage analytics', icon: Settings }
  ];

  const handleInputChange = (field: keyof AppFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/cross-app/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setStep(2);
        // You could show the API key here or redirect to the full admin panel
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to create integration'}`);
      }
    } catch (error) {
      alert('Error creating integration');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      app_name: '',
      app_domain: '',
      app_url: '',
      description: '',
      logo_url: '',
      primary_color: '#3B82F6',
      permissions: [],
      max_users: 1000,
      is_public: false,
      webhook_url: '',
      allowed_origins: []
    });
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-400/20 rounded-lg">
              <Link className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Add New App Integration</h2>
              <p className="text-sm text-gray-400">Connect external apps to Stream-line AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Globe className="h-5 w-5 text-blue-400 mr-2" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      App Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.app_name}
                      onChange={(e) => handleInputChange('app_name', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="My Awesome App"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      App Domain *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.app_domain}
                      onChange={(e) => handleInputChange('app_domain', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="myapp.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    App URL
                  </label>
                  <input
                    type="url"
                    value={formData.app_url}
                    onChange={(e) => handleInputChange('app_url', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="https://myapp.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Brief description of what your app does..."
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Shield className="h-5 w-5 text-green-400 mr-2" />
                  Permissions *
                </h3>
                <p className="text-sm text-gray-400">
                  Select what your app needs access to. Choose only what's necessary for security.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => {
                    const Icon = permission.icon;
                    const isSelected = formData.permissions.includes(permission.id);
                    
                    return (
                      <div
                        key={permission.id}
                        onClick={() => handlePermissionToggle(permission.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${
                            isSelected ? 'text-cyan-400' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                              />
                              <span className={`font-medium ${
                                isSelected ? 'text-cyan-400' : 'text-white'
                              }`}>
                                {permission.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Settings className="h-5 w-5 text-purple-400 mr-2" />
                  Advanced Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Users
                    </label>
                    <input
                      type="number"
                      value={formData.max_users}
                      onChange={(e) => handleInputChange('max_users', parseInt(e.target.value) || 1000)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => handleInputChange('is_public', e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                    />
                    <label htmlFor="is_public" className="text-sm font-medium text-gray-300">
                      Public App (listed in directory)
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.permissions.length === 0}
                  className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Integration'}
                </button>
              </div>
            </form>
          ) : (
            /* Success Step */
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">Integration Created Successfully!</h3>
              <p className="text-gray-400 mb-6">
                Your app integration has been created and is pending approval.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                
                <div className="text-sm text-gray-400">
                  <p>Need to manage integrations?</p>
                  <a
                    href="/admin/cross-app"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Go to Cross-App Admin Panel
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossAppIntegrationModal;
