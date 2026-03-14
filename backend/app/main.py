from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app.api import auth, profiles, jobs, matches, applications, ai
import app.models
import asyncio
import logging
from datetime import date

logger = logging.getLogger("agromatch.scheduler")

# ── Background job: delete expired postings ───────────────────────────────────
async def delete_expired_jobs():
    """Runs every hour. Deletes jobs whose start_date has passed."""
    while True:
        try:
            db = SessionLocal()
            today = date.today()
            expired = (
                db.query(app.models.JobPosting)
                .filter(
                    app.models.JobPosting.start_date.isnot(None),
                    app.models.JobPosting.start_date < today,
                )
                .all()
            )
            if expired:
                expired_ids = [job.id for job in expired]
                # Delete related rows first (FK constraints)
                db.query(app.models.Application).filter(
                    app.models.Application.job_id.in_(expired_ids)
                ).delete(synchronize_session=False)
                db.query(app.models.Match).filter(
                    app.models.Match.job_id.in_(expired_ids)
                ).delete(synchronize_session=False)
                # Now delete the jobs
                for job in expired:
                    db.delete(job)
                db.commit()
                logger.info(f"[Scheduler] Auto-deleted {len(expired)} expired job(s): {expired_ids}")
            else:
                logger.debug("[Scheduler] No expired jobs found.")
            db.close()
        except Exception as e:
            logger.error(f"[Scheduler] Error during cleanup: {e}")
        await asyncio.sleep(3600)   # run every hour


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background scheduler on startup
    task = asyncio.create_task(delete_expired_jobs())
    logger.info("[Scheduler] Expired-job cleanup task started.")
    yield
    # Cancel on shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgroMatch AI",
    description="AI-Powered Agricultural Job Matching Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
import os as _os
_frontend_url = _os.getenv("FRONTEND_URL", "")
_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if _frontend_url:
    _origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(jobs.router)
app.include_router(matches.router)
app.include_router(applications.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to AgroMatch AI",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Add this OPTIONS handler for preflight requests
@app.options("/{rest_of_path:path}")
async def preflight_handler():
    return {}