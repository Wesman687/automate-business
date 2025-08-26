export interface Job {
  // Core Job Information
  id: number;
  customer_id: number;
  title: string;
  description?: string;
  status: JobStatus;
  priority: JobPriority;
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  progress_percentage: number;
  
  // Business Information
  business_name?: string;
  business_type?: string;
  industry?: string;
  industry_other?: string;
  
  // Project Details
  project_goals?: string;
  target_audience?: string;
  timeline?: string;
  budget_range?: string;
  
  // Branding & Design
  brand_colors?: string[];
  brand_color_tags?: Record<number, string>;
  brand_color_tag_others?: Record<number, string>;
  brand_style?: string;
  brand_style_other?: string;
  logo_files?: number[];
  brand_guidelines?: string;
  
  // Resources & Links
  website_url?: string;
  github_url?: string;
  portfolio_url?: string;
  social_media?: SocialMediaLinks;
  
  // Unified Resources
  resources?: JobResource[];
  additional_tools?: JobTool[];
  server_details?: ServerDetail[];
  meeting_links?: MeetingLink[];
  
  // Legacy Resource Arrays (for backward compatibility)
  google_drive_links?: Array<{ name: string; url: string; type?: string }>;
  github_repositories?: Array<{ name: string; url: string; type?: string }>;
  workspace_links?: Array<{ name: string; url: string; type?: string }>;
  calendar_links?: Array<{ name: string; url: string; type?: string }>;
  
  // Project Planning
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  
  // Financial Information
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
  
  // Files & Assets
  project_files?: number[];
  reference_files?: number[];
  requirements_doc?: string;
  
  // Additional Information
  notes?: string;
  additional_resource_info?: string[];
  
  // Metadata
  created_at: string;
  updated_at?: string;
}

// Supporting interfaces
export type JobStatus = 'pending' | 'planning' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'on_hold';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface JobResource {
  type: 'website' | 'github' | 'drive' | 'workspace' | 'service';
  name: string;
  url?: string;
  description?: string;
}

export interface JobTool {
  name: string;
  api_key?: string;
  url?: string;
  description?: string;
}

export interface ServerDetail {
  name: string;
  url?: string;
  type?: string;
  description?: string;
}

export interface MeetingLink {
  name: string;
  url: string;
  type?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  snapchat?: string;
  [key: string]: string | undefined; // Add index signature for dynamic access
}

export interface Milestone {
  id?: number;
  name: string;
  description?: string;
  completed: boolean;
  due_date?: string;
}

export interface Deliverable {
  id?: number;
  name: string;
  description?: string;
  delivered: boolean;
  date?: string;
}

export interface JobFile {
  id: number;
  filename: string;
  folder: string;
  public_url: string;
  created_at: string;
  file_size: number;
}

export interface FinancialBreakdown {
  estimated_hours: number;
  recommended_hourly_rate: number;
  fixed_price_estimate: number;
  labor_cost: number;
  project_costs: number;
  total_project_cost: number;
  monthly_maintenance: number;
  monthly_support: number;
  monthly_hosting: number;
  total_monthly_cost: number;
  breakdown_notes: string;
  cost_breakdown: {
    [key: string]: number;
  };
}

// For backward compatibility - JobDetailData is now an alias for Job
export type JobDetailData = Job;

// Form data interface for job creation/editing
export interface JobFormData {
  customer_id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  start_date: string;
  deadline: string;
  estimated_hours: string;
  hourly_rate: string;
  fixed_price: string;
  website_url: string;
  notes: string;
  milestones: Array<{ name: string; description: string; due_date: string; completed: boolean }>;
  
  // Business Information
  business_name: string;
  business_type: string;
  industry: string;
  industry_other: string;
  
  // Project Details
  project_goals: string;
  target_audience: string;
  timeline: string;
  budget_range: string;
  
  // Branding & Design
  brand_style: string;
  brand_style_other: string;
  brand_guidelines: string;
  
  // Resources & Links
  github_url: string;
  portfolio_url: string;
  
  // Social Media
  social_media: {
    facebook: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
    pinterest: string;
    snapchat: string;
  };
  
  // Unified Resources
  resources: Array<{
    type: 'website' | 'github' | 'drive' | 'workspace' | 'service';
    name: string;
    url?: string;
    description?: string;
  }>;
  
  // Additional Tools
  additional_tools: Array<{
    name: string;
    api_key?: string;
    url?: string;
    description?: string;
  }>;
  
  // Server Details
  server_details: Array<{
    name: string;
    url?: string;
    type?: string;
    description?: string;
  }>;
  
  // Project Planning
  deliverables: Array<{ name: string; description?: string; delivered: boolean; date?: string }>;
  
  // Additional Information
  additional_resource_info: string[];
}
