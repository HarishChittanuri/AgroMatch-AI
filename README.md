# AgroMatch AI

**AI-powered agricultural labor marketplace** connecting farmers and farm workers across India.

---

## 🌾 What is this?

AgroMatch AI is a full-stack web platform that uses **NLP and LLM-based AI** to match farm laborers with job opportunities and help both parties communicate effectively.

## 🤖 AI/ML Features

| Feature | Tech Used |
|---|---|
| **Semantic Job Matching** | Sentence Transformers (MiniLM), Cosine Similarity |
| **Fuzzy Location Scoring** | Jaccard Similarity + Substring Overlap |
| **Multilingual Job Explainer** | Groq LLaMA 3.3-70B, 8 Indian Languages |
| **RAG Chatbot** | Vector Search + Groq LLM, role-aware context retrieval |

## 🏗️ Tech Stack

**Frontend:** React 18, TypeScript, React Router, Axios  
**Backend:** FastAPI, SQLAlchemy, Pydantic v2, JWT Auth  
**Database:** PostgreSQL (Neon serverless)  
**AI:** Sentence Transformers, Groq API (LLaMA 3.3-70B)

## ✨ Key Features

- **For Farmers:** Post jobs, browse AI-ranked applicants, accept/reject with one click, auto-delete expired postings
- **For Laborers:** View AI-matched jobs by relevance score, apply/withdraw, edit profile (updates AI embedding), read job descriptions in your native language

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

See `backend/.env.example` for the required variables:
- `DATABASE_URL` — PostgreSQL connection string (Neon or any Postgres)
- `SECRET_KEY` — JWT signing secret
- `GROQ_API_KEY` — Free at [console.groq.com](https://console.groq.com)
- `GEMINI_API_KEY` — Optional, for Gemini models

## 📁 Project Structure

```
AgroMatch AI/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, jobs, profiles, ai, applications)
│   │   ├── services/     # AI matching service (MiniLM embeddings)
│   │   ├── models.py     # SQLAlchemy ORM models
│   │   ├── schemas.py    # Pydantic schemas
│   │   └── main.py       # FastAPI app + background scheduler
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/        # React pages (dashboards, job details, profiles)
│       ├── components/   # Shared components (ChatWidget)
│       └── services/     # API service layer
└── README.md
```
