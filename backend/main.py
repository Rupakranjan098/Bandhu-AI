from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

from database import engine, Base, get_db, SessionLocal
import models
import auth
from pydantic import BaseModel
from typing import List, Optional
from g4f.client import AsyncClient

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

# Seed default user
db = SessionLocal()
auth.create_default_user_if_not_exists(db)
db.close()

app = FastAPI(title="Bandhu AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/avatars", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)

class MessageRequest(BaseModel):
    conversation_id: Optional[int] = None
    content: str

# Free LLM API using g4f
async def real_llm_stream(prompt: str):
    clean_prompt = prompt.strip().lower()
    if clean_prompt in ["hi", "hii", "hello"]:
        yield "hello how can i help you"
        return

    client = AsyncClient()
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )
        if hasattr(response, '__aiter__'): # It's an async generator or stream
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        else: # It's just a normal object but g4f sometimes messes up the return type
            pass
    except TypeError as e:
        if "object can't be awaited" in str(e):
            # If it cannot be awaited, it means it returned the async generator directly
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        else:
            yield f"\n\n[Free API Error]: {str(e)}"
    except Exception as e:
        yield f"\n\n[Free API Error]: {str(e)}"

@app.post("/chat")
async def chat(req: Request, message_req: MessageRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # 1. Get or create conversation
    if not message_req.conversation_id:
        conv = models.Conversation(title=message_req.content[:30] + "...", user_id=current_user.id)
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
        
        # Fetch User Context
        tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id, models.Task.is_completed == 0).all()
        task_str = ", ".join([t.title for t in tasks]) or "None"
        events = db.query(models.Event).filter(models.Event.user_id == current_user.id).all()
        event_str = ", ".join([f"{e.title} on {e.date}" for e in events]) or "None"
        notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).limit(3).all()
        note_str = ", ".join([n.title for n in notes]) or "None"
        
        context_prompt = f"Context: Pending Tasks: {task_str}. Upcoming Events: {event_str}. Recent Notes: {note_str}.\n\nUser prompt: {message_req.content}"
        
        # Real streaming via Free LLM API
        async for chunk in real_llm_stream(context_prompt):
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

# --- Events API ---

class EventCreate(BaseModel):
    title: str
    date: str
    time: Optional[str] = None
    event_type: str
    description: Optional[str] = None

class EventResponse(BaseModel):
    id: int
    title: str
    date: str
    time: Optional[str] = None
    event_type: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

@app.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Event).filter(models.Event.user_id == current_user.id).all()

