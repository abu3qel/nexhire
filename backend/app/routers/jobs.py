from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobUpdate, JobOut, WeightsUpdate
from app.routers.auth import get_current_user, require_recruiter

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/", response_model=JobOut, status_code=201)
async def create_job(
    body: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    job = Job(**body.model_dump(), recruiter_id=current_user.id)
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


@router.get("/", response_model=list[JobOut])
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Job).where(Job.status == "open").offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/{job_id}", response_model=JobOut)
async def update_job(
    job_id: str,
    body: JobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.recruiter_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your job posting")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(job, field, value)
    job.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.recruiter_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your job posting")

    job.status = "closed"
    await db.commit()


@router.get("/{job_id}/applications")
async def list_job_applications(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    from app.models.application import Application
    from app.models.assessment import Assessment
    from sqlalchemy.orm import selectinload

    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.recruiter_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your job posting")

    apps_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate), selectinload(Application.assessment))
        .where(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()
    return [
        {
            "application_id": str(app.id),
            "candidate_id": str(app.candidate_id),
            "candidate_name": app.candidate.full_name,
            "candidate_email": app.candidate.email,
            "status": app.status,
            "submitted_at": app.submitted_at,
            "assessment": app.assessment,
        }
        for app in applications
    ]


@router.put("/{job_id}/weights", response_model=JobOut)
async def update_weights(
    job_id: str,
    body: WeightsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.recruiter_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your job posting")

    total = sum(body.modality_weights.values())
    if abs(total - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")

    job.modality_weights = body.modality_weights
    job.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(job)
    return job
