import React, { useState } from "react";
import { X, Link, Globe, Shield } from "lucide-react";
import { message } from "antd";
import { api } from "@/lib/https";

interface CrossAppIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppFormData {
  app_name: string;
  app_domain: string;
  description?: string;
  permissions: string[];
  is_public: boolean;
}

const CrossAppIntegrationModal: React.FC<CrossAppIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<AppFormData>({
    app_name: "",
    app_domain: "",
    description: "",
    permissions: [
      "read_user_info",
      "read_credits",
      "purchase_credits",
      "consume_credits",
      "manage_subscriptions",
      "read_analytics",
    ],
    is_public: true,
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const availablePermissions = [
    {
      id: "read_user_info",
      label: "Read User Info",
      description: "Access basic user profile information",
      icon: Shield,
    },
    {
      id: "read_credits",
      label: "Read Credits",
      description: "Check user credit balance",
      icon: Shield,
    },
    {
      id: "purchase_credits",
      label: "Purchase Credits",
      description: "Allow users to buy credits through your app",
      icon: Shield,
    },
    {
      id: "consume_credits",
      label: "Consume Credits",
      description: "Use shared credits for your app services",
      icon: Shield,
    },
    {
      id: "manage_subscriptions",
      label: "Manage Subscriptions",
      description: "Handle user subscriptions across apps",
      icon: Shield,
    },
    {
      id: "read_analytics",
      label: "Read Analytics",
      description: "Access usage analytics across connected apps",
      icon: Shield,
    },
  ];

  const connectedApps = [
    {
      id: 1,
      name: "Video Converter",
      domain: "converter.streamlineai.com",
      status: "active",
      credits_used: 15420,
      last_active: "2 hours ago",
    },
  ];

  const handleInputChange = (field: keyof AppFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post("/admin/cross-app/integrations", {
        ...formData,
        app_url: `https://${formData.app_domain}`,
        webhook_url: `https://${formData.app_domain}/apphook`,
      });

      message.success("App integration created successfully!");
      message.info(`API Key: ${result.api_key} - Save this securely!`);
      setStep(2);
    } catch (error) {
      console.error("Error creating integration:", error);
      message.error("Error creating integration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      app_name: "",
      app_domain: "",
      description: "",
      permissions: [
        "read_user_info",
        "read_credits",
        "purchase_credits",
        "consume_credits",
        "manage_subscriptions",
        "read_analytics",
      ],
      is_public: true,
    });
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto hover:border-electric-blue/50 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-electric-blue/20 rounded-lg border border-electric-blue/30">
              <Link className="h-6 w-6 text-electric-blue" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-300">
                Cross-App Integration Manager
              </h2>
              <p className="text-sm text-gray-500">
                Manage applications that share authentication and credits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300 flex items-center">
                  <Globe className="h-5 w-5 text-electric-blue mr-2" />
                  App Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.app_name}
                    onChange={(e) =>
                      handleInputChange("app_name", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-200 hover:border-electric-blue/50"
                    placeholder="e.g., Scraper, Videos, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    App Domain *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.app_domain}
                    onChange={(e) =>
                      handleInputChange("app_domain", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-200 hover:border-electric-blue/50"
                    placeholder="e.g., scraper.stream-lineai.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used as: https://{formData.app_domain || "app"}
                    .stream-lineai.com
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-200 hover:border-electric-blue/50 resize-none"
                    placeholder="Brief description of what your app does..."
                  />
                </div>
              </div>

              {/* Permissions Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300 flex items-center">
                  <Shield className="h-5 w-5 text-neon-green mr-2" />
                  Permissions
                </h3>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-4 hover:border-electric-blue/50 transition-all duration-200">
                  <p className="text-sm text-gray-400 mb-3">
                    All permissions are automatically granted since these are
                    your own apps.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                        <span className="text-gray-300">
                          {permission.label}
                        </span>
                        <span className="text-gray-500 text-xs">
                          - {permission.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors hover:bg-white/5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    loading || !formData.app_name || !formData.app_domain
                  }
                  className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-electric-blue/30"
                >
                  {loading ? "Creating..." : "Create Integration"}
                </button>
              </div>
            </form>
          ) : (
            /* Success Step */
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mb-4 border border-neon-green/30">
                <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                Integration Created Successfully!
              </h3>
              <p className="text-gray-500 mb-6">
                Your app integration has been created and is ready to use.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-black font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-electric-blue/30"
                >
                  Close
                </button>

                <div className="text-sm text-gray-500">
                  <p>Need to manage integrations?</p>
                  <a
                    href="/admin/cross-app"
                    className="text-electric-blue hover:text-electric-blue/80 underline transition-colors"
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
