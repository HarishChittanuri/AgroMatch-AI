from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.database import get_db
from app import models
from app.core.deps import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications"])


# ─── Pydantic schemas (inline to keep self-contained) ─────────────────────────

class ApplicationCreate(BaseModel):
    job_id: int
    match_score: Optional[float] = 0.0

class ApplicationStatusUpdate(BaseModel):
    status: str  # pending / accepted / rejected

class LaborInfo(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    daily_rate: Optional[float] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None

    class Config:
        from_attributes = True

class JobInfo(BaseModel):
    id: int
    title: str
    wage: float
    location: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    labor_id: int
    match_score: Optional[float]
    status: str
    applied_at: datetime
    updated_at: Optional[datetime]
    job: Optional[JobInfo]
    labor: Optional[LaborInfo]

    class Config:
        from_attributes = True


# ─── POST /applications/ — Labor applies to a job ─────────────────────────────

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "labor":
        raise HTTPException(status_code=403, detail="Only labor users can apply to jobs")

    # Resolve labor profile
    labor = db.query(models.LaborProfile).filter(
        models.LaborProfile.user_id == current_user.id
    ).first()
    if not labor:
        raise HTTPException(status_code=404, detail="Complete your labor profile before applying")

    # Check the job exists
    job = db.query(models.JobPosting).filter(models.JobPosting.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Prevent duplicate applications
    existing = db.query(models.Application).filter(
        models.Application.job_id == payload.job_id,
        models.Application.labor_id == labor.id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this job")

    application = models.Application(
        job_id=payload.job_id,
        labor_id=labor.id,
        match_score=payload.match_score,
        status="pending"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


# ─── GET /applications/my-applications — Labor views their own applications ───

@router.get("/my-applications", response_model=List[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "labor":
        raise HTTPException(status_code=403, detail="Only labor users can view their applications")

    labor = db.query(models.LaborProfile).filter(
        models.LaborProfile.user_id == current_user.id
    ).first()
    if not labor:
        return []

    applications = db.query(models.Application).filter(
        models.Application.labor_id == labor.id
    ).order_by(models.Application.applied_at.desc()).all()

    return applications


# ─── GET /applications/job/{job_id} — Farmer views applicants for a job ───────

@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can view job applications")

    # Verify the job belongs to this farmer
    job = db.query(models.JobPosting).filter(
        models.JobPosting.id == job_id,
        models.JobPosting.farmer_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")

    applications = db.query(models.Application).filter(
        models.Application.job_id == job_id
    ).order_by(models.Application.match_score.desc()).all()

    return applications


# ─── PATCH /applications/{id}/status — Farmer updates application status ──────

@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    allowed = {"pending", "accepted", "rejected"}
    if payload.status not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{payload.status}'. Must be one of: {', '.join(sorted(allowed))}"
        )

    application = db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Only farmers can call this endpoint (to accept / reject)
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can update application status")

    job = db.query(models.JobPosting).filter(
        models.JobPosting.id == application.job_id,
        models.JobPosting.farmer_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=403, detail="Access denied")

    application.status = payload.status
    db.commit()
    db.refresh(application)
    return application


# ─── DELETE /applications/{id} — Labor withdraws their own application ─────────

@router.delete("/{application_id}", status_code=204)
def withdraw_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Labor can withdraw (delete) a pending application. Accepted apps cannot be withdrawn."""
    if current_user.role != "labor":
        raise HTTPException(status_code=403, detail="Only labor users can withdraw applications")

    labor = db.query(models.LaborProfile).filter(
        models.LaborProfile.user_id == current_user.id
    ).first()
    if not labor:
        raise HTTPException(status_code=404, detail="Labor profile not found")

    application = db.query(models.Application).filter(
        models.Application.id == application_id,
        models.Application.labor_id == labor.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.status == "accepted":
        raise HTTPException(
            status_code=403,
            detail="Cannot withdraw an accepted application. Contact the farmer directly."
        )

    db.delete(application)
    db.commit()
    return
