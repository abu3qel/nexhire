# NexHire — Multi-Modal Technical Candidate Assessment System

Final Year Project · Queen Mary University of London · Computer Science

NexHire automatically assesses job applicants across 5 modalities — Resume, Cover Letter, GitHub, Stack Overflow, and Portfolio — and produces a ranked candidate list. A RAG chatbot lets recruiters interrogate any candidate profile in natural language.

---

## Architecture

- **Backend**: FastAPI + SQLAlchemy async + PostgreSQL + pgvector + Celery/Redis
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **AI**: GPT-4o-mini (LLM extraction + RAG), SBERT all-MiniLM-L6-v2 (semantic matching), text-embedding-3-small (RAG embeddings)
- **External APIs**: GitHub REST API, Stack Exchange API

---

## Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker (for PostgreSQL + Redis)

### 1. Clone the repository

```bash
git clone <repo-url>
cd nexhire
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL 16 (with pgvector) on port 5432 and Redis 7 on port 6379.

### 3. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
- `OPENAI_API_KEY` — your OpenAI API key
- `GITHUB_TOKEN` — GitHub personal access token (for GitHub API)
- `STACK_EXCHANGE_KEY` — Stack Exchange API key
- `JWT_SECRET_KEY` — generate with `openssl rand -hex 32`

### 4. Install Python dependencies

```bash
pip install -r requirements.txt
# or with uv:
uv pip install -r requirements.txt
```

Install the Playwright browser used for JS-rendered portfolio scraping:

```bash
playwright install chromium
```

### 5. Run database migrations

```bash
alembic upgrade head
```

### 6. Start the FastAPI server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 7. Start the Celery worker (separate terminal)

```bash
celery -A app.workers.celery_app worker --loglevel=info
```

The worker processes assessment tasks asynchronously when candidates apply.

### 8. Configure frontend

```bash
cd ../frontend
cp .env.local.example .env.local
```

### 9. Install frontend dependencies

```bash
npm install
```

### 10. Start the frontend dev server

```bash
npm run dev
```

Frontend available at: http://localhost:3000

---

## Usage

### Recruiter flow
1. Register at `/register` with role = Recruiter
2. Create a job posting at `/recruiter/jobs/new` (multi-step: basics → JD → weights → review)
3. Share the job URL with candidates
4. When candidates apply, the assessment pipeline runs automatically in the background
5. View ranked candidates at `/recruiter/jobs/{id}` — three tabs: Composite Ranking, Resume-Only Baseline, Comparison
6. Click "View Profile" to see full score breakdown and chat with the RAG assistant about any candidate

### Candidate flow
1. Register at `/register` with role = Candidate
2. Browse open jobs at `/candidate/jobs`
3. Click "Apply Now" — drag-and-drop resume (required), cover letter (optional), add GitHub/SO/Portfolio URLs
4. Track application status at `/candidate/applications`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login, returns JWT |
| GET | /auth/me | Current user |
| POST | /jobs/ | Create job (recruiter) |
| GET | /jobs/ | List open jobs |
| GET | /jobs/{id} | Job detail |
| PUT | /jobs/{id}/weights | Update modality weights |
| POST | /applications/ | Submit application (multipart) |
| GET | /applications/my | Candidate's own applications |
| GET | /assessments/{app_id} | Assessment result |
| GET | /assessments/job/{job_id}/ranked | Ranked candidate list |
| POST | /rag/chat | RAG chatbot query |

---

## Assessment Pipeline

```
Application Submitted
       ↓
Celery Task Queued
       ↓
┌─────────────────────────────────────────────┐
│  Resume Module    → SBERT cosine similarity  │
│  Cover Letter     → GPT-4o-mini scoring      │
│  GitHub           → API + radon static analysis│
│  Stack Overflow   → API reputation scoring   │
│  Portfolio        → Scrape + GPT-4o-mini     │
└─────────────────────────────────────────────┘
       ↓
Weighted Late Fusion → composite_score
       ↓
pgvector RAG Ingestion (chunks + embeddings)
       ↓
Assessment status = "completed"
```

Each modality is wrapped in try/except — failures are logged in `error_log` and the remaining modalities continue.

---

## Decisions that deviate from spec

1. **Next.js version**: Using Next.js 14 as specified, but the existing repo had Next.js 16 beta — downgraded to stable 14.2.5 to match the spec.
2. **Tailwind version**: Downgraded from v4 (beta) to v3.4 for stable utility class support. The existing tailwind v4 config was replaced.
3. **No PR count/issues in contribution score**: GitHub API PR/issues counts require additional pagination; the implementation uses repo count, commits, and language diversity as specified. PR activity is included but may be limited by rate limits.
4. **Alembic migration**: The initial migration creates the pgvector `ivfflat` index with `lists=100`, which requires at least 100 rows to work effectively. For small datasets, the index is still created (no error, just falls back to sequential scan).
5. **Celery task import**: The Celery worker imports are deferred inside the task to avoid circular imports with SQLAlchemy models.

---

## Manual Configuration Required Before Running

1. Fill in `.env` with all API keys (OpenAI, GitHub, Stack Exchange, JWT secret)
2. Ensure Docker is running before starting the backend (`docker-compose up -d`)
3. Run `alembic upgrade head` before the first server start
4. The SBERT model (`all-MiniLM-L6-v2`) is downloaded automatically on first Celery worker start (~90MB)
5. GitHub static analysis (radon) requires `git` to be installed on the worker machine
6. Stack Exchange API works without a key but with lower rate limits; a key increases it to 10,000 requests/day
