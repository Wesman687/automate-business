from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import openai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class ProjectPlanRequest(BaseModel):
    project_title: str
    project_goals: Optional[str] = None
    target_audience: Optional[str] = None
    timeline: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    project_type: Optional[str] = None  # e.g., 'ecommerce', 'landing_page', 'web_app', 'mobile_app'

class ProjectPlanResponse(BaseModel):
    milestones: List[dict]
    deliverables: List[dict]
    estimated_hours: Optional[float] = None

class FinancialEstimateRequest(BaseModel):
    project_title: str
    project_goals: Optional[str] = None
    target_audience: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    complexity: Optional[str] = None
    timeline: Optional[str] = None
    budget_range: Optional[str] = None
    brand_style: Optional[str] = None
    current_estimated_hours: Optional[float] = None
    current_hourly_rate: Optional[float] = None
    current_fixed_price: Optional[float] = None

class FinancialEstimateResponse(BaseModel):
    estimated_hours: float
    recommended_hourly_rate: float
    fixed_price_estimate: float
    breakdown_notes: str
    # Detailed cost breakdown
    labor_cost: float
    project_costs: float
    total_project_cost: float
    # Monthly service costs
    monthly_maintenance: float
    monthly_support: float
    monthly_hosting: float
    total_monthly_cost: float
    # Cost justification
    cost_breakdown: dict

@router.post("/generate-project-plan", response_model=ProjectPlanResponse)
async def generate_project_plan(request: ProjectPlanRequest):
    """Generate project milestones and deliverables using AI"""
    try:
        # Project templates for common project types
        project_templates = {
            'ecommerce': {
                'milestones': [
                    {
                        "name": "Requirements & Market Research",
                        "description": "Conduct market analysis, define product catalog, identify target audience, establish business requirements",
                        "due_date": "2025-02-15",
                        "completed": False
                    },
                    {
                        "name": "UX/UI Design & Wireframes",
                        "description": "Create user journey maps, design wireframes, establish design system, create high-fidelity mockups",
                        "due_date": "2025-02-28",
                        "completed": False
                    },
                    {
                        "name": "Frontend Development",
                        "description": "Build responsive product catalog, shopping cart, user authentication, product search and filtering",
                        "due_date": "2025-03-15",
                        "completed": False
                    },
                    {
                        "name": "Backend & Database",
                        "description": "Set up product database, user management, order processing, payment integration",
                        "due_date": "2025-03-30",
                        "completed": False
                    },
                    {
                        "name": "Payment & Security",
                        "description": "Integrate payment gateways, implement SSL, security testing, PCI compliance",
                        "due_date": "2025-04-10",
                        "completed": False
                    },
                    {
                        "name": "Testing & Launch",
                        "description": "User acceptance testing, performance optimization, go-live preparation, launch support",
                        "due_date": "2025-04-20",
                        "completed": False
                    }
                ],
                'deliverables': [
                    {
                        "name": "Product Catalog & CMS",
                        "description": "Complete product management system with categories, search, and filtering",
                        "delivered": False,
                        "date": "2025-03-15"
                    },
                    {
                        "name": "Shopping Cart & Checkout",
                        "description": "Full e-commerce functionality with secure payment processing",
                        "delivered": False,
                        "date": "2025-03-30"
                    },
                    {
                        "name": "Admin Dashboard",
                        "description": "Complete backend management system for orders, products, and customers",
                        "delivered": False,
                        "date": "2025-04-10"
                    },
                    {
                        "name": "Live E-commerce Site",
                        "description": "Production-ready online store with all features and security measures",
                        "delivered": False,
                        "date": "2025-04-20"
                    }
                ],
                'estimated_hours': 160.0
            },
            'landing_page': {
                'milestones': [
                    {
                        "name": "Content Strategy & Copywriting",
                        "description": "Define key messages, create compelling copy, establish call-to-actions, outline page structure",
                        "due_date": "2025-02-10",
                        "completed": False
                    },
                    {
                        "name": "Design & Visual Identity",
                        "description": "Create visual design, establish brand elements, design hero section, layout wireframes",
                        "due_date": "2025-02-20",
                        "completed": False
                    },
                    {
                        "name": "Frontend Development",
                        "description": "Build responsive landing page, implement animations, optimize for mobile, integrate forms",
                        "due_date": "2025-02-28",
                        "completed": False
                    },
                    {
                        "name": "Conversion Optimization",
                        "description": "Implement analytics, A/B testing setup, optimize forms, performance optimization",
                        "due_date": "2025-03-05",
                        "completed": False
                    },
                    {
                        "name": "Testing & Launch",
                        "description": "Cross-browser testing, mobile testing, performance testing, go-live deployment",
                        "due_date": "2025-03-10",
                        "completed": False
                    }
                ],
                'deliverables': [
                    {
                        "name": "High-Converting Landing Page",
                        "description": "Complete landing page with optimized conversion elements and responsive design",
                        "delivered": False,
                        "date": "2025-02-28"
                    },
                    {
                        "name": "Analytics & Tracking",
                        "description": "Full analytics setup with conversion tracking and A/B testing capabilities",
                        "delivered": False,
                        "date": "2025-03-05"
                    },
                    {
                        "name": "Launch-Ready Page",
                        "description": "Production landing page with all optimizations and testing completed",
                        "delivered": False,
                        "date": "2025-03-10"
                    }
                ],
                'estimated_hours': 80.0
            },
            'web_app': {
                'milestones': [
                    {
                        "name": "Requirements & Architecture",
                        "description": "Define functional requirements, create system architecture, establish tech stack, plan database design",
                        "due_date": "2025-02-15",
                        "completed": False
                    },
                    {
                        "name": "UX/UI Design",
                        "description": "Create user flows, design wireframes, establish design system, build interactive prototypes",
                        "due_date": "2025-03-01",
                        "completed": False
                    },
                    {
                        "name": "Frontend Development",
                        "description": "Build responsive UI components, implement routing, create user interfaces, integrate with backend",
                        "due_date": "2025-03-20",
                        "completed": False
                    },
                    {
                        "name": "Backend Development",
                        "description": "Set up API endpoints, implement business logic, database integration, authentication system",
                        "due_date": "2025-04-10",
                        "completed": False
                    },
                    {
                        "name": "Integration & Testing",
                        "description": "Connect frontend and backend, implement testing, bug fixes, performance optimization",
                        "due_date": "2025-04-25",
                        "completed": False
                    },
                    {
                        "name": "Deployment & Launch",
                        "description": "Production deployment, monitoring setup, user training, launch support",
                        "due_date": "2025-05-05",
                        "completed": False
                    }
                ],
                'deliverables': [
                    {
                        "name": "Functional Web Application",
                        "description": "Complete web application with all core features and responsive design",
                        "delivered": False,
                        "date": "2025-04-10"
                    },
                    {
                        "name": "API Documentation",
                        "description": "Comprehensive API documentation for developers and integration",
                        "delivered": False,
                        "date": "2025-04-20"
                    },
                    {
                        "name": "Production Web App",
                        "description": "Deployed and optimized web application ready for production use",
                        "delivered": False,
                        "date": "2025-05-05"
                    }
                ],
                'estimated_hours': 200.0
            },
            'mobile_app': {
                'milestones': [
                    {
                        "name": "Requirements & Platform Planning",
                        "description": "Define app requirements, choose platforms (iOS/Android), establish user stories, plan app architecture",
                        "due_date": "2025-02-15",
                        "completed": False
                    },
                    {
                        "name": "UX/UI Design",
                        "description": "Create app wireframes, design user interfaces, establish design system, build interactive prototypes",
                        "due_date": "2025-03-01",
                        "completed": False
                    },
                    {
                        "name": "Frontend Development",
                        "description": "Build native app UI, implement navigation, create screens, integrate with backend APIs",
                        "due_date": "2025-03-25",
                        "completed": False
                    },
                    {
                        "name": "Backend & API Development",
                        "description": "Develop backend services, create APIs, implement authentication, database integration",
                        "due_date": "2025-04-15",
                        "completed": False
                    },
                    {
                        "name": "Testing & Optimization",
                        "description": "Device testing, performance optimization, bug fixes, app store preparation",
                        "due_date": "2025-04-30",
                        "completed": False
                    },
                    {
                        "name": "App Store Launch",
                        "description": "App store submission, approval process, launch marketing, user acquisition",
                        "due_date": "2025-05-15",
                        "completed": False
                    }
                ],
                'deliverables': [
                    {
                        "name": "Native Mobile App",
                        "description": "Complete mobile application with all features and platform-specific optimizations",
                        "delivered": False,
                        "date": "2025-04-15"
                    },
                    {
                        "name": "Backend Services",
                        "description": "Full backend infrastructure supporting the mobile application",
                        "delivered": False,
                        "date": "2025-04-20"
                    },
                    {
                        "name": "App Store Ready App",
                        "description": "Production mobile app approved and ready for app store launch",
                        "delivered": False,
                        "date": "2025-05-15"
                    }
                ],
                'estimated_hours': 240.0
            }
        }
        
        # Determine project type based on title and goals
        project_type = request.project_type
        if not project_type:
            # Auto-detect project type based on keywords
            title_lower = request.project_title.lower()
            goals_lower = (request.project_goals or '').lower()
            
            if any(word in title_lower or word in goals_lower for word in ['ecommerce', 'shop', 'store', 'cart', 'product']):
                project_type = 'ecommerce'
            elif any(word in title_lower or word in goals_lower for word in ['landing', 'page', 'conversion', 'lead']):
                project_type = 'landing_page'
            elif any(word in title_lower or word in goals_lower for word in ['app', 'application', 'web app', 'platform']):
                project_type = 'web_app'
            elif any(word in title_lower or word in goals_lower for word in ['mobile', 'ios', 'android', 'app store']):
                project_type = 'mobile_app'
            else:
                project_type = 'web_app'  # Default to web app
        
        # Get template or generate custom plan
        if project_type in project_templates:
            template = project_templates[project_type]
            
            # Customize template dates based on timeline
            if request.timeline:
                timeline_days = {
                    '1-2 weeks': 10,
                    '3-4 weeks': 25,
                    '1-2 months': 45,
                    '3-6 months': 90,
                    '6+ months': 180
                }
                
                days = timeline_days.get(request.timeline, 45)
                start_date = datetime.now()
                
                # Adjust milestone dates based on timeline
                for i, milestone in enumerate(template['milestones']):
                    days_offset = int((i + 1) * days / len(template['milestones']))
                    milestone['due_date'] = (start_date + timedelta(days=days_offset)).strftime('%Y-%m-%d')
                
                for i, deliverable in enumerate(template['deliverables']):
                    days_offset = int((i + 1) * days / len(template['deliverables']))
                    deliverable['date'] = (start_date + timedelta(days=days_offset)).strftime('%Y-%m-%d')
            
            return ProjectPlanResponse(**template)
        
        # Fallback to generic template if no specific type matches
        generic_template = {
            "milestones": [
                {
                    "name": "Project Discovery & Requirements",
                    "description": "Gather detailed requirements, conduct stakeholder interviews, define project scope",
                    "due_date": "2025-02-15",
                    "completed": False
                },
                {
                    "name": "Design & Architecture",
                    "description": "Create system architecture, design mockups, technical specifications",
                    "due_date": "2025-02-28",
                    "completed": False
                },
                {
                    "name": "Development Phase 1",
                    "description": "Core functionality development, database setup, basic UI",
                    "due_date": "2025-03-15",
                    "completed": False
                },
                {
                    "name": "Development Phase 2",
                    "description": "Advanced features, integration, testing",
                    "due_date": "2025-03-30",
                    "completed": False
                },
                {
                    "name": "Testing & Quality Assurance",
                    "description": "Comprehensive testing, bug fixes, performance optimization",
                    "due_date": "2025-04-10",
                    "completed": False
                },
                {
                    "name": "Deployment & Launch",
                    "description": "Production deployment, user training, go-live support",
                    "due_date": "2025-04-20",
                    "completed": False
                }
            ],
            "deliverables": [
                {
                    "name": "Requirements Document",
                    "description": "Comprehensive project requirements and specifications",
                    "delivered": False,
                    "date": "2025-02-15"
                },
                {
                    "name": "System Design & Mockups",
                    "description": "Technical architecture and user interface mockups",
                    "delivered": False,
                    "date": "2025-02-28"
                },
                {
                    "name": "Working Prototype",
                    "description": "Functional prototype with core features",
                    "delivered": False,
                    "date": "2025-03-15"
                },
                {
                    "name": "Production-Ready System",
                    "description": "Fully tested and optimized system ready for deployment",
                    "delivered": False,
                    "date": "2025-04-10"
                }
            ],
            "estimated_hours": 120.0
        }
        
        return ProjectPlanResponse(**generic_template)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate project plan: {str(e)}")

