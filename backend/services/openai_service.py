from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("Warning: OPENAI_API_KEY not found in environment variables")
            print("Please set your OpenAI API key in the .env file")
            self.client = None
        else:
            self.client = OpenAI(api_key=self.api_key)
    
    def is_available(self) -> bool:
        return self.client is not None
    
    async def generate_chat_response(self, messages: list, system_prompt: str) -> str:
        if not self.client:
            return "I'm sorry, but the AI service is currently unavailable. Please contact us directly at sales@stream-lineai.com for assistance with your automation needs."
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "system", "content": system_prompt}] + messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating chat response: {e}")
            return "I apologize, but I'm experiencing technical difficulties. Please contact us at sales@stream-lineai.com for assistance."
    
    async def generate_proposal(self, conversation_summary: str) -> str:
        if not self.client:
            return """
            CUSTOM AUTOMATION PROPOSAL
            
            Thank you for your interest in Streamline AI!
            
            Based on our conversation, we understand you're looking for automation solutions to streamline your business processes. While our AI system is currently unavailable for generating a detailed proposal, we would love to schedule a consultation call to discuss your specific needs.
            
            Our comprehensive services include:
            • AI Chatbot Development & Virtual Assistants
            • Workflow Automation & Process Optimization
            • API Integrations & Data Synchronization
            • Mobile App Development (iOS & Android)
            • Custom Web Applications & Dashboards
            • Business Intelligence & Analytics
            • Cloud Infrastructure & DevOps Solutions
            
            Whether you need a mobile app to streamline customer interactions, automated workflows to reduce manual tasks, or AI-powered solutions to enhance your business operations, we have the expertise to deliver results.
            
            Please contact us at sales@stream-lineai.com to schedule your free consultation and discuss how we can help automate and scale your business.
            """
        
        proposal_prompt = f"""
        Based on this customer conversation, create a detailed automation proposal.
        
        Conversation:
        {conversation_summary}
        
        Create a proposal that includes:
        1. Business analysis summary
        2. Specific automation solutions recommended
        3. Implementation timeline
        4. Estimated time savings
        5. ROI projections
        6. Next steps
        
        Make it professional and tailored to their specific needs.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a senior automation consultant creating detailed proposals."},
                    {"role": "user", "content": proposal_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating proposal: {e}")
            return "Unable to generate proposal at this time. Please contact sales@stream-lineai.com for a custom consultation."
    
    async def extract_customer_info(self, conversation: str) -> dict:
        if not self.client:
            return {}
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """Extract customer information from this conversation. 
                        Return a JSON object with: email, name, business_type, pain_points, current_tools, budget.
                        Only include fields that were clearly mentioned. Use null for missing information."""
                    },
                    {"role": "user", "content": conversation}
                ],
                temperature=0
            )
            
            import json
            extracted_data = json.loads(response.choices[0].message.content)
            return {k: v for k, v in extracted_data.items() if v is not None}
        except Exception as e:
            print(f"Error extracting customer info: {e}")
            return {}

# System prompt for the chatbot
SYSTEM_PROMPT = """
You are StreamlineAI, an AI assistant for Streamline AI. Your role is to:

1. QUALIFY LEADS: Gather key information about their business and automation needs
2. PROVIDE VALUE: Offer immediate insights and suggestions
3. GENERATE PROPOSALS: Create custom automation solutions based on their responses

CONVERSATION FLOW:
- Start friendly and ask about their business
- Identify pain points and repetitive tasks
- Understand their current tools/systems
- Discuss budget expectations
- Offer a custom proposal with specific solutions

TONE: Professional but approachable, like an expert consultant who genuinely wants to help.

IMPORTANT: 
- Always ask for their email before providing the final proposal
- Be specific about automation solutions (AI chatbots, workflow automation, API integrations, mobile apps, etc.)
- Provide time savings estimates and ROI projections when possible
- End conversations by offering to schedule a consultation call

OUR SERVICES INCLUDE:
- AI Chatbots & Virtual Assistants
- Workflow Automation & Process Optimization
- API Integrations & Data Synchronization
- Mobile App Development (iOS & Android)
- Custom Web Applications

Remember: You represent expert developers who specialize in AI, automation, and mobile app development solutions.
"""
