from sqlalchemy.orm import Session, joinedload
from database.models import ChatSession, ChatMessage, User
from schemas.chat import ChatSessionCreate, ChatMessageCreate
from typing import Optional, List, Tuple
from sqlalchemy import func
import uuid
from datetime import datetime

class SessionService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, session_id: str, customer_id: Optional[int] = None) -> ChatSession:
        db_session = ChatSession(
            session_id=session_id,
            customer_id=customer_id
        )
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)
        return db_session
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        return self.db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    
    def get_or_create_session(self, session_id: str) -> ChatSession:
        session = self.get_session(session_id)
        if not session:
            session = self.create_session(session_id)
        return session
    
    def add_message(self, session_id: str, text: str, is_bot: bool = False) -> ChatMessage:
        session = self.get_or_create_session(session_id)
        
        message = ChatMessage(
            message_id=str(uuid.uuid4()),
            session_id=session.id,
            text=text,
            is_bot=is_bot
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
    
    def get_session_messages(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        session = self.get_session(session_id)
        if not session:
            return []
        
        return self.db.query(ChatMessage)\
            .filter(ChatMessage.session_id == session.id)\
            .order_by(ChatMessage.timestamp)\
            .limit(limit)\
            .all()
    
    def update_session_status(self, session_id: str, status: str) -> Optional[ChatSession]:
        session = self.get_session(session_id)
        if not session:
            return None
        
        session.status = status
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def link_session_to_customer(self, session_id: str, customer_id: int) -> Optional[ChatSession]:
        session = self.get_session(session_id)
        if not session:
            return None
        
        session.customer_id = customer_id
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_customer_sessions(self, customer_id: int) -> List[ChatSession]:
        return self.db.query(ChatSession)\
            .filter(ChatSession.customer_id == customer_id)\
            .order_by(ChatSession.created_at.desc())\
            .all()
    
    def get_customer_sessions_with_message_counts(self, customer_id: int) -> List[dict]:
        """Get customer sessions with message counts using efficient SQL"""
        result = self.db.query(
            ChatSession,
            func.count(ChatMessage.id).label('message_count')
        ).outerjoin(
            ChatMessage, ChatSession.id == ChatMessage.session_id
        ).filter(
            ChatSession.customer_id == customer_id
        ).group_by(
            ChatSession.id
        ).order_by(
            ChatSession.created_at.desc()
        ).all()
        
        sessions_with_counts = []
        for session, message_count in result:
            sessions_with_counts.append({
                "id": session.id,
                "session_id": session.session_id,
                "customer_id": session.customer_id,
                "start_time": session.created_at,
                "end_time": session.updated_at,
                "status": session.status,
                "message_count": message_count or 0
            })
        
        return sessions_with_counts
    
    def update_session_customer(self, session_id: str, customer_id: int) -> ChatSession:
        """Link a session to a customer"""
        session = self.get_or_create_session(session_id)
        session.customer_id = customer_id
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_conversation_history(self, session_id: str, last_n: int = 20) -> str:
        """Get conversation history as formatted string for AI processing"""
        messages = self.get_session_messages(session_id)
        if not messages:
            return ""
        
        # Get last N messages
        recent_messages = messages[-last_n:] if len(messages) > last_n else messages
        
        conversation = []
        for msg in recent_messages:
            role = "Bot" if msg.is_bot else "User"
            conversation.append(f"{role}: {msg.text}")
        
        return "\n".join(conversation)
    
    def get_session_with_messages(self, session_id: str):
        """Get session data with all messages for admin/sales review"""
        session = self.get_session(session_id)
        if not session:
            return None
        
        messages = self.get_session_messages(session_id)
        
        # Format messages for display
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                "id": msg.message_id,
                "text": msg.text,
                "is_bot": msg.is_bot,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
                "sender": "StreamlineAI" if msg.is_bot else "Customer"
            })
        
        return {
            "session_id": session_id,
            "customer_id": session.customer_id,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            "status": getattr(session, 'status', 'active'),
            "is_seen": getattr(session, 'is_seen', False),
            "messages": formatted_messages
        }

    def get_all_sessions(self) -> List[ChatSession]:
        """Get all chat sessions ordered by creation date"""
        return self.db.query(ChatSession)\
            .options(
                joinedload(ChatSession.messages),
                joinedload(ChatSession.user)
            )\
            .order_by(ChatSession.created_at.desc())\
            .all()

    def get_all_sessions_with_customers(self) -> List[Tuple[ChatSession, Optional[User], int]]:
        """Get all sessions with customer info and message count for admin dashboard"""
        # Query sessions with left join to customers and count of messages
        result = self.db.query(
            ChatSession,
            User,
            func.count(ChatMessage.id).label('message_count')
        ).outerjoin(
            User, ChatSession.customer_id == User.id
        ).outerjoin(
            ChatMessage, ChatSession.id == ChatMessage.session_id
        ).group_by(
            ChatSession.id, User.id
        ).order_by(
            ChatSession.created_at.desc()
        ).all()
        
        return result
        
    def delete_session(self, session_id: str) -> None:
        """Delete a chat session and all its messages"""
        session = self.get_session(session_id)
        if session:
            # Delete all messages first
            self.db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
            # Then delete the session
            self.db.delete(session)
            self.db.commit()
