from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app import models, schemas
from app.services.ai_service import matching_service
from app.core.deps import get_current_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.post("/labor", response_model=schemas.LaborProfileResponse)
def create_labor_profile(
    profile: schemas.LaborProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "labor":
        raise HTTPException(status_code=403, detail="Only labor users can create labor profiles")
    
    existing = db.query(models.LaborProfile).filter(models.LaborProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    text_for_vector = f"{profile.skills} {profile.bio}"
    vector = matching_service.generate_vector(text_for_vector)
    
    db_profile = models.LaborProfile(
        user_id=current_user.id,
        full_name=profile.full_name,
        phone=profile.phone,
        skills=profile.skills,
        bio=profile.bio,
        daily_rate=profile.daily_rate,
        location=profile.location,
        location_lat=profile.location_lat,
        location_lng=profile.location_lng,
        profile_vector=json.dumps(vector)
    )
    
    db.add(db_profile)
    current_user.is_onboarded = True
    db.commit()
    db.refresh(db_profile)
    
    response = schemas.LaborProfileResponse.from_orm(db_profile)
    response.profile_vector = vector
    return response


@router.put("/labor", response_model=schemas.LaborProfileResponse)
def update_labor_profile(
    profile: schemas.LaborProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update the current labor user's profile. Regenerates the AI vector."""
    if current_user.role != "labor":
        raise HTTPException(status_code=403, detail="Only labor users can update labor profiles")

    db_profile = db.query(models.LaborProfile).filter(
        models.LaborProfile.user_id == current_user.id
    ).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")

    # Regenerate embedding so matches stay fresh
    text_for_vector = f"{profile.skills} {profile.bio}"
    vector = matching_service.generate_vector(text_for_vector)

    db_profile.full_name = profile.full_name
    db_profile.phone = profile.phone
    db_profile.skills = profile.skills
    db_profile.bio = profile.bio
    db_profile.daily_rate = profile.daily_rate
    db_profile.location = profile.location
    db_profile.location_lat = profile.location_lat
    db_profile.location_lng = profile.location_lng
    db_profile.profile_vector = json.dumps(vector)

    db.commit()
    db.refresh(db_profile)

    response = schemas.LaborProfileResponse.from_orm(db_profile)
    response.profile_vector = vector
    return response


@router.get("/labor/me", response_model=schemas.LaborProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = db.query(models.LaborProfile).filter(models.LaborProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    response = schemas.LaborProfileResponse.from_orm(profile)
    response.profile_vector = json.loads(profile.profile_vector) if profile.profile_vector else None
    return response