@router.post("/generate-financial-estimate", response_model=FinancialEstimateResponse)
async def generate_financial_estimate(request: FinancialEstimateRequest):
    """Generate financial estimates using AI"""
    try:
        # Industry-specific rate and complexity multipliers
        industry_rates = {
            'technology': 95.0,
            'healthcare': 110.0,
            'finance': 120.0,
            'ecommerce': 85.0,
            'education': 75.0,
            'real_estate': 80.0,
            'manufacturing': 70.0,
            'retail': 75.0,
            'consulting': 90.0,
            'non_profit': 65.0
        }
        
        # Project complexity multipliers
        complexity_multipliers = {
            'low': 0.8,
            'medium': 1.0,
            'high': 1.3,
            'urgent': 1.5
        }
        
        # Timeline multipliers
        timeline_multipliers = {
            '1-2 weeks': 1.2,
            '3-4 weeks': 1.1,
            '1-2 months': 1.0,
            '3-6 months': 0.9,
            '6+ months': 0.8
        }
        
        # Determine base hourly rate
        base_rate = 85.0  # Default rate
        if request.industry:
            industry_lower = request.industry.lower()
            for key, rate in industry_rates.items():
                if key in industry_lower:
                    base_rate = rate
                    break
        
        # Apply complexity multiplier
        complexity = request.complexity or 'medium'
        complexity_mult = complexity_multipliers.get(complexity.lower(), 1.0)
        
        # Apply timeline multiplier
        timeline = request.timeline or '1-2 months'
        timeline_mult = timeline_multipliers.get(timeline, 1.0)
        
        # Calculate adjusted hourly rate
        adjusted_rate = base_rate * complexity_mult * timeline_mult
        
        # If user has an existing hourly rate, use it as a starting point
        if request.current_hourly_rate:
            adjusted_rate = request.current_hourly_rate
            # Apply industry adjustments if they differ significantly
            if abs(adjusted_rate - base_rate) > 20:
                # User's rate is significantly different from industry standard
                # Apply a smaller adjustment factor
                adjusted_rate = adjusted_rate * (complexity_mult * 0.8 + 0.2) * (timeline_mult * 0.8 + 0.2)
        
        # Estimate hours based on project type and complexity
        base_hours = 80.0  # Default for medium complexity
        
        # Adjust based on complexity
        if complexity.lower() == 'low':
            base_hours = 60.0
        elif complexity.lower() == 'high':
            base_hours = 120.0
        elif complexity.lower() == 'urgent':
            base_hours = 150.0
        
        # Adjust based on project scope indicators
        if request.project_goals and len(request.project_goals) > 200:
            base_hours *= 1.2  # More detailed goals = more complex project
        
        if request.target_audience and 'enterprise' in request.target_audience.lower():
            base_hours *= 1.3  # Enterprise projects are more complex
        
        if request.brand_style and request.brand_style.lower() in ['luxury', 'premium', 'enterprise']:
            base_hours *= 1.1  # Premium brands require more attention to detail
        
        # Adjust based on budget range if specified
        if request.budget_range:
            if 'Under $1,000' in request.budget_range:
                base_hours *= 0.7  # Small budget = smaller scope
            elif '$25,000+' in request.budget_range:
                base_hours *= 1.4  # Large budget = larger scope
        
        # Adjust hours based on timeline
        if timeline == '1-2 weeks':
            base_hours *= 0.8  # Rushed projects often take less time
        elif timeline == '6+ months':
            base_hours *= 1.2  # Longer timelines allow for more thorough work
        
        # If user has existing estimates, use them as a starting point
        if request.current_estimated_hours:
            base_hours = request.current_estimated_hours
            # Apply refinements based on new information
            if request.project_goals and len(request.project_goals) > 200:
                base_hours *= 1.1
            if request.target_audience and 'enterprise' in request.target_audience.lower():
                base_hours *= 1.2
        
        estimated_hours = base_hours
        
        # Calculate detailed cost breakdown
        labor_cost = estimated_hours * adjusted_rate
        
        # Project costs based on complexity and industry
        base_project_costs = 500.0  # Base cost for tools, licenses, etc.
        if complexity.lower() == 'high':
            base_project_costs *= 1.5
        elif complexity.lower() == 'urgent':
            base_project_costs *= 2.0
        
        # Industry-specific project costs
        industry_multiplier = 1.0
        if request.industry:
            industry_lower = request.industry.lower()
            if 'healthcare' in industry_lower:
                industry_multiplier = 1.3  # Compliance and security requirements
            elif 'finance' in industry_lower:
                industry_multiplier = 1.4  # Regulatory compliance
            elif 'ecommerce' in industry_lower:
                industry_multiplier = 1.2  # Payment processing and security
        
        project_costs = base_project_costs * industry_multiplier
        total_project_cost = labor_cost + project_costs
        
        # Monthly service costs (recurring revenue)
        monthly_maintenance = total_project_cost * 0.15  # 15% of project cost for maintenance
        monthly_support = total_project_cost * 0.10     # 10% for technical support
        monthly_hosting = 150.0  # Base hosting cost
        if complexity.lower() == 'high':
            monthly_hosting *= 1.5
        elif complexity.lower() == 'urgent':
            monthly_hosting *= 2.0
        
        total_monthly_cost = monthly_maintenance + monthly_support + monthly_hosting
        
        # Detailed cost breakdown for justification
        cost_breakdown = {
            "labor": {
                "hours": estimated_hours,
                "rate": adjusted_rate,
                "total": labor_cost,
                "justification": f"Based on {complexity} complexity and {request.industry or 'general'} industry standards"
            },
            "project_costs": {
                "tools_licenses": project_costs * 0.6,
                "infrastructure": project_costs * 0.3,
                "miscellaneous": project_costs * 0.1,
                "total": project_costs,
                "justification": f"Includes development tools, licenses, and infrastructure setup for {complexity} complexity project"
            },
            "monthly_services": {
                "maintenance": {
                    "amount": monthly_maintenance,
                    "justification": "Ongoing system maintenance, updates, and bug fixes"
                },
                "technical_support": {
                    "amount": monthly_support,
                    "justification": "24/7 technical support and troubleshooting"
                },
                "hosting_infrastructure": {
                    "amount": monthly_hosting,
                    "justification": f"Reliable hosting with {complexity} complexity scaling and security"
                }
            }
        }
        
        # Generate detailed breakdown
        breakdown_notes = f"""
        Project: {request.project_title}
        Industry: {request.industry or 'General'}
        Complexity: {complexity.title()}
        Timeline: {timeline}
        
        Project Scope Analysis:
        - Project Goals: {'Detailed' if request.project_goals and len(request.project_goals) > 200 else 'Basic'}
        - Target Audience: {request.target_audience or 'Not specified'}
        - Brand Style: {request.brand_style or 'Not specified'}
        - Budget Range: {request.budget_range or 'Not specified'}
        
        Rate Calculation:
        - Base Rate: ${base_rate:.0f}/hour
        - Complexity Multiplier: {complexity_mult:.1f}x
        - Timeline Multiplier: {timeline_mult:.1f}x
        - Final Rate: ${adjusted_rate:.0f}/hour
        {' - Existing Rate Used: $' + str(request.current_hourly_rate) + '/hour' if request.current_hourly_rate else ''}
        
        Hour Estimation:
        - Base Hours: {base_hours:.0f} hours
        - Scope Adjustments: {'Applied' if request.project_goals or request.target_audience or request.brand_style or request.budget_range else 'None'}
        - Timeline Adjustment: {timeline} impact
        - Final Estimate: {estimated_hours:.0f} hours
        {' - Existing Estimate Refined: $' + str(request.current_estimated_hours) + ' hours' if request.current_estimated_hours else ''}
        
        COST BREAKDOWN:
        
        ONE-TIME PROJECT COSTS:
        - Labor: {estimated_hours:.0f} hours × ${adjusted_rate:.0f}/hour = ${labor_cost:,.0f}
        - Project Costs: ${project_costs:,.0f} (tools, licenses, infrastructure)
        - TOTAL PROJECT COST: ${total_project_cost:,.0f}
        
        MONTHLY SERVICE COSTS (Recurring Revenue):
        - System Maintenance: ${monthly_maintenance:,.0f}/month
        - Technical Support: ${monthly_support:,.0f}/month  
        - Hosting & Infrastructure: ${monthly_hosting:,.0f}/month
        - TOTAL MONTHLY COST: ${total_monthly_cost:,.0f}/month
        
        ANNUAL RECURRING REVENUE: ${total_monthly_cost * 12:,.0f}/year
        
        This estimate incorporates all available project information including:
        • Project goals and complexity indicators
        • Target audience and brand requirements
        • Budget constraints and timeline
        • Existing estimates (if provided)
        
        The estimate is refined based on real-time form data and industry standards.
        """
        
        response = {
            "estimated_hours": estimated_hours,
            "recommended_hourly_rate": adjusted_rate,
            "fixed_price_estimate": total_project_cost,
            "breakdown_notes": breakdown_notes.strip(),
            "labor_cost": labor_cost,
            "project_costs": project_costs,
            "total_project_cost": total_project_cost,
            "monthly_maintenance": monthly_maintenance,
            "monthly_support": monthly_support,
            "monthly_hosting": monthly_hosting,
            "total_monthly_cost": total_monthly_cost,
            "cost_breakdown": cost_breakdown
        }
        
        return FinancialEstimateResponse(**response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate financial estimate: {str(e)}")
