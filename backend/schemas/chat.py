from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    message: str
    session_id: str
    user_email: Optional[str] = None

class ChatMessageCreate(BaseModel):
    text: str
    is_bot: bool = False

class ChatMessage(BaseModel):
    id: int
    message_id: str
    text: str
    is_bot: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    session_id: str
    status: Optional[str] = "active"

class ChatSessionCreate(ChatSessionBase):
    customer_id: Optional[int] = None

class ChatSession(ChatSessionBase):
    id: int
    customer_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[ChatMessage] = []
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_email: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
