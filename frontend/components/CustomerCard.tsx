'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Edit, 
  Eye, 
  FileText,
  Download,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { api } from '@/lib/https';

interface Customer {
  id: number;
  user_id: number;
  email: string;
  name: string;
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
  created_at: string;
  updated_at?: string;
}

interface CustomerCardProps {
  customer: Customer;
  showActions?: boolean;
  onEdit?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
  onDelete?: (customerId: number) => void;
  className?: string;
}

export default function CustomerCard({ 
  customer, 
  showActions = true, 
  onEdit, 
  onView, 
  onDelete,
  className = ""
}: CustomerCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadFiles = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/file-upload/files?customer_id=${customer.user_id}`);
      if (response.files && response.files.length > 0) {
        // Create a zip file or download individual files
        console.log('Files to download:', response.files);
        // TODO: Implement file download logic
      }
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getStatusText = (status: string) => {
    return status || 'Active';
  };

  return (
    <div className={`bg-dark-card rounded-xl shadow-lg border border-dark-border overflow-hidden hover:border-electric-blue hover:shadow-xl hover:shadow-electric-blue/20 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-electric-blue to-red-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {customer.name || customer.email.split('@')[0]}
              </h3>
              <p className="text-black/80 text-sm font-medium">
                Customer
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-black/80 hover:text-black hover:bg-black/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card rounded-lg shadow-xl border border-dark-border py-2 z-10">
                  {onView && (
                    <button
                      onClick={() => {
                        onView(customer);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-border hover:text-white flex items-center space-x-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  )}
                  
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(customer);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-border hover:text-white flex items-center space-x-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Customer</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleDownloadFiles}
                    disabled={downloading}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-border hover:text-white flex items-center space-x-2 disabled:opacity-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloading ? 'Downloading...' : 'Download Files'}</span>
                  </button>
                  
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this customer?')) {
                          onDelete(customer.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center space-x-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Customer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-300">
            <Mail className="w-4 h-4 text-electric-blue" />
            <span className="text-sm">{customer.email}</span>
          </div>
          
          {customer.phone && (
            <div className="flex items-center space-x-3 text-gray-300">
              <Phone className="w-4 h-4 text-red-500" />
              <span className="text-sm">{customer.phone}</span>
            </div>
          )}
          
          {customer.business_type && (
            <div className="flex items-center space-x-3 text-gray-300">
              <Building className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{customer.business_type}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3 text-gray-300">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span className="text-sm">Joined {formatDate(customer.created_at)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
            {getStatusText(customer.status)}
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500">
            <FileText className="w-4 h-4" />
            <span className="text-xs">Files: 0</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-dark-bg border-t border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Last active: Today</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {onView && (
                <button
                  onClick={() => onView(customer)}
                  className="px-3 py-1 text-xs bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors font-medium"
                >
                  View
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(customer)}
                  className="px-3 py-1 text-xs bg-dark-border text-gray-300 rounded-lg hover:bg-dark-border/80 hover:text-white transition-colors font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