@app.post("/events", response_model=EventResponse)
def create_event(event: EventCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_event = models.Event(
        title=event.title, 
        user_id=current_user.id,
        date=event.date,
        time=event.time,
        event_type=event.event_type,
        description=event.description
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    from fastapi import HTTPException
    db_event = db.query(models.Event).filter(models.Event.id == event_id, models.Event.user_id == current_user.id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return {"status": "success"}

# --- Analytics API ---

@app.get("/analytics/weekly")
def get_weekly_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    import datetime
    today = datetime.datetime.utcnow().date()
    
    dates = [(today - datetime.timedelta(days=i)) for i in range(6, -1, -1)]
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    all_tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    all_events = db.query(models.Event).filter(models.Event.user_id == current_user.id).all()
    all_convs = db.query(models.Conversation).filter(models.Conversation.user_id == current_user.id).all()
    
    results = []
    for d in dates:
        day_name = days_of_week[d.weekday()]
        
        tasks_count = sum(1 for t in all_tasks if t.created_at and t.created_at.date() == d)
        events_count = sum(1 for e in all_events if e.date == d.strftime("%Y-%m-%d"))
        conv_count = sum(1 for c in all_convs if c.created_at and c.created_at.date() == d)
        
        results.append({
            "name": day_name,
            "Conversations": conv_count,
            "Tasks": tasks_count,
            "Events": events_count
        })
        
    return results

# --- USER PREFERENCES ---

class UserPreferenceBase(BaseModel):
    theme: str = "Dark"
    language: str = "English"
    ai_response_style: str = "Balanced"
    auto_suggest: bool = True
    sound_effects: bool = False
    context_awareness: bool = True
    proactive_assistance: bool = True
    daily_summary: bool = True
    personalization: bool = True
    data_usage: bool = False
    two_factor_auth: bool = False
    login_alerts: bool = True
    share_analytics: bool = False
    allow_ai_training: bool = False
    timezone: str = "(GMT+5:30) Asia/Kolkata"

class UserPreferenceUpdate(UserPreferenceBase):
    pass

class UserPreferenceResponse(UserPreferenceBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

@app.get("/preferences", response_model=UserPreferenceResponse)
def get_preferences(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    prefs = db.query(models.UserPreference).filter(models.UserPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = models.UserPreference(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return UserPreferenceResponse(
        id=prefs.id,
        user_id=prefs.user_id,
        theme=prefs.theme,
        language=prefs.language,
        ai_response_style=prefs.ai_response_style,
        auto_suggest=bool(prefs.auto_suggest),
        sound_effects=bool(prefs.sound_effects),
        context_awareness=bool(prefs.context_awareness),
        proactive_assistance=bool(prefs.proactive_assistance),
        daily_summary=bool(prefs.daily_summary),
        personalization=bool(prefs.personalization),
        data_usage=bool(prefs.data_usage),
        two_factor_auth=bool(prefs.two_factor_auth),
        login_alerts=bool(prefs.login_alerts),
        share_analytics=bool(prefs.share_analytics),
        allow_ai_training=bool(prefs.allow_ai_training),
        timezone=prefs.timezone
    )

@app.put("/preferences", response_model=UserPreferenceResponse)
def update_preferences(prefs_update: UserPreferenceUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    prefs = db.query(models.UserPreference).filter(models.UserPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = models.UserPreference(user_id=current_user.id)
        db.add(prefs)
    
    prefs.theme = prefs_update.theme
    prefs.language = prefs_update.language
    prefs.ai_response_style = prefs_update.ai_response_style
    prefs.auto_suggest = 1 if prefs_update.auto_suggest else 0
    prefs.sound_effects = 1 if prefs_update.sound_effects else 0
    prefs.context_awareness = 1 if prefs_update.context_awareness else 0
    prefs.proactive_assistance = 1 if prefs_update.proactive_assistance else 0
    prefs.daily_summary = 1 if prefs_update.daily_summary else 0
    prefs.personalization = 1 if prefs_update.personalization else 0
    prefs.data_usage = 1 if prefs_update.data_usage else 0
    prefs.two_factor_auth = 1 if prefs_update.two_factor_auth else 0
    prefs.login_alerts = 1 if prefs_update.login_alerts else 0
    prefs.share_analytics = 1 if prefs_update.share_analytics else 0
    prefs.allow_ai_training = 1 if prefs_update.allow_ai_training else 0
    prefs.timezone = prefs_update.timezone
    
    db.commit()
    db.refresh(prefs)
    
    return UserPreferenceResponse(
        id=prefs.id,
        user_id=prefs.user_id,
        theme=prefs.theme,
        language=prefs.language,
        ai_response_style=prefs.ai_response_style,
        auto_suggest=bool(prefs.auto_suggest),
        sound_effects=bool(prefs.sound_effects),
        context_awareness=bool(prefs.context_awareness),
        proactive_assistance=bool(prefs.proactive_assistance),
        daily_summary=bool(prefs.daily_summary),
        personalization=bool(prefs.personalization),
        data_usage=bool(prefs.data_usage),
        two_factor_auth=bool(prefs.two_factor_auth),
        login_alerts=bool(prefs.login_alerts),
        share_analytics=bool(prefs.share_analytics),
        allow_ai_training=bool(prefs.allow_ai_training),
        timezone=prefs.timezone
    )


# --- NOTES ---

class NoteCreate(BaseModel):
    title: str
    content: str = ""
    tags: str = ""
    is_favorite: bool = False
    is_archived: bool = False

class NoteUpdate(BaseModel):
    title: str = None
    content: str = None
    tags: str = None
    is_favorite: bool = None
    is_archived: bool = None

class NoteResponse(NoteCreate):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True

@app.get("/notes", response_model=List[NoteResponse])
def get_notes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Note).filter(models.Note.user_id == current_user.id).order_by(models.Note.updated_at.desc()).all()

@app.post("/notes", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_note = models.Note(
        user_id=current_user.id,
        title=note.title,
        content=note.content,
        tags=note.tags,
        is_favorite=1 if note.is_favorite else 0,
        is_archived=1 if note.is_archived else 0
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    from fastapi import HTTPException
    db_note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note_update.title != None:
        db_note.title = note_update.title
    if note_update.content != None:
        db_note.content = note_update.content
    if note_update.tags != None:
        db_note.tags = note_update.tags
    if note_update.is_favorite != None:
        db_note.is_favorite = 1 if note_update.is_favorite else 0
    if note_update.is_archived != None:
        db_note.is_archived = 1 if note_update.is_archived else 0
        
    db.commit()
    db.refresh(db_note)
    return db_note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    from fastapi import HTTPException
    db_note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"status": "success"}

