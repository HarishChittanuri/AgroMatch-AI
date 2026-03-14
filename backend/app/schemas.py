from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime, date

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str = Field(..., max_length=72)
    auth_provider: str = "local"

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)

class UserResponse(UserBase):
    id: int
    is_onboarded: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Labor Profile schemas
class LaborProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    skills: str
    bio: str
    daily_rate: float
    location: Optional[str] = None          # Human-readable e.g. 'Hyderabad, Telangana'
    location_lat: Optional[float] = None    # Legacy — no longer required
    location_lng: Optional[float] = None

class LaborProfileCreate(LaborProfileBase):
    pass

class LaborProfileResponse(LaborProfileBase):
    id: int
    user_id: int
    profile_vector: Optional[List[float]] = None
    
    @field_validator('profile_vector', mode='before')
    @classmethod
    def parse_vector(cls, v: Any):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except ValueError:
                return None
        return v
    
    class Config:
        from_attributes = True

# Job schemas
class JobBase(BaseModel):
    title: str
    description: str
    wage: float
    location_lat: float
    location_lng: float
    location: Optional[str] = None
    start_date: Optional[date] = None
    workers_needed: Optional[int] = 1
    duration: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    farmer_id: int
    created_at: datetime
    job_vector: Optional[List[float]] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    workers_needed: Optional[int] = 1
    duration: Optional[str] = None
    
    @field_validator('job_vector', mode='before')
    @classmethod
    def parse_vector(cls, v: Any):
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except ValueError:
                return None
        return v
    
    class Config:
        from_attributes = True

# Match schemas
class MatchResponse(BaseModel):
    id: int
    job_id: int
    labor_id: int
    score: float
    match_explanation: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True