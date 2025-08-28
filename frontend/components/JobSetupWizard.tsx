'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Palette, 
  Globe, 
  Github, 
  Facebook, 
  Linkedin, 
  Instagram, 
  Twitter, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  Rocket,
  X
} from 'lucide-react';
import { api } from '@/lib/https';
import { 
  JobCreateRequest,
  FileUpload as FileUploadType,
  JobSetupData
} from '@/types';

interface JobSetupWizardProps {
  onComplete: (data: JobSetupData) => void;
  onClose?: () => void;
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Marketing', 'Consulting', 'Legal', 'Food & Beverage', 'Travel',
  'Entertainment', 'Non-Profit', 'Other'
];

const PROJECT_TYPES = [
  'Website Development', 'Mobile App', 'E-commerce Platform', 'Business Automation',
  'Data Analytics Dashboard', 'CRM System', 'Marketing Automation', 'AI Integration',
  'Cloud Migration', 'API Development', 'Custom Software', 'Other'
];

const BUDGET_RANGES = [
  '$5,000 - $10,000', '$10,000 - $25,000', '$25,000 - $50,000',
  '$50,000 - $100,000', '$100,000+', 'To be discussed'
];

const TIMELINES = [
  '1-2 months', '3-4 months', '5-6 months', '7-12 months', '1+ year', 'Flexible'
];

const BRAND_STYLES = [
  'Modern & Minimalist', 'Professional & Corporate', 'Creative & Artistic',
  'Bold & Energetic', 'Elegant & Sophisticated', 'Friendly & Approachable',
  'Tech-Savvy & Innovative', 'Traditional & Trustworthy', 'Luxury & Premium'
];

export default function JobSetupWizard({ onComplete, onClose }: JobSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  const [formData, setFormData] = useState<JobSetupData>({
    // Business Information
    business_name: '',
    business_type: '',
    industry: '',
    description: '',
    
    // Project Details
    project_title: '',
    project_description: '',
    project_goals: '',
    target_audience: '',
    timeline: '',
    budget_range: '',
    
    // Branding & Design
    brand_colors: [],
    brand_style: '',
    logo_files: [],
    brand_guidelines: '',
    
    // Resources & Links
    website_url: '',
    github_url: '',
    social_media: {},
    
    // Additional Files
    project_files: [],
    reference_files: [],
    requirements_doc: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileUploadType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFormData = (field: keyof JobSetupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post<FileUploadType[]>('/upload', formData);
      
      if (response) {
        setUploadedFiles(prev => [...prev, ...response]);
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleComplete = () => {
    // Transform the wizard data into the format expected by the parent
    const jobData: JobSetupData = {
      ...formData,
      logo_files: uploadedFiles.filter(f => f.mime_type.startsWith('image/')).map(f => f.id),
      project_files: uploadedFiles.filter(f => !f.mime_type.startsWith('image/')).map(f => f.id)
    };
    
    onComplete(jobData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.business_name && formData.business_type && formData.industry;
      case 2:
        return formData.project_title && formData.project_description && formData.project_goals;
      case 3:
        return formData.brand_style && formData.brand_colors.length > 0;
      case 4:
        return formData.website_url || formData.github_url || Object.keys(formData.social_media).length > 0;
      case 5:
        return true; // Final step, can always proceed
      default:
        return false;
    }
  };

  const getStepProgress = () => {
    return (currentStep / totalSteps) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Rocket className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Job Setup Wizard</h2>
              <p className="text-white/60 text-sm">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-white/20">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Business Information</h3>
                  <p className="text-white/60">Tell us about your business and industry</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Business Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => updateFormData('business_name', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Business Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.business_type}
                      onChange={(e) => updateFormData('business_type', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select business type</option>
                      {PROJECT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Industry <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => updateFormData('industry', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Business Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your business"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Project Details</h3>
                  <p className="text-white/60">Describe your project goals and requirements</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.project_title}
                      onChange={(e) => updateFormData('project_title', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., E-commerce Website Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.project_description}
                      onChange={(e) => updateFormData('project_description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detailed description of what you want to build"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project Goals <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.project_goals}
                      onChange={(e) => updateFormData('project_goals', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What do you want to achieve with this project?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={formData.target_audience}
                        onChange={(e) => updateFormData('target_audience', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Small business owners, 25-45 years old"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Timeline
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => updateFormData('timeline', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select timeline</option>
                        {TIMELINES.map(timeline => (
                          <option key={timeline} value={timeline}>{timeline}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Budget Range
                      </label>
                      <select
                        value={formData.budget_range}
                        onChange={(e) => updateFormData('budget_range', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select budget range</option>
                        {BUDGET_RANGES.map(budget => (
                          <option key={budget} value={budget}>{budget}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palette className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Branding & Design</h3>
                  <p className="text-white/60">Define your brand style and visual preferences</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Brand Style <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.brand_style}
                      onChange={(e) => updateFormData('brand_style', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select brand style</option>
                      {BRAND_STYLES.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Brand Colors <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            const colors = formData.brand_colors.includes(color)
                              ? formData.brand_colors.filter(c => c !== color)
                              : [...formData.brand_colors, color];
                            updateFormData('brand_colors', colors);
                          }}
                          className={`w-16 h-16 rounded-lg border-2 transition-all ${
                            formData.brand_colors.includes(color)
                              ? 'border-white scale-110'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      Selected: {formData.brand_colors.length} colors
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Brand Guidelines
                    </label>
                    <textarea
                      value={formData.brand_guidelines}
                      onChange={(e) => updateFormData('brand_guidelines', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any specific brand guidelines or preferences"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Logo Files
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Upload className="h-4 w-4 text-white" />
                        <span className="text-white">Upload Logo Files</span>
                      </button>
                      <p className="text-white/60 text-sm mt-2">
                        PNG, JPG, SVG up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Resources & Links</h3>
                  <p className="text-white/60">Provide relevant URLs and social media</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => updateFormData('website_url', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        GitHub Repository
                      </label>
                      <input
                        type="url"
                        value={formData.github_url}
                        onChange={(e) => updateFormData('github_url', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Social Media
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'facebook', icon: Facebook, label: 'Facebook' },
                        { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                        { key: 'instagram', icon: Instagram, label: 'Instagram' },
                        { key: 'twitter', icon: Twitter, label: 'Twitter' }
                      ].map(({ key, icon: Icon, label }) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            {label}
                          </label>
                          <input
                            type="url"
                            value={formData.social_media[key as keyof typeof formData.social_media] || ''}
                            onChange={(e) => updateFormData('social_media', {
                              ...formData.social_media,
                              [key]: e.target.value
                            })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`${label} URL`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Additional Files</h3>
                  <p className="text-white/60">Upload project files and requirements</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project Files
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 mx-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Upload className="h-4 w-4 text-white" />
                        <span className="text-white">Upload Project Files</span>
                      </button>
                      <p className="text-white/60 text-sm mt-2">
                        Any relevant project files, documents, or assets
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Requirements Document
                    </label>
                    <textarea
                      value={formData.requirements_doc}
                      onChange={(e) => updateFormData('requirements_doc', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detailed requirements, specifications, or additional notes"
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Uploaded Files ({uploadedFiles.length})
                      </label>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-white/60" />
                              <span className="text-white text-sm">{file.original_filename}</span>
                            </div>
                            <span className="text-white/60 text-xs">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-white/20">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
