'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Target, Calendar, CheckCircle, AlertCircle, Trash2, Plus } from 'lucide-react';
import { Milestone } from '@/types';

interface MilestoneManagerProps {
  milestones: Milestone[];
  onMilestonesChange: (milestones: Milestone[]) => void;
  isEditing: boolean;
}

export const MilestoneManager = memo<MilestoneManagerProps>(({
  milestones,
  onMilestonesChange,
  isEditing
}) => {
  const handleAddMilestone = useCallback(() => {
    const newMilestone: Milestone = {
      name: '',
      description: '',
      completed: false,
      due_date: ''
    };
    onMilestonesChange([...milestones, newMilestone]);
  }, [milestones, onMilestonesChange]);

  const handleUpdateMilestone = useCallback((index: number, field: keyof Milestone, value: any) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
    onMilestonesChange(updatedMilestones);
  }, [milestones, onMilestonesChange]);

  const handleRemoveMilestone = useCallback((index: number) => {
    const filteredMilestones = milestones.filter((_, i) => i !== index);
    onMilestonesChange(filteredMilestones);
  }, [milestones, onMilestonesChange]);

  const handleRemoveAllMilestones = useCallback(() => {
    onMilestonesChange([]);
  }, [onMilestonesChange]);

  const completedCount = useMemo(() => 
    milestones.filter(m => m.completed).length, [milestones]
  );

  const progressPercentage = useMemo(() => 
    milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0, 
    [completedCount, milestones.length]
  );

  if (!isEditing && milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No milestones defined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-medium text-gray-900">Milestones</h4>
          {milestones.length > 0 && (
            <span className="text-sm text-gray-500">
              ({completedCount} of {milestones.length} completed)
            </span>
          )}
        </div>
        {isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddMilestone}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
            {milestones.length > 0 && (
              <button
                onClick={handleRemoveAllMilestones}
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
      {milestones.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {/* Completion Checkbox */}
              <div className="flex-shrink-0 pt-1">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={(e) => handleUpdateMilestone(index, 'completed', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                ) : (
                  <div className="w-4 h-4">
                    {milestone.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Milestone Content */}
              <div className="flex-1 space-y-3">
                {/* Name */}
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={milestone.name || ''}
                      onChange={(e) => handleUpdateMilestone(index, 'name', e.target.value)}
                      placeholder="Milestone name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <h5 className={`font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {milestone.name || 'Unnamed milestone'}
                    </h5>
                  )}
                </div>

                {/* Description */}
                <div>
                  {isEditing ? (
                    <textarea
                      value={milestone.description || ''}
                      onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                      placeholder="Milestone description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className={`text-sm ${milestone.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {milestone.description || 'No description provided'}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="date"
                      value={milestone.due_date || ''}
                      onChange={(e) => handleUpdateMilestone(index, 'due_date', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <span className={`text-sm ${milestone.due_date ? 'text-gray-600' : 'text-gray-400'}`}>
                      {milestone.due_date ? `Due: ${milestone.due_date}` : 'No due date set'}
                    </span>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              {isEditing && (
                <button
                  onClick={() => handleRemoveMilestone(index)}
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

MilestoneManager.displayName = 'MilestoneManager';
