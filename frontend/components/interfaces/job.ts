export interface JobDetailData {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  progress_percentage: number;
  business_name?: string;
  business_type?: string;
  industry?: string;
  industry_other?: string;
  project_goals?: string;
  target_audience?: string;
  timeline?: string;
  budget_range?: string;
  brand_colors?: string[];
  brand_color_tags?: { [key: number]: string };
  brand_color_tag_others?: { [key: number]: string };
  brand_style?: string;
  brand_style_other?: string;
  logo_files?: number[];
  brand_guidelines?: string;
  website_url?: string;
  github_url?: string;
  portfolio_url?: string;
  social_media?: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  additional_resource_info?: string;
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  estimated_hours?: number;
  actual_hours?: number;
  hourly_rate?: number;
  fixed_price?: number;
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
