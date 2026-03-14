from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app import models, schemas
from app.services.ai_service import matching_service
from app.core.deps import get_current_user

router = APIRouter(prefix="/matches", tags=["Matches"])

# ... rest of your code stays exactly the same

@router.get("/for-labor")
def get_matches_for_labor(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get job matches for a labor user — returns ALL jobs sorted by match score"""
    if current_user.role != "labor":
        raise HTTPException(status_code=403, detail="Only labor users can view job matches")
    
    # Get labor profile
    labor_profile = db.query(models.LaborProfile).filter(
        models.LaborProfile.user_id == current_user.id
    ).first()
    
    if not labor_profile:
        raise HTTPException(status_code=404, detail="Complete your profile first")
    
    # Get all jobs
    jobs = db.query(models.JobPosting).order_by(models.JobPosting.created_at.desc()).all()
    
    # Prepare labor data for matching
    labor_data = {
        'profile_vector': json.loads(labor_profile.profile_vector) if labor_profile.profile_vector else None,
        'daily_rate': labor_profile.daily_rate,
        'location': getattr(labor_profile, 'location', None) or '',
        'skills': labor_profile.skills
    }
    
    matches_list = []
    for job in jobs:
        job_data = {
            'job_vector': json.loads(job.job_vector) if job.job_vector else None,
            'wage': job.wage,
            'location_lat': job.location_lat,
            'location_lng': job.location_lng,
            'description': job.description
        }
        
        # Calculate match score
        result = matching_service.calculate_match_score(job_data, labor_data)
        score = result['score']

        # Save match to DB if score > 50 (only persist good ones)
        if score > 50:
            existing = db.query(models.Match).filter(
                models.Match.job_id == job.id,
                models.Match.labor_id == labor_profile.id
            ).first()
            if not existing:
                db_match = models.Match(
                    job_id=job.id,
                    labor_id=labor_profile.id,
                    score=score,
                    match_explanation=result['explanation'],
                    status='pending'
                )
                db.add(db_match)
        
        # Always include in response regardless of score
        matches_list.append({
            'job_id': job.id,
            'job_title': job.title,
            'description': job.description,
            'farmer_id': job.farmer_id,
            'score': round(score, 1),
            'explanation': result['explanation'],
            'wage': job.wage,
            'location': getattr(job, 'location', None),
            'start_date': str(job.start_date) if job.start_date else None,
            'workers_needed': job.workers_needed or 1,
            'duration': getattr(job, 'duration', None),
            'components': result['components'],
            'created_at': job.created_at.isoformat() if job.created_at else None,
        })
    
    try:
        db.commit()
    except Exception:
        db.rollback()

    # Sort by score descending
    matches_list.sort(key=lambda x: x['score'], reverse=True)
    
    return {
        'matches': matches_list,
        'total': len(matches_list)
    }

@router.get("/my-matches", response_model=List[schemas.MatchResponse])
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all matches for current user"""
    if current_user.role == 'labor':
        labor_profile = db.query(models.LaborProfile).filter(
            models.LaborProfile.user_id == current_user.id
        ).first()
        
        if not labor_profile:
            return []
        
        matches = db.query(models.Match).filter(
            models.Match.labor_id == labor_profile.id
        ).order_by(models.Match.score.desc()).all()
        
    else:  # farmer
        matches = db.query(models.Match).join(
            models.JobPosting, models.Match.job_id == models.JobPosting.id
        ).filter(
            models.JobPosting.farmer_id == current_user.id
        ).order_by(models.Match.score.desc()).all()
    
    return matches