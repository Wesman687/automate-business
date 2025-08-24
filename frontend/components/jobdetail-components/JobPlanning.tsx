'use client';

import React, { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle, AlertCircle, Trash2, Plus, Sparkles, FileText } from 'lucide-react';
import { api } from '@/lib/https';
import ErrorModal from '../ErrorModal';

import { JobDetailData, Milestone, Deliverable } from '../interfaces/job';

interface JobPlanningProps {
  data: JobDetailData;
  isEditing: boolean;
  editData: JobDetailData;
  setEditData: (data: JobDetailData) => void;
  isCustomer: boolean;
  onSave?: () => void;
}

export default function JobPlanning({ data, isEditing, editData, setEditData, isCustomer, onSave }: JobPlanningProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string; type: 'error' | 'warning' | 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'error'
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTemplateSelector && !(event.target as Element).closest('.template-selector')) {
        setShowTemplateSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTemplateSelector]);

  const handleInputChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const addMilestone = () => {
    const newMilestone = {
      name: '',
      description: '',
      completed: false,
      due_date: ''
    };
    const milestones = [...(editData.milestones || []), newMilestone];
    handleInputChange('milestones', milestones);
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const milestones = [...(editData.milestones || [])];
    milestones[index] = { ...milestones[index], [field]: value };
    handleInputChange('milestones', milestones);
  };

  const removeMilestone = (index: number) => {
    const milestones = (editData.milestones || []).filter((_: any, i: number) => i !== index);
    handleInputChange('milestones', milestones);
  };

  const addDeliverable = () => {
    const newDeliverable = {
      name: '',
      description: '',
      delivered: false,
      date: ''
    };
    const deliverables = [...(editData.deliverables || []), newDeliverable];
    handleInputChange('deliverables', deliverables);
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    const deliverables = [...(editData.deliverables || [])];
    deliverables[index] = { ...deliverables[index], [field]: value };
    handleInputChange('deliverables', deliverables);
  };

  const removeDeliverable = (index: number) => {
    const deliverables = (editData.deliverables || []).filter((_: any, i: number) => i !== index);
    handleInputChange('deliverables', deliverables);
  };

  const removeAllMilestones = () => {
    handleInputChange('milestones', []);
  };

  const removeAllDeliverables = () => {
    handleInputChange('deliverables', []);
  };

  const generateAIPlan = async () => {
    try {
      const response = await api.post('/ai/generate-project-plan', {
        project_type: editData.brand_style || 'General',
        business_type: editData.business_type,
        industry: editData.industry,
        project_goals: editData.project_goals,
        timeline: editData.timeline
      });

      if (response.data.milestones && response.data.deliverables) {
        handleInputChange('milestones', response.data.milestones);
        handleInputChange('deliverables', response.data.deliverables);
        setErrorModal({
          show: true,
          message: 'AI project plan generated successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setErrorModal({
        show: true,
        message: 'Failed to generate AI project plan. Please try again.',
        type: 'error'
      });
    }
  };

  const selectTemplate = (template: string) => {
    const templates: any = {
      'Landing Page': {
        milestones: [
          { name: 'Design Phase', description: 'Create wireframes and mockups', completed: false, due_date: '' },
          { name: 'Development', description: 'Build responsive landing page', completed: false, due_date: '' },
          { name: 'Content Creation', description: 'Write compelling copy and create visuals', completed: false, due_date: '' },
          { name: 'Testing & Launch', description: 'Test functionality and deploy', completed: false, due_date: '' }
        ],
        deliverables: [
          { name: 'Design Mockups', description: 'High-fidelity design files', delivered: false, date: undefined },
          { name: 'Responsive Website', description: 'Fully functional landing page', delivered: false, date: undefined },
          { name: 'Content Package', description: 'Copy, images, and branding elements', delivered: false, date: undefined },
          { name: 'Launch Report', description: 'Performance metrics and analytics', delivered: false, date: undefined }
        ]
      },
      'E-commerce Store': {
        milestones: [
          { name: 'Platform Selection', description: 'Choose and configure e-commerce platform', completed: false, due_date: '' },
          { name: 'Product Setup', description: 'Configure products, categories, and inventory', completed: false, due_date: '' },
          { name: 'Payment Integration', description: 'Set up payment gateways and security', completed: false, due_date: '' },
          { name: 'Testing & Launch', description: 'Test all functionality and go live', completed: false, due_date: '' }
        ],
        deliverables: [
          { name: 'E-commerce Platform', description: 'Configured online store', delivered: false, date: undefined },
          { name: 'Product Catalog', description: 'Organized product structure', delivered: false, date: undefined },
          { name: 'Payment System', description: 'Secure payment processing', delivered: false, date: undefined },
          { name: 'Launch Documentation', description: 'Store management guide', delivered: false, date: undefined }
        ]
      },
      'Web Application': {
        milestones: [
          { name: 'Requirements Analysis', description: 'Define features and user stories', completed: false, due_date: '' },
          { name: 'Architecture Design', description: 'Plan system structure and database', completed: false, due_date: '' },
          { name: 'Development Phase', description: 'Build core functionality', completed: false, due_date: '' },
          { name: 'Testing & Deployment', description: 'QA testing and production deployment', completed: false, due_date: '' }
        ],
        deliverables: [
          { name: 'Requirements Document', description: 'Detailed feature specifications', delivered: false, date: undefined },
          { name: 'System Architecture', description: 'Technical design documentation', delivered: false, date: undefined },
          { name: 'Web Application', description: 'Fully functional web app', delivered: false, date: undefined },
          { name: 'Deployment Guide', description: 'Production deployment instructions', delivered: false, date: undefined }
        ]
      }
    };

    if (templates[template]) {
      handleInputChange('milestones', templates[template].milestones);
      handleInputChange('deliverables', templates[template].deliverables);
      setShowTemplateSelector(false);
      setErrorModal({
        show: true,
        message: `${template} template applied successfully!`,
        type: 'success'
      });
    }
  };

  const updateMilestoneStatus = async (index: number, completed: boolean) => {
    try {
      const milestone = editData.milestones[index];
      if (milestone.id) {
        await api.put(`/jobs/milestones/${milestone.id}`, { completed });
        if (onSave) onSave();
      } else {
        // Update local state for new milestones
        updateMilestone(index, 'completed', completed);
      }
      setErrorModal({
        show: true,
        message: `Milestone ${completed ? 'marked as complete' : 'marked as incomplete'}!`,
        type: 'success'
      });
    } catch (error) {
      setErrorModal({
        show: true,
        message: 'Failed to update milestone status.',
        type: 'error'
      });
    }
  };

  const updateDeliverableStatus = async (index: number, delivered: boolean) => {
    try {
      const deliverable = editData.deliverables[index];
      if (deliverable.id) {
        await api.put(`/jobs/deliverables/${deliverable.id}`, { delivered });
        if (onSave) onSave();
      } else {
        // Update local state for new deliverables
        updateDeliverable(index, 'delivered', delivered);
      }
      setErrorModal({
        show: true,
        message: `Deliverable ${delivered ? 'marked as delivered' : 'marked as undelivered'}!`,
        type: 'success'
      });
    } catch (error) {
      setErrorModal({
        show: true,
        message: 'Failed to update deliverable status.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Planning</h3>
      </div>

      {/* Project Planning Tools - Admin Only */}
      {!isCustomer && (
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-3">Project Planning Tools</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Templates</span>
            </button>
            <button
              onClick={generateAIPlan}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Plan</span>
            </button>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div className="mt-3 template-selector">
              <div className="bg-white rounded-md border border-orange-200 p-3">
                <h5 className="text-sm font-medium text-orange-800 mb-2">Select Template:</h5>
                <div className="space-y-2">
                  {['Landing Page', 'E-commerce Store', 'Web Application'].map((template) => (
                    <button
                      key={template}
                      onClick={() => selectTemplate(template)}
                      className="block w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-50 rounded"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Milestones</h4>
          {isEditing && (
            <div className="flex space-x-2">
              {(editData.milestones || []).length > 0 && (
                <button
                  onClick={removeAllMilestones}
                  className="flex items-center space-x-1 px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove All</span>
                </button>
              )}
              <button
                onClick={addMilestone}
                className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {(editData.milestones || []).map((milestone: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Milestone name"
                      />
                      <textarea
                        value={milestone.description || ''}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Description"
                        rows={2}
                      />
                      <input
                        type="date"
                        value={milestone.due_date || ''}
                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </>
                  ) : (
                    <>
                      <h5 className="font-medium text-gray-900">{milestone.name}</h5>
                      {milestone.description && (
                        <p className="text-gray-600">{milestone.description}</p>
                      )}
                      {milestone.due_date && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {milestone.due_date}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  {isEditing && (
                    <button
                      onClick={() => removeMilestone(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {!isCustomer && !isEditing && (
                    <button
                      onClick={() => updateMilestoneStatus(index, !milestone.completed)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        milestone.completed
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {milestone.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(editData.milestones || []).length === 0 && (
            <p className="text-gray-500 text-center py-4">No milestones defined yet.</p>
          )}
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Deliverables</h4>
          {isEditing && (
            <div className="flex space-x-2">
              {(editData.deliverables || []).length > 0 && (
                <button
                  onClick={removeAllDeliverables}
                  className="flex items-center space-x-1 px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove All</span>
                </button>
              )}
              <button
                onClick={addDeliverable}
                className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Deliverable</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {(editData.deliverables || []).map((deliverable: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {deliverable.delivered ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={deliverable.name}
                        onChange={(e) => updateDeliverable(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Deliverable name"
                      />
                      <textarea
                        value={deliverable.description || ''}
                        onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Description"
                        rows={2}
                      />
                      <input
                        type="date"
                        value={deliverable.date || ''}
                        onChange={(e) => updateDeliverable(index, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </>
                  ) : (
                    <>
                      <h5 className="font-medium text-gray-900">{deliverable.name}</h5>
                      {deliverable.description && (
                        <p className="text-gray-600">{deliverable.description}</p>
                      )}
                      {deliverable.date && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {deliverable.date}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  {isEditing && (
                    <button
                      onClick={() => removeDeliverable(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {!isCustomer && !isEditing && (
                    <button
                      onClick={() => updateDeliverableStatus(index, !deliverable.delivered)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        deliverable.delivered
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {deliverable.delivered ? 'Mark Undelivered' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(editData.deliverables || []).length === 0 && (
            <p className="text-gray-500 text-center py-4">No deliverables defined yet.</p>
          )}
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ ...errorModal, show: false })}
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  );
}
