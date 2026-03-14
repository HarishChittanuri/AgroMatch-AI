"""Migration: add location text column to labor_profiles"""
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE labor_profiles ADD COLUMN IF NOT EXISTS location TEXT"))
    conn.commit()
    print("✅ Done — 'location' column added to labor_profiles")
