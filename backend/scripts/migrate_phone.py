"""One-off migration: add phone column to labor_profiles"""
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE labor_profiles ADD COLUMN IF NOT EXISTS phone TEXT"))
    conn.commit()
    print("✅ Done — 'phone' column added to labor_profiles")
