'use client';

import React, { memo, useMemo } from 'react';
import { Target, FileText, Calendar, TrendingUp } from 'lucide-react';
import { Job } from '../interfaces/job';

interface PlanningOverviewProps {
  jobData: Job;
}

export const PlanningOverview = memo<PlanningOverviewProps>(({ jobData }) => {
  const milestones = jobData.milestones || [];
  const deliverables = jobData.deliverables || [];

  const milestoneStats = useMemo(() => {
    const completed = milestones.filter(m => m.completed).length;
    const total = milestones.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, progress };
  }, [milestones]);

  const deliverableStats = useMemo(() => {
    const delivered = deliverables.filter(d => d.delivered).length;
    const total = deliverables.length;
    const progress = total > 0 ? (delivered / total) * 100 : 0;
    
    return { delivered, total, progress };
  }, [deliverables]);

  const overallProgress = useMemo(() => {
    const totalItems = milestoneStats.total + deliverableStats.total;
    if (totalItems === 0) return 0;
    
    const completedItems = milestoneStats.completed + deliverableStats.delivered;
    return (completedItems / totalItems) * 100;
  }, [milestoneStats, deliverableStats]);

  if (milestones.length === 0 && deliverables.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Planning Data</h3>
        <p className="text-gray-600">
          This project doesn't have any milestones or deliverables defined yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Progress */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round(overallProgress)}%
            </div>
            <div className="text-sm text-gray-600">Overall Complete</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Total Items */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-700 mb-2">
              {milestoneStats.total + deliverableStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>

          {/* Completed Items */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {milestoneStats.completed + deliverableStats.delivered}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Milestones Summary */}
      {milestones.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
            <span className="text-sm text-gray-500">
              ({milestoneStats.completed} of {milestoneStats.total} completed)
            </span>
          </div>
          
          <div className="space-y-3">
            {milestones.slice(0, 3).map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <div className={`w-3 h-3 rounded-full ${
                  milestone.completed ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className={`flex-1 text-sm ${
                  milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                }`}>
                  {milestone.name || 'Unnamed milestone'}
                </span>
                {milestone.due_date && (
                  <span className="text-xs text-gray-500">
                    Due: {milestone.due_date}
                  </span>
                )}
              </div>
            ))}
            
            {milestones.length > 3 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{milestones.length - 3} more milestones
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deliverables Summary */}
      {deliverables.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
            <span className="text-sm text-gray-500">
              ({deliverableStats.delivered} of {deliverableStats.total} delivered)
            </span>
          </div>
          
          <div className="space-y-3">
            {deliverables.slice(0, 3).map((deliverable, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <div className={`w-3 h-3 rounded-full ${
                  deliverable.delivered ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className={`flex-1 text-sm ${
                  deliverable.delivered ? 'text-gray-500 line-through' : 'text-gray-700'
                }`}>
                  {deliverable.name || 'Unnamed deliverable'}
                </span>
                {deliverable.date && (
                  <span className="text-xs text-gray-500">
                    Delivered: {deliverable.date}
                  </span>
                )}
              </div>
            ))}
            
            {deliverables.length > 3 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{deliverables.length - 3} more deliverables
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Summary */}
      {(jobData.start_date || jobData.deadline) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobData.start_date && (
              <div className="text-center p-3 bg-purple-50 rounded-md">
                <div className="text-sm text-purple-600 font-medium">Start Date</div>
                <div className="text-lg font-semibold text-purple-800">
                  {new Date(jobData.start_date).toLocaleDateString()}
                </div>
              </div>
            )}
            
            {jobData.deadline && (
              <div className="text-center p-3 bg-orange-50 rounded-md">
                <div className="text-sm text-orange-600 font-medium">Deadline</div>
                <div className="text-lg font-semibold text-orange-800">
                  {new Date(jobData.deadline).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

PlanningOverview.displayName = 'PlanningOverview';
