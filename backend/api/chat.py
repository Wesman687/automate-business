from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from services.customer_service import CustomerService
from services.session_service import SessionService
from services.openai_service import OpenAIService, SYSTEM_PROMPT
from schemas.chat import ChatRequest, ChatResponse
import uuid

router = APIRouter(prefix="/api", tags=["chat"])

# Initialize OpenAI service
openai_service = OpenAIService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(chat_request: ChatRequest, db: Session = Depends(get_db)):
    """Handle chat messages and generate AI responses"""
    try:
        session_service = SessionService(db)
        customer_service = CustomerService(db)
        
        # Add user message to database
        session_service.add_message(
            session_id=chat_request.session_id,
            text=chat_request.message,
            is_bot=False
        )
        
        # Get conversation history for context
        messages = session_service.get_session_messages(chat_request.session_id, limit=10)
        
        # Prepare messages for OpenAI
        openai_messages = []
        for msg in messages:
            role = "assistant" if msg.is_bot else "user"
            openai_messages.append({"role": role, "content": msg.text})
        
        # Generate AI response
        ai_response = await openai_service.generate_chat_response(openai_messages, SYSTEM_PROMPT)
        
        # Save AI response to database
        session_service.add_message(
            session_id=chat_request.session_id,
            text=ai_response,
            is_bot=True
        )
        
        # If user provided email, try to extract customer info and update/create customer
        if chat_request.user_email:
            conversation_history = session_service.get_conversation_history(chat_request.session_id)
            extracted_info = await openai_service.extract_customer_info(conversation_history)
            
            if extracted_info:
                customer = customer_service.update_customer_from_chat(chat_request.user_email, extracted_info)
                # Link session to customer
                session_service.link_session_to_customer(chat_request.session_id, customer.id)
        
        return ChatResponse(response=ai_response, session_id=chat_request.session_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.post("/generate-proposal")
async def generate_proposal(session_id: str, db: Session = Depends(get_db)):
    """Generate a custom proposal based on chat history"""
    try:
        session_service = SessionService(db)
        
        # Get conversation history
        conversation_summary = session_service.get_conversation_history(session_id, last_n=20)
        if not conversation_summary:
            raise HTTPException(status_code=404, detail="Session not found or empty")
        
        # Generate proposal
        proposal_text = await openai_service.generate_proposal(conversation_summary)
        
        # Save proposal as bot message
        session_service.add_message(
            session_id=session_id,
            text=f"CUSTOM PROPOSAL:\n\n{proposal_text}",
            is_bot=True
        )
        
        # Update session status
        session_service.update_session_status(session_id, "proposal_sent")
        
        return {"proposal": proposal_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating proposal: {str(e)}")

@router.get("/sessions/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get specific session data with messages"""
    session_service = SessionService(db)
    
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = session_service.get_session_messages(session_id)
    
    return {
        "session_id": session.session_id,
        "status": session.status,
        "created_at": session.created_at,
        "customer_id": session.customer_id,
        "messages": [
            {
                "id": msg.message_id,
                "text": msg.text,
                "isBot": msg.is_bot,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]
    }
