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

interface JobSetupData {
  // Business Information
  business_name: string;
  business_type: string;
  industry: string;
  description: string;
  
  // Project Details
  project_title: string;
  project_description: string;
  project_goals: string;
  target_audience: string;
  timeline: string;
  budget_range: string;
  
  // Branding & Design
  brand_colors: string[];
  brand_style: string;
  logo_files: number[];
  brand_guidelines: string;
  
  // Resources & Links
  website_url: string;
  github_url: string;
  social_media: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Additional Files
  project_files: number[];
  reference_files: number[];
  requirements_doc: string;
}

interface FileUpload {
  id: number;
  filename: string;
  original_filename: string;
  file_url: string;
  mime_type: string;
  file_size: number;
}

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

export default function JobSetupWizard({ onComplete, onClose }: JobSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<JobSetupData>({
    business_name: '',
    business_type: '',
    industry: '',
    description: '',
    project_title: '',
    project_description: '',
    project_goals: '',
    target_audience: '',
    timeline: '',
    budget_range: '',
    brand_colors: ['#0088CC', '#EF4444', '#FF6B35'],
    brand_style: '',
    logo_files: [],
    brand_guidelines: '',
    website_url: '',
    github_url: '',
    social_media: {},
    project_files: [],
    reference_files: [],
    requirements_doc: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 6;

  const updateData = (field: keyof JobSetupData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setData(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [platform]: value }
    }));
  };

  const handleFileUpload = async (files: FileList, type: 'logo' | 'project' | 'reference') => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: number[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', type);
        formData.append('description', `${type} file for job setup`);
        
        const response = await api.post('/file-upload/upload', formData);
        
        if (response.file_id) {
          uploadedFiles.push(response.file_id);
        }
        
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Update the appropriate field
      if (type === 'logo') {
        updateData('logo_files', [...data.logo_files, ...uploadedFiles]);
      } else if (type === 'project') {
        updateData('project_files', [...data.project_files, ...uploadedFiles]);
      } else {
        updateData('reference_files', [...data.reference_files, ...uploadedFiles]);
      }

    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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

  const handleComplete = () => {
    onComplete(data);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i + 1} className="flex items-center">
            <motion.div 
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2
                ${i + 1 < currentStep 
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' 
                  : i + 1 === currentStep 
                    ? 'bg-electric-blue border-electric-blue text-black shadow-lg shadow-electric-blue/30' 
                    : 'bg-dark-card border-dark-border text-gray-400'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {i + 1 < currentStep ? <CheckCircle className="w-6 h-6" /> : i + 1}
            </motion.div>
            {i + 1 < totalSteps && (
              <div className={`w-16 h-1 mx-2 ${i + 1 < currentStep ? 'bg-red-500' : 'bg-dark-border'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <p className="text-gray-400">Step {currentStep} of {totalSteps}</p>
      </div>
    </div>
  );

  const renderBusinessInfo = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-electric-blue to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Building2 className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Tell Us About Your Business</h2>
        <p className="text-gray-300 text-lg">Let us start by understanding your business and what makes it unique</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={data.business_name}
            onChange={(e) => updateData('business_name', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Industry *
          </label>
          <select
            value={data.industry}
            onChange={(e) => updateData('industry', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white transition-all duration-200"
          >
            <option value="">Select your industry</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Business Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateData('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Describe your business, what you do, and your mission..."
          />
        </div>
      </div>
    </motion.div>
  );

  const renderProjectDetails = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-red-500 to-electric-blue rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Target className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Project Vision & Goals</h2>
        <p className="text-gray-300 text-lg">Help us understand what you want to achieve with this project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            value={data.project_title}
            onChange={(e) => updateData('project_title', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Give your project a name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Project Type
          </label>
          <select
            value={data.business_type}
            onChange={(e) => updateData('business_type', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white transition-all duration-200"
          >
            <option value="">Select project type</option>
            {PROJECT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Project Description *
          </label>
          <textarea
            value={data.project_description}
            onChange={(e) => updateData('project_description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Describe your project in detail..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Project Goals *
          </label>
          <textarea
            value={data.project_goals}
            onChange={(e) => updateData('project_goals', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="What do you want to achieve? What problems will this solve?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={data.target_audience}
            onChange={(e) => updateData('target_audience', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Who will use this?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Timeline
          </label>
          <select
            value={data.timeline}
            onChange={(e) => updateData('timeline', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white transition-all duration-200"
          >
            <option value="">Select timeline</option>
            {TIMELINES.map(timeline => (
              <option key={timeline} value={timeline}>{timeline}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Budget Range
          </label>
          <select
            value={data.budget_range}
            onChange={(e) => updateData('budget_range', e.target.value)}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white transition-all duration-200"
          >
            <option value="">Select budget range</option>
            {BUDGET_RANGES.map(budget => (
              <option key={budget} value={budget}>{budget}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderBrandingDesign = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Palette className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Branding & Visual Identity</h2>
        <p className="text-gray-300 text-lg">Help us understand your brand style and visual preferences</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Brand Colors
          </label>
          <div className="flex items-center space-x-4">
            {data.brand_colors.map((color, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...data.brand_colors];
                    newColors[index] = e.target.value;
                    updateData('brand_colors', newColors);
                  }}
                  className="w-12 h-12 rounded-lg border-2 border-dark-border cursor-pointer hover:border-electric-blue transition-colors"
                />
                <button
                  onClick={() => {
                    const newColors = data.brand_colors.filter((_, i) => i !== index);
                    updateData('brand_colors', newColors);
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => updateData('brand_colors', [...data.brand_colors, '#000000'])}
              className="px-4 py-2 border-2 border-dashed border-dark-border rounded-lg text-gray-400 hover:border-electric-blue hover:text-electric-blue transition-all duration-200"
            >
              + Add Color
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Brand Style Description
          </label>
          <textarea
            value={data.brand_style}
            onChange={(e) => updateData('brand_style', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Describe your brand style (modern, classic, playful, professional, etc.)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Logo & Brand Assets
          </label>
          <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-electric-blue transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'logo')}
              className="hidden"
            />
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 disabled:opacity-50 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Logo & Brand Files'}</span>
            </motion.button>
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-dark-border rounded-full h-2">
                  <div className="bg-electric-blue h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">Uploading... {Math.round(uploadProgress)}%</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Upload your logo, brand guidelines, or any visual assets
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderResourcesLinks = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Globe className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Resources & Links</h2>
        <p className="text-gray-300 text-lg">Share any existing resources that might help with your project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Website URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={data.website_url}
              onChange={(e) => updateData('website_url', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            GitHub Repository
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={data.github_url}
              onChange={(e) => updateData('github_url', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
              placeholder="https://github.com/username/repo"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Facebook
          </label>
          <div className="relative">
            <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={data.social_media.facebook || ''}
              onChange={(e) => updateSocialMedia('facebook', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            LinkedIn
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={data.social_media.linkedin || ''}
              onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Instagram
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={data.social_media.instagram || ''}
              onChange={(e) => updateSocialMedia('instagram', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Twitter/X
          </label>
          <div className="relative">
            <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={data.social_media.twitter || ''}
              onChange={(e) => updateSocialMedia('twitter', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAdditionalFiles = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-teal-500 to-electric-blue rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <FileText className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Additional Files & Requirements</h2>
        <p className="text-gray-300 text-lg">Upload any additional files that might help us understand your project better</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Project Files
          </label>
          <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-red-500 transition-colors">
            <input
              type="file"
              multiple
              accept="*/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'project')}
              className="hidden"
              id="project-files"
            />
            <label htmlFor="project-files" className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer font-semibold">
              <Upload className="w-5 h-5" />
              <span>Upload Project Files</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Upload any existing project files, specifications, or documentation
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Reference Files
          </label>
          <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              multiple
              accept="*/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'reference')}
              className="hidden"
              id="reference-files"
            />
            <label htmlFor="reference-files" className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer font-semibold">
              <Upload className="w-5 h-5" />
              <span>Upload Reference Files</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Upload examples, inspiration, or reference materials
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Additional Requirements
          </label>
          <textarea
            value={data.requirements_doc}
            onChange={(e) => updateData('requirements_doc', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue text-white placeholder-gray-500 transition-all duration-200"
            placeholder="Any additional requirements, constraints, or special considerations..."
          />
        </div>
      </div>
    </motion.div>
  );

  const renderReview = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Review Your Information</h2>
        <p className="text-gray-300 text-lg">Please review all the information before submitting</p>
      </div>

      <div className="bg-dark-card rounded-lg p-6 space-y-6 border border-dark-border">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-electric-blue" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div><strong className="text-white">Business Name:</strong> {data.business_name || 'Not provided'}</div>
            <div><strong className="text-white">Industry:</strong> {data.industry || 'Not provided'}</div>
            <div className="md:col-span-2"><strong className="text-white">Description:</strong> {data.description || 'Not provided'}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-red-500" />
            Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div><strong className="text-white">Project Title:</strong> {data.project_title || 'Not provided'}</div>
            <div><strong className="text-white">Project Type:</strong> {data.business_type || 'Not provided'}</div>
            <div className="md:col-span-2"><strong className="text-white">Description:</strong> {data.project_description || 'Not provided'}</div>
            <div className="md:col-span-2"><strong className="text-white">Goals:</strong> {data.project_goals || 'Not provided'}</div>
            <div><strong className="text-white">Timeline:</strong> {data.timeline || 'Not provided'}</div>
            <div><strong className="text-white">Budget:</strong> {data.budget_range || 'Not provided'}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-purple-500" />
            Branding & Design
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div><strong className="text-white">Brand Colors:</strong> {data.brand_colors.length > 0 ? data.brand_colors.join(', ') : 'Not provided'}</div>
            <div><strong className="text-white">Brand Style:</strong> {data.brand_style || 'Not provided'}</div>
            <div><strong className="text-white">Logo Files:</strong> {data.logo_files.length > 0 ? `${data.logo_files.length} file(s)` : 'Not provided'}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-orange-500" />
            Resources & Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div><strong className="text-white">Website:</strong> {data.website_url || 'Not provided'}</div>
            <div><strong className="text-white">GitHub:</strong> {data.github_url || 'Not provided'}</div>
            <div><strong className="text-white">Facebook:</strong> {data.social_media.facebook || 'Not provided'}</div>
            <div><strong className="text-white">LinkedIn:</strong> {data.social_media.linkedin || 'Not provided'}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-teal-500" />
            Additional Files
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div><strong className="text-white">Project Files:</strong> {data.project_files.length > 0 ? `${data.project_files.length} file(s)` : 'Not provided'}</div>
            <div><strong className="text-white">Reference Files:</strong> {data.reference_files.length > 0 ? `${data.reference_files.length} file(s)` : 'Not provided'}</div>
            <div><strong className="text-white">Requirements:</strong> {data.requirements_doc || 'Not provided'}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBusinessInfo();
      case 2: return renderProjectDetails();
      case 3: return renderBrandingDesign();
      case 4: return renderResourcesLinks();
      case 5: return renderAdditionalFiles();
      case 6: return renderReview();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1"></div>
          <motion.button
            onClick={handleClose}
            className="p-2 bg-dark-card border border-dark-border rounded-lg text-gray-400 hover:text-white hover:border-electric-blue transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-electric-blue to-red-500 text-white px-6 py-3 rounded-full mb-6 font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>AI-Powered Job Setup</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Build Something
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-red-500">
              Amazing Together
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our comprehensive setup wizard will help us understand your vision and create a detailed plan for your automation project.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="bg-dark-card rounded-2xl shadow-xl p-8 mb-8 border border-dark-border">
          {renderStepIndicator()}
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-dark-border text-gray-400 rounded-lg hover:border-electric-blue hover:text-electric-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </motion.button>

          {currentStep < totalSteps ? (
            <motion.button
              onClick={nextStep}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-electric-blue to-red-500 text-white rounded-lg hover:from-electric-blue/90 hover:to-red-500/90 transform hover:scale-105 transition-all duration-200 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next Step</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleComplete}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-electric-blue text-white rounded-lg hover:from-red-500/90 hover:to-electric-blue/90 transform hover:scale-105 transition-all duration-200 text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-5 h-5" />
              <span>Complete Setup & Submit</span>
            </motion.button>
          )}
        </div>

        {/* Features Highlight */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="text-center"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-electric-blue/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Get your project started in minutes, not days</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Expert Team</h3>
            <p className="text-gray-400">Our specialists will review and plan your project</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Results Driven</h3>
            <p className="text-gray-400">Focus on outcomes that grow your business</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
