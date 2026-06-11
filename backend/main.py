from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import os
from dotenv import load_dotenv

from database import engine, Base, get_db, SessionLocal
import models
import auth
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

# Seed default user
db = SessionLocal()
auth.create_default_user_if_not_exists(db)
db.close()

app = FastAPI(title="Bandhu AI API")

app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    conversation_id: Optional[int] = None
    content: str

# Mock generator for LLM streaming
async def mock_llm_stream(prompt: str):
    response = f"This is a mocked response to your message: '{prompt}'.\n\nI am streaming this token by token. *Markdown* is also **supported**! Here is a list:\n- Item 1\n- Item 2"
    tokens = response.split(' ')
    for i, token in enumerate(tokens):
        await asyncio.sleep(0.1) # Simulate delay
        yield f"{token} " if i < len(tokens)-1 else token

@app.post("/chat")
async def chat(req: Request, message_req: MessageRequest, db: Session = Depends(get_db)):
    # 1. Get or create conversation
    if not message_req.conversation_id:
        conv = models.Conversation(title=message_req.content[:30] + "...")
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id
    else:
        conv_id = message_req.conversation_id

    # 2. Save user message
    user_msg = models.Message(conversation_id=conv_id, role="user", content=message_req.content)
    db.add(user_msg)
    db.commit()

    # 3. Stream response
    async def event_generator():
        yield {
            "event": "meta",
            "data": json.dumps({"conversation_id": conv_id})
        }
        
        full_response = ""
        # Mock streaming for now. If you want real OpenAI/Gemini, you'd replace this loop.
        async for chunk in mock_llm_stream(message_req.content):
            full_response += chunk
            yield {
                "event": "message",
                "data": json.dumps({"chunk": chunk})
            }
        
        # Save assistant message after stream completes
        ast_msg = models.Message(conversation_id=conv_id, role="assistant", content=full_response)
        db.add(ast_msg)
        db.commit()

        yield {
            "event": "done",
            "data": "done"
        }

    return EventSourceResponse(event_generator())

# --- Conversations API ---

import datetime

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime.datetime
    subtitle: Optional[str] = None
    
    class Config:
        from_attributes = True

@app.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    convs = db.query(models.Conversation).filter(models.Conversation.user_id == current_user.id).order_by(models.Conversation.created_at.desc()).all()
    results = []
    for c in convs:
        latest_msg = db.query(models.Message).filter(models.Message.conversation_id == c.id).order_by(models.Message.created_at.desc()).first()
        subtitle = latest_msg.content[:60] + "..." if latest_msg else "New conversation"
        results.append({
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at,
            "subtitle": subtitle
        })
    return results

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@app.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    from fastapi import HTTPException
    conv = db.query(models.Conversation).filter(models.Conversation.id == conversation_id, models.Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(models.Message).filter(models.Message.conversation_id == conversation_id).order_by(models.Message.created_at.asc()).all()
    return messages

# --- Tasks API ---

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = "Medium"
    category: Optional[str] = None
    reminder: Optional[str] = None
    is_important: Optional[int] = 0

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    reminder: Optional[str] = None
    is_important: int
    is_completed: int
    
    class Config:
        from_attributes = True

@app.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Task).filter(models.Task.user_id == current_user.id).all()

@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_task = models.Task(
        title=task.title, 
        user_id=current_user.id,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        category=task.category,
        reminder=task.reminder,
        is_important=task.is_important
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def toggle_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    from fastapi import HTTPException
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.is_completed = 1 if db_task.is_completed == 0 else 0
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    from fastapi import HTTPException
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"status": "success"}
