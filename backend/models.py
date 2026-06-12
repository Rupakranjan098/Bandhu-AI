from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="test")
    avatar_url = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True, default="New Conversation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    messages = relationship("Message", back_populates="conversation")
    user = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String) # 'user' or 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(String, nullable=True)
    priority = Column(String, default="Medium")
    category = Column(String, nullable=True)
    reminder = Column(String, nullable=True)
    is_important = Column(Integer, default=0) # SQLite boolean
    is_completed = Column(Integer, default=0) # SQLite boolean
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    date = Column(String) # ISO date string YYYY-MM-DD
    time = Column(String, nullable=True) # "10:00 AM"
    event_type = Column(String) # "Meeting", "Occasion", "Special Day"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String, default="Dark")
    language = Column(String, default="English")
    ai_response_style = Column(String, default="Balanced")
    auto_suggest = Column(Integer, default=1) # 1 for True, 0 for False
    sound_effects = Column(Integer, default=0)
    context_awareness = Column(Integer, default=1)
    proactive_assistance = Column(Integer, default=1)
    daily_summary = Column(Integer, default=1)
    data_usage = Column(Integer, default=0)
    two_factor_auth = Column(Integer, default=0)
    login_alerts = Column(Integer, default=1)
    share_analytics = Column(Integer, default=0)
    allow_ai_training = Column(Integer, default=0)
    timezone = Column(String, default="(GMT+5:30) Asia/Kolkata")

    user = relationship("User")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    content = Column(Text, nullable=True)
    tags = Column(String, nullable=True) # Comma-separated tags
    is_favorite = Column(Integer, default=0)
    is_archived = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User")
