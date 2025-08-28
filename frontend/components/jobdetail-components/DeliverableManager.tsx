'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { FileText, Calendar, CheckCircle, AlertCircle, Trash2, Plus } from 'lucide-react';
import { Deliverable } from '@/types';

interface DeliverableManagerProps {
  deliverables: Deliverable[];
  onDeliverablesChange: (deliverables: Deliverable[]) => void;
  isEditing: boolean;
}

export const DeliverableManager = memo<DeliverableManagerProps>(({
  deliverables,
  onDeliverablesChange,
  isEditing
}) => {
  const handleAddDeliverable = useCallback(() => {
    const newDeliverable: Deliverable = {
      name: '',
      description: '',
      delivered: false,
      date: ''
    };
    onDeliverablesChange([...deliverables, newDeliverable]);
  }, [deliverables, onDeliverablesChange]);

  const handleUpdateDeliverable = useCallback((index: number, field: keyof Deliverable, value: any) => {
    const updatedDeliverables = [...deliverables];
    updatedDeliverables[index] = { ...updatedDeliverables[index], [field]: value };
    onDeliverablesChange(updatedDeliverables);
  }, [deliverables, onDeliverablesChange]);

  const handleRemoveDeliverable = useCallback((index: number) => {
    const filteredDeliverables = deliverables.filter((_, i) => i !== index);
    onDeliverablesChange(filteredDeliverables);
  }, [deliverables, onDeliverablesChange]);

  const handleRemoveAllDeliverables = useCallback(() => {
    onDeliverablesChange([]);
  }, [onDeliverablesChange]);

  const deliveredCount = useMemo(() => 
    deliverables.filter(d => d.delivered).length, [deliverables]
  );

  const progressPercentage = useMemo(() => 
    deliverables.length > 0 ? (deliveredCount / deliverables.length) * 100 : 0, 
    [deliveredCount, deliverables.length]
  );

  if (!isEditing && deliverables.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No deliverables defined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h4 className="text-lg font-medium text-gray-900">Deliverables</h4>
          {deliverables.length > 0 && (
            <span className="text-sm text-gray-500">
              ({deliveredCount} of {deliverables.length} delivered)
            </span>
          )}
        </div>
        {isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddDeliverable}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deliverable</span>
            </button>
            {deliverables.length > 0 && (
              <button
                onClick={handleRemoveAllDeliverables}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {deliverables.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Deliverables List */}
      <div className="space-y-3">
        {deliverables.map((deliverable, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {/* Delivery Status */}
              <div className="flex-shrink-0 pt-1">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={deliverable.delivered}
                    onChange={(e) => handleUpdateDeliverable(index, 'delivered', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                ) : (
                  <div className="w-4 h-4">
                    {deliverable.delivered ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Deliverable Content */}
              <div className="flex-1 space-y-3">
                {/* Name */}
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={deliverable.name || ''}
                      onChange={(e) => handleUpdateDeliverable(index, 'name', e.target.value)}
                      placeholder="Deliverable name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <h5 className={`font-medium ${deliverable.delivered ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {deliverable.name || 'Unnamed deliverable'}
                    </h5>
                  )}
                </div>

                {/* Description */}
                <div>
                  {isEditing ? (
                    <textarea
                      value={deliverable.description || ''}
                      onChange={(e) => handleUpdateDeliverable(index, 'description', e.target.value)}
                      placeholder="Deliverable description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className={`text-sm ${deliverable.delivered ? 'text-gray-400' : 'text-gray-600'}`}>
                      {deliverable.description || 'No description provided'}
                    </p>
                  )}
                </div>

                {/* Delivery Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="date"
                      value={deliverable.date || ''}
                      onChange={(e) => handleUpdateDeliverable(index, 'date', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  ) : (
                    <span className={`text-sm ${deliverable.date ? 'text-gray-600' : 'text-gray-400'}`}>
                      {deliverable.date ? `Delivered: ${deliverable.date}` : 'No delivery date set'}
                    </span>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              {isEditing && (
                <button
                  onClick={() => handleRemoveDeliverable(index)}
                  className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DeliverableManager.displayName = 'DeliverableManager';
