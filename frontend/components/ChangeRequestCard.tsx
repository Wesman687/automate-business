'use client';

import React, { useState } from 'react';
import { AlertCircle, Clock, CheckCircle, X, Edit3, User, Calendar, ArrowRight } from 'lucide-react';
import { CustomerChangeRequest } from '@/types';

interface ChangeRequest extends CustomerChangeRequest {
  customer_id: number; // Map user_id to customer_id for compatibility
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'; // Override string type
  priority: 'low' | 'normal' | 'high' | 'urgent'; // Override JobPriority enum
  customer_name?: string;
  job_title?: string;
  session_id?: string;
}

interface ChangeRequestCardProps {
  request: ChangeRequest;
  showJobInfo?: boolean;
  onStatusUpdate?: (requestId: number, newStatus: string) => void;
  onEdit?: (request: ChangeRequest) => void;
  onView?: (request: ChangeRequest) => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle,
  rejected: X
};

export default function ChangeRequestCard({ 
  request, 
  showJobInfo = false, 
  onStatusUpdate, 
  onEdit, 
  onView 
}: ChangeRequestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const StatusIcon = statusIcons[request.status];
  
  const handleStatusChange = async (newStatus: string) => {
    if (onStatusUpdate && !isUpdating) {
      setIsUpdating(true);
      await onStatusUpdate(request.id, newStatus);
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {request.title}
          </h3>
          
          {showJobInfo && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <User className="h-4 w-4 mr-1" />
              <span className="mr-4">{request.customer_name}</span>
              <ArrowRight className="h-4 w-4 mr-1" />
              <span>{request.job_title}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {request.status.replace('_', ' ').toUpperCase()}
            </span>
            
            {/* Priority Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[request.priority]}`}>
              {request.priority.toUpperCase()}
            </span>
            
            {/* Source Badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              {request.requested_via.toUpperCase()}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(request)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit request"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {request.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(request.created_at)}
        </div>
        
        {/* Status Update Buttons */}
        {onStatusUpdate && request.status === 'pending' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={isUpdating}
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Start Work
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating}
              className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
        
        {onStatusUpdate && request.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={isUpdating}
            className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Complete
          </button>
        )}
        
        {onView && (
          <button
            onClick={() => onView(request)}
            className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
