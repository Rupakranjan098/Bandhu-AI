import sys
sys.path.append('.')
from database import engine, Base
import models
from sqlalchemy.orm import Session
import datetime

# Create tables
Base.metadata.create_all(bind=engine)

db = Session(bind=engine)

# Assuming default user is 1
user_id = 1

# Check if notes exist
if db.query(models.Note).count() == 0:
    notes_data = [
        ("Project Planning", "Outline for the new AI assistant project including features, timeline, and milestones...", "#Work, #AI", 1),
        ("AI Research Notes", "Key insights from today's research on LLMs and their applications...", "#AI, #Research", 0),
        ("Product Ideas", "Brainstorming session for new product ideas that can solve real user problems...", "#Ideas, #Product", 1),
        ("Meeting Notes", "Discussed project update, roadblocks, and next steps with the team...", "#Meeting, #Work", 0),
        ("Personal Journal", "Today was a productive day. Learned a lot about focus and building better habits...", "#Personal", 1),
        ("Code Snippets", "Useful code snippets and commands for AI/ML projects...\n\nfunction success() {\n  return 'Make it simple, but significant.';\n}", "#Code, #AI", 0),
    ]

    for data in notes_data:
        n = models.Note(
            user_id=user_id,
            title=data[0],
            content=data[1],
            tags=data[2],
            is_favorite=data[3]
        )
        db.add(n)
    
    db.commit()
    print("Seeded database with notes.")
else:
    print("Notes already exist.")
