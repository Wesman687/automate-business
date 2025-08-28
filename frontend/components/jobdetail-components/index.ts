export { default as JobBasicInfo } from './JobBasicInfo';
export { default as JobBusinessInfo } from './JobBusinessInfo';
export { default as JobProjectDetails } from './JobProjectDetails';
export { default as JobBrandingDesign } from './JobBrandingDesign';
export { default as JobResourcesLinks } from './JobResourcesLinks';
export { default as JobPlanning } from './JobPlanning';
export { default as JobFinancial } from './JobFinancial';
export { default as JobFilesAssets } from './JobFilesAssets';

// Export new optimized components
export { MilestoneManager } from './MilestoneManager';
export { DeliverableManager } from './DeliverableManager';
export { AIPlanGenerator } from './AIPlanGenerator';
export { PlanningOverview } from './PlanningOverview';

// Export financial components
export { FinancialEstimates } from './FinancialEstimates';
export { AIFinancialGenerator } from './AIFinancialGenerator';
export { CostBreakdown } from './CostBreakdown';
export { DiscountManager } from './DiscountManager';

// Export resource components
export { WebsiteLinks } from './WebsiteLinks';
export { SocialMediaManager } from './SocialMediaManager';
export { AdditionalResources } from './AdditionalResources';

// Export types for use in other components
export type { Job, JobDetailData, JobFormData, Milestone, Deliverable, JobFile, FinancialBreakdown } from '@/types';
