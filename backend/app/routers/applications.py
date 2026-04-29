import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional

from app.database import get_db
from app.models.application import Application
from app.models.assessment import Assessment
from app.models.job import Job
from app.models.user import User
from app.schemas.application import ApplicationOut
from app.routers.auth import get_current_user, require_candidate, require_recruiter
from app.services.file_parser import extract_text
from app.config import settings
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["applications"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def save_upload(file: UploadFile, dest_dir: str, filename: str) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Only PDF and DOCX files allowed, got {ext}")
    os.makedirs(dest_dir, exist_ok=True)
    path = os.path.join(dest_dir, filename + ext)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path


@router.post("/", status_code=202)
async def submit_application(
    job_id: str = Form(...),
    github_url: Optional[str] = Form(None),
    stackoverflow_url: Optional[str] = Form(None),
    portfolio_url: Optional[str] = Form(None),
    resume: UploadFile = File(...),
    cover_letter: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    result = await db.execute(select(Job).where(Job.id == job_id, Job.status == "open"))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not open")

    existing = await db.execute(
        select(Application).where(
            Application.job_id == job_id, Application.candidate_id == current_user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already applied to this job")

    application_id = uuid.uuid4()
    dest_dir = os.path.join(settings.UPLOAD_DIR, str(application_id))

    resume_path = save_upload(resume, dest_dir, "resume")
    raw_resume_text = extract_text(resume_path)

    cover_letter_path = None
    raw_cover_letter_text = None
    if cover_letter and cover_letter.filename:
        cover_letter_path = save_upload(cover_letter, dest_dir, "cover_letter")
        raw_cover_letter_text = extract_text(cover_letter_path)

    # Store paths relative to UPLOAD_DIR
    rel_resume = os.path.relpath(resume_path, settings.UPLOAD_DIR)
    rel_cover = os.path.relpath(cover_letter_path, settings.UPLOAD_DIR) if cover_letter_path else None

    application = Application(
        id=application_id,
        job_id=job_id,
        candidate_id=current_user.id,
        resume_path=rel_resume,
        cover_letter_path=rel_cover,
        github_url=github_url or None,
        stackoverflow_url=stackoverflow_url or None,
        portfolio_url=portfolio_url or None,
        raw_resume_text=raw_resume_text,
        raw_cover_letter_text=raw_cover_letter_text,
    )
    db.add(application)

    assessment = Assessment(application_id=application_id, status="pending")
    db.add(assessment)

    await db.commit()

    # Fire Celery task (no await — fire and forget)
    try:
        celery_app.send_task("run_assessment", args=[str(application_id)])
        logger.info("Dispatched assessment task for application %s", application_id)
    except Exception as e:
        logger.error("Failed to dispatch assessment task for %s: %s", application_id, e, exc_info=True)

    await db.refresh(application)
    return ApplicationOut.model_validate(application)


@router.get("/my", response_model=list[ApplicationOut])
async def my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    result = await db.execute(
        select(Application).where(Application.candidate_id == current_user.id)
    )
    return result.scalars().all()


VALID_STATUSES = {"submitted", "under_review", "shortlisted", "rejected"}


@router.patch("/{application_id}/status", response_model=ApplicationOut)
async def update_application_status(
    application_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")

    result = await db.execute(
        select(Application)
        .options(selectinload(Application.job))
        .where(Application.id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if str(app.job.recruiter_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your job posting")

    app.status = status
    await db.commit()
    await db.refresh(app)
    return app


@router.get("/{application_id}")
async def get_application(
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate), selectinload(Application.assessment))
        .where(Application.id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    is_owner = str(app.candidate_id) == str(current_user.id)
    is_recruiter = current_user.role == "recruiter"
    if not is_owner and not is_recruiter:
        raise HTTPException(status_code=403, detail="Access denied")

    return app
