from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import os
import httpx
import json
import numpy as np

from app.database import get_db
from app import models
from app.services.ai_service import matching_service
from app.core.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"   # best free model on Groq

SUPPORTED_LANGUAGES = {
    "hindi":     "Hindi (हिन्दी)",
    "telugu":    "Telugu (తెలుగు)",
    "tamil":     "Tamil (தமிழ்)",
    "kannada":   "Kannada (ಕನ್ನಡ)",
    "bengali":   "Bengali (বাংলা)",
    "marathi":   "Marathi (मराठी)",
    "gujarati":  "Gujarati (ગુજરાતી)",
    "malayalam": "Malayalam (മലയാളം)",
}


# ── Groq helper ───────────────────────────────────────────────────────────────

async def call_groq(messages: list, max_tokens: int = 1024) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured — add GROQ_API_KEY to .env")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "messages": messages, "max_tokens": max_tokens, "temperature": 0.7},
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()


# ── Cosine similarity helper ──────────────────────────────────────────────────

def cosine_similarity(a: list, b: list) -> float:
    va, vb = np.array(a), np.array(b)
    norm = np.linalg.norm(va) * np.linalg.norm(vb)
    return float(np.dot(va, vb) / norm) if norm > 0 else 0.0


# ══════════════════════════════════════════════════════════════════════════════
# 1.  POST /ai/explain-job  (existing feature)
# ══════════════════════════════════════════════════════════════════════════════

class ExplainJobRequest(BaseModel):
    title: str
    description: str
    wage: float
    location: Optional[str] = None
    duration: Optional[str] = None
    workers_needed: Optional[int] = None
    start_date: Optional[str] = None
    language: str


@router.post("/explain-job")
async def explain_job(payload: ExplainJobRequest):
    lang_key = payload.language.lower()
    if lang_key not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language.")
    lang_label = SUPPORTED_LANGUAGES[lang_key]

    job_info = (
        f"Job Title: {payload.title}\nDescription: {payload.description}\n"
        f"Daily Wage: ₹{payload.wage}\nLocation: {payload.location or 'Not specified'}\n"
        f"Start Date: {payload.start_date or 'Flexible'}\nDuration: {payload.duration or 'Not specified'}\n"
        f"Workers Needed: {payload.workers_needed or 1}"
    )
    prompt = (
        f"You are a helpful assistant for farm laborers in India.\n"
        f"Explain this job clearly in simple, friendly {lang_label}.\n"
        f"Cover: what work, daily pay, location, duration, start date, workers needed, honest advice.\n\n"
        f"Job Details:\n{job_info}\n\nExplain in {lang_label}:"
    )
    try:
        explanation = await call_groq([{"role": "user", "content": prompt}])
        return {"language": lang_label, "explanation": explanation}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# 2.  POST /ai/chat  — RAG Chatbot for labor & farmer
# ══════════════════════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


def _retrieve_jobs_context(query_vec: list, db: Session, top_k: int = 5) -> str:
    """Retrieve top-K jobs by cosine similarity to query vector."""
    jobs = db.query(models.JobPosting).filter(models.JobPosting.job_vector.isnot(None)).all()
    if not jobs:
        return "No jobs currently available in the database."

    scored = []
    for job in jobs:
        try:
            jv = json.loads(job.job_vector)
            score = cosine_similarity(query_vec, jv)
            scored.append((score, job))
        except Exception:
            continue

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:top_k]

    if not top:
        return "No relevant jobs found."

    lines = ["Here are the most relevant job postings from our database:\n"]
    for i, (score, job) in enumerate(top, 1):
        lines.append(
            f"{i}. **{job.title}**\n"
            f"   - Wage: ₹{job.wage}/day\n"
            f"   - Location: {job.location or 'Not specified'}\n"
            f"   - Duration: {job.duration or 'Not specified'}\n"
            f"   - Workers needed: {job.workers_needed or 1}\n"
            f"   - Description: {job.description[:200]}...\n"
            f"   - Match relevance: {score*100:.0f}%\n"
        )
    return "\n".join(lines)


def _retrieve_laborers_context(query_vec: list, db: Session, top_k: int = 5) -> str:
    """Retrieve top-K labor profiles by cosine similarity to query vector."""
    laborers = db.query(models.LaborProfile).filter(models.LaborProfile.profile_vector.isnot(None)).all()
    if not laborers:
        return "No labor profiles currently available in the database."

    scored = []
    for labor in laborers:
        try:
            lv = json.loads(labor.profile_vector)
            score = cosine_similarity(query_vec, lv)
            scored.append((score, labor))
        except Exception:
            continue

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:top_k]

    if not top:
        return "No relevant labor profiles found."

    lines = ["Here are the most relevant labor profiles from our database:\n"]
    for i, (score, labor) in enumerate(top, 1):
        lines.append(
            f"{i}. **{labor.full_name}**\n"
            f"   - Skills: {labor.skills or 'Not specified'}\n"
            f"   - Daily Rate: ₹{labor.daily_rate or 'Not specified'}/day\n"
            f"   - Location: {labor.location or 'Not specified'}\n"
            f"   - Bio: {(labor.bio or '')[:200]}...\n"
            f"   - Match relevance: {score*100:.0f}%\n"
        )
    return "\n".join(lines)


@router.post("/chat")
async def rag_chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    RAG Chatbot — role-aware:
    • Labor  → retrieves relevant job postings as context
    • Farmer → retrieves relevant labor profiles as context
    """
    # 1. Embed the user's question
    query_vec = matching_service.generate_vector(payload.message)

    # 2. Retrieve relevant context from DB (the RAG Retrieval step)
    role = current_user.role
    if role == "labor":
        context = _retrieve_jobs_context(query_vec, db)
        system_prompt = (
            "You are AgroMatch AI — a helpful assistant for farm laborers in India.\n"
            "You help laborers find suitable agricultural jobs, understand wages, and give career advice.\n"
            "Always base your answers on the REAL job data provided below. "
            "Be friendly, concise, and practical. If no relevant data, say so honestly.\n\n"
            f"=== RETRIEVED JOB DATA (from live database) ===\n{context}\n"
            "=== END OF DATA ===\n\n"
            "Answer the laborer's question using the above real job data."
        )
    elif role == "farmer":
        context = _retrieve_laborers_context(query_vec, db)
        system_prompt = (
            "You are AgroMatch AI — a helpful assistant for farmers in India.\n"
            "You help farmers find suitable laborers, give hiring advice, crop recommendations, and wage guidance.\n"
            "Always base your answers on the REAL labor profile data provided below. "
            "Be friendly, concise, and practical. If no relevant data, say so honestly.\n\n"
            f"=== RETRIEVED LABOR PROFILE DATA (from live database) ===\n{context}\n"
            "=== END OF DATA ===\n\n"
            "Answer the farmer's question using the above real labor data."
        )
    else:
        raise HTTPException(status_code=403, detail="Chatbot available for labor and farmer roles only")

    # 3. Build messages with history (multi-turn support)
    messages = [{"role": "system", "content": system_prompt}]
    for msg in (payload.history or [])[-6:]:   # last 6 messages for context window efficiency
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": payload.message})

    # 4. Call Groq (the RAG Generation step)
    try:
        answer = await call_groq(messages, max_tokens=800)
        return {"answer": answer, "context_used": len(context)}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
