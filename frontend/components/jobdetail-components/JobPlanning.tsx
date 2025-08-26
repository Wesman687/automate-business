'use client';

import React, { useCallback } from 'react';
import { Target, Calendar, CheckCircle, AlertCircle, Trash2, Plus, Sparkles, FileText } from 'lucide-react';
import { Job } from '../interfaces/job';
import { MilestoneManager } from './MilestoneManager';
import { DeliverableManager } from './DeliverableManager';
import { AIPlanGenerator } from './AIPlanGenerator';
import { PlanningOverview } from './PlanningOverview';

interface JobPlanningProps {
  data: Job;
  isEditing: boolean;
  editData: Job;
  setEditData: (data: Job) => void;
  isCustomer: boolean;
  onSave?: () => void;
}

export default function JobPlanning({ data, isEditing, editData, setEditData, isCustomer, onSave }: JobPlanningProps) {
  const handleMilestonesChange = useCallback((milestones: any[]) => {
    setEditData({ ...editData, milestones });
  }, [editData, setEditData]);

  const handleDeliverablesChange = useCallback((deliverables: any[]) => {
    setEditData({ ...editData, deliverables });
  }, [editData, setEditData]);

  const handleAIPlanGenerated = useCallback((plan: any) => {
    // Handle AI plan response - could update milestones and deliverables
    console.log('AI plan generated:', plan);
    // You could implement logic here to apply the AI-generated plan
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Target className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Project Planning</h3>
      </div>

      {/* AI Plan Generator */}
      <AIPlanGenerator 
        jobData={editData}
        onPlanGenerated={handleAIPlanGenerated}
        isCustomer={isCustomer}
      />

      {/* Planning Overview */}
      <PlanningOverview jobData={data} />

      {/* Milestones Management */}
      <MilestoneManager
        milestones={editData.milestones || []}
        onMilestonesChange={handleMilestonesChange}
        isEditing={isEditing}
      />

      {/* Deliverables Management */}
      <DeliverableManager
        deliverables={editData.deliverables || []}
        onDeliverablesChange={handleDeliverablesChange}
        isEditing={isEditing}
      />
    </div>
  );
}
