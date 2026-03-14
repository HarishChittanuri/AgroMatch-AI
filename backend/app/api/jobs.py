from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import json, re, math
from collections import Counter

from app.database import get_db
from app import models, schemas
from app.services.ai_service import matching_service
from app.core.deps import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# ... rest of your code stays exactly the same

@router.post("/", response_model=schemas.JobResponse)
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if user is farmer
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can create jobs")
    
    # Generate job vector from title and description
    text_for_vector = f"{job.title} {job.description}"
    vector = matching_service.generate_vector(text_for_vector)
    
    # Create job
    db_job = models.JobPosting(
        farmer_id=current_user.id,
        title=job.title,
        description=job.description,
        wage=job.wage,
        location_lat=job.location_lat,
        location_lng=job.location_lng,
        job_vector=json.dumps(vector)
    )
    
    db.add(db_job)
    
    # Update user onboarding status
    if not current_user.is_onboarded:
        current_user.is_onboarded = True
    
    db.commit()
    db.refresh(db_job)
    
    # Convert response
    response = schemas.JobResponse.from_orm(db_job)
    response.job_vector = vector
    
    return response

@router.get("/", response_model=List[schemas.JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    jobs = db.query(models.JobPosting).offset(skip).limit(limit).all()
    
    responses = []
    for job in jobs:
        resp = schemas.JobResponse.from_orm(job)
        resp.job_vector = json.loads(job.job_vector) if job.job_vector else None
        responses.append(resp)
    
    return responses


# ── TF-IDF style location scoring helpers ────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    """Lowercase, strip punctuation, split into word tokens."""
    return re.findall(r'[a-z]+', text.lower()) if text else []

def _location_score(query: str, location: str) -> float:
    """
    Returns a relevance score [0.0 – 1.0] between a query and a location string.
    Uses token overlap (Jaccard-like) + substring bonus.
    """
    if not location:
        return 0.0
    q_tokens = set(_tokenize(query))
    l_tokens = set(_tokenize(location))
    if not q_tokens:
        return 0.0
    # Token intersection / union (Jaccard)
    intersection = q_tokens & l_tokens
    union = q_tokens | l_tokens
    jaccard = len(intersection) / len(union) if union else 0.0
    # Substring bonus: partial match (e.g. "hyd" matches "hyderabad")
    q_lower = query.lower()
    loc_lower = location.lower()
    substring_bonus = 0.3 if q_lower in loc_lower or loc_lower in q_lower else 0.0
    return min(1.0, jaccard + substring_bonus)


@router.get("/search")
def search_jobs_by_location(
    q: str = Query(..., description="Location keyword to search for"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Search jobs by location using TF-IDF style token overlap + substring matching.
    Returns all jobs scored by relevance, highest relevance first.
    """
    all_jobs = db.query(models.JobPosting).order_by(models.JobPosting.created_at.desc()).all()

    results = []
    for job in all_jobs:
        loc = getattr(job, 'location', None) or ''
        score = _location_score(q, loc)
        results.append({
            'job_id': job.id,
            'job_title': job.title,
            'description': job.description,
            'wage': job.wage,
            'location': loc or None,
            'start_date': str(job.start_date) if job.start_date else None,
            'workers_needed': job.workers_needed or 1,
            'duration': getattr(job, 'duration', None),
            'created_at': job.created_at.isoformat() if job.created_at else None,
            'relevance': round(score, 3),
        })

    # Sort by relevance score descending; include all so labor can see no-location jobs too
    results.sort(key=lambda x: x['relevance'], reverse=True)
    return {'results': results, 'total': len(results), 'query': q}


@router.get("/my-jobs", response_model=List[schemas.JobResponse])
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get only the jobs posted by the currently logged-in farmer"""
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can access their job listings")

    my_jobs = db.query(models.JobPosting).filter(
        models.JobPosting.farmer_id == current_user.id
    ).order_by(models.JobPosting.created_at.desc()).all()

    responses = []
    for job in my_jobs:
        resp = schemas.JobResponse.from_orm(job)
        resp.job_vector = json.loads(job.job_vector) if job.job_vector else None
        responses.append(resp)

    return responses


@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job_by_id(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a single job posting by ID"""
    job = db.query(models.JobPosting).filter(models.JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resp = schemas.JobResponse.from_orm(job)
    resp.job_vector = json.loads(job.job_vector) if job.job_vector else None
    return resp


@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a job — only the farmer who posted it can delete it"""
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can delete jobs")

    job = db.query(models.JobPosting).filter(
        models.JobPosting.id == job_id,
        models.JobPosting.farmer_id == current_user.id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")

    # Also delete all associated applications
    db.query(models.Application).filter(models.Application.job_id == job_id).delete()
    db.delete(job)
    db.commit()

