from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import openai
import json
import os
from datetime import datetime
import uuid
from pathlib import Path

app = FastAPI(title="Streamline AI Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Data models
class ChatMessage(BaseModel):
    message: str
    session_id: str
    user_email: Optional[str] = None

class CustomerInfo(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    business_type: Optional[str] = None
    pain_points: Optional[str] = None
    current_tools: Optional[str] = None
    budget: Optional[str] = None

class ChatSession(BaseModel):
    session_id: str
    messages: List[dict]
    customer_info: Optional[CustomerInfo] = None
    created_at: datetime
    status: str = "active"  # active, completed, proposal_sent

# Create directories for data storage
DATA_DIR = Path("customer_data")
DATA_DIR.mkdir(exist_ok=True)
SESSIONS_DIR = DATA_DIR / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)
CUSTOMERS_DIR = DATA_DIR / "customers"
CUSTOMERS_DIR.mkdir(exist_ok=True)

# AI Prompt for the chatbot
SYSTEM_PROMPT = """
You are StreamlineBot, an AI assistant for Streamline Tech Solutions. Your role is to:

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
- Be specific about automation solutions (AI chatbots, workflow automation, API integrations, etc.)
- Provide time savings estimates and ROI projections when possible
- End conversations by offering to schedule a consultation call

Remember: You represent expert developers who specialize in AI and automation solutions.
"""

def save_session(session: ChatSession):
    """Save chat session to file"""
    session_file = SESSIONS_DIR / f"{session.session_id}.json"
    with open(session_file, 'w') as f:
        json.dump(session.dict(), f, indent=2, default=str)

def load_session(session_id: str) -> Optional[ChatSession]:
    """Load chat session from file"""
    session_file = SESSIONS_DIR / f"{session_id}.json"
    if session_file.exists():
        with open(session_file, 'r') as f:
            data = json.load(f)
            # Convert datetime string back to datetime object
            data['created_at'] = datetime.fromisoformat(data['created_at'])
            return ChatSession(**data)
    return None

def save_customer(customer_info: CustomerInfo, session_id: str):
    """Save customer information to file"""
    customer_file = CUSTOMERS_DIR / f"{customer_info.email.replace('@', '_at_')}.json"
    customer_data = {
        "email": customer_info.email,
        "name": customer_info.name,
        "business_type": customer_info.business_type,
        "pain_points": customer_info.pain_points,
        "current_tools": customer_info.current_tools,
        "budget": customer_info.budget,
        "session_id": session_id,
        "created_at": datetime.now().isoformat(),
        "status": "lead"
    }
    
    with open(customer_file, 'w') as f:
        json.dump(customer_data, f, indent=2)

def extract_customer_info(messages: List[dict]) -> CustomerInfo:
    """Extract customer information from chat messages using AI"""
    conversation = "\n".join([f"{'Bot' if msg['isBot'] else 'User'}: {msg['text']}" for msg in messages])
    
    try:
        response = openai.ChatCompletion.create(
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
        
        extracted_data = json.loads(response.choices[0].message.content)
        return CustomerInfo(**{k: v for k, v in extracted_data.items() if v is not None})
    except Exception as e:
        print(f"Error extracting customer info: {e}")
        return CustomerInfo(email="")

@app.post("/api/chat")
async def chat_with_ai(chat_request: ChatMessage):
    """Handle chat messages and generate AI responses"""
    try:
        # Load or create session
        session = load_session(chat_request.session_id)
        if not session:
            session = ChatSession(
                session_id=chat_request.session_id,
                messages=[],
                created_at=datetime.now()
            )
        
        # Add user message to session
        user_message = {
            "id": str(uuid.uuid4()),
            "text": chat_request.message,
            "isBot": False,
            "timestamp": datetime.now().isoformat()
        }
        session.messages.append(user_message)
        
        # Prepare conversation history for OpenAI
        openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for msg in session.messages[-10:]:  # Last 10 messages for context
            role = "assistant" if msg["isBot"] else "user"
            openai_messages.append({"role": role, "content": msg["text"]})
        
        # Get AI response
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Use GPT-4 for better responses
            messages=openai_messages,
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response_text = response.choices[0].message.content
        
        # Add AI response to session
        ai_message = {
            "id": str(uuid.uuid4()),
            "text": ai_response_text,
            "isBot": True,
            "timestamp": datetime.now().isoformat()
        }
        session.messages.append(ai_message)
        
        # Save session
        save_session(session)
        
        return {
            "response": ai_response_text,
            "session_id": chat_request.session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/api/save-customer")
async def save_customer_info(customer_request: CustomerInfo, session_id: str):
    """Save customer information and update session"""
    try:
        # Load session
        session = load_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Save customer info
        save_customer(customer_request, session_id)
        
        # Update session with customer info
        session.customer_info = customer_request
        session.status = "completed"
        save_session(session)
        
        return {"message": "Customer information saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving customer info: {str(e)}")

@app.post("/api/generate-proposal")
async def generate_proposal(session_id: str):
    """Generate a custom proposal based on chat history"""
    try:
        session = load_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Extract customer info from conversation
        customer_info = extract_customer_info(session.messages)
        
        # Generate proposal using AI
        conversation_summary = "\n".join([
            f"{'Bot' if msg['isBot'] else 'User'}: {msg['text']}" 
            for msg in session.messages[-20:]  # Last 20 messages
        ])
        
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
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a senior automation consultant creating detailed proposals."},
                {"role": "user", "content": proposal_prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        proposal_text = response.choices[0].message.content
        
        # Save proposal to session
        session.messages.append({
            "id": str(uuid.uuid4()),
            "text": f"CUSTOM PROPOSAL:\n\n{proposal_text}",
            "isBot": True,
            "timestamp": datetime.now().isoformat()
        })
        session.status = "proposal_sent"
        save_session(session)
        
        return {
            "proposal": proposal_text,
            "customer_info": customer_info.dict() if customer_info.email else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating proposal: {str(e)}")

@app.get("/api/customers")
async def get_customers():
    """Get all customer data (for admin dashboard)"""
    customers = []
    for customer_file in CUSTOMERS_DIR.glob("*.json"):
        with open(customer_file, 'r') as f:
            customer_data = json.load(f)
            customers.append(customer_data)
    
    return {"customers": customers}

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get specific session data"""
    session = load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session.dict()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Streamline AI Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
