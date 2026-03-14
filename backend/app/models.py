from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base  # Changed from 'database' to 'app.database'
import json

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    auth_provider = Column(String, default="local")
    role = Column(String)
    is_onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    labor_profile = relationship("LaborProfile", back_populates="user", uselist=False)
    job_postings = relationship("JobPosting", back_populates="farmer")

class LaborProfile(Base):
    __tablename__ = "labor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String)
    phone = Column(String, nullable=True)          # Contact number shown to farmer on accept
    skills = Column(Text)
    bio = Column(Text)
    daily_rate = Column(Float)
    location = Column(String, nullable=True)       # Human-readable location e.g. 'Hyderabad'
    location_lat = Column(Float, nullable=True)    # kept for legacy, no longer required
    location_lng = Column(Float, nullable=True)
    profile_vector = Column(Text)  # Store vector as JSON string
    
    user = relationship("User", back_populates="labor_profile")
    applications = relationship("Application", back_populates="labor")

class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    wage = Column(Float)
    location_lat = Column(Float)
    location_lng = Column(Float)
    job_vector = Column(Text)  # Store vector as JSON string
    location = Column(String, nullable=True)               # Human-readable location (e.g. Hyderabad)
    start_date = Column(Date, nullable=True)               # When work begins
    workers_needed = Column(Integer, default=1)            # How many workers required
    duration = Column(String, nullable=True)               # e.g. '1 week', 'Ongoing'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    farmer = relationship("User", back_populates="job_postings")
    matches = relationship("Match", back_populates="job")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"))
    labor_id = Column(Integer, ForeignKey("labor_profiles.id"))
    score = Column(Float)
    match_explanation = Column(Text)
    status = Column(String, default="pending")
    viewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    job = relationship("JobPosting", back_populates="matches")
    labor = relationship("LaborProfile")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"))
    labor_id = Column(Integer, ForeignKey("labor_profiles.id"))
    match_score = Column(Float)
    status = Column(String, default="pending")  # pending / accepted / rejected
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job = relationship("JobPosting")
    labor = relationship("LaborProfile", back_populates="applications")
