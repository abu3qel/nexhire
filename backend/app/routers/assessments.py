from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.assessment import Assessment
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.assessment import AssessmentOut, RankedCandidate
from app.routers.auth import get_current_user, require_recruiter

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.get("/{application_id}", response_model=AssessmentOut)
async def get_assessment(
    application_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Assessment).where(Assessment.application_id == application_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.get("/job/{job_id}/ranked", response_model=list[RankedCandidate])
async def get_ranked_candidates(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.recruiter_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your job")

    apps_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate), selectinload(Application.assessment))
        .where(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()

    candidates = []
    for app in applications:
        a = app.assessment
        candidates.append({
            "application_id": app.id,
            "candidate_id": app.candidate_id,
            "candidate_name": app.candidate.full_name,
            "candidate_email": app.candidate.email,
            "resume_score": a.resume_score if a else None,
            "cover_letter_score": a.cover_letter_score if a else None,
            "github_score": a.github_score if a else None,
            "stackoverflow_score": a.stackoverflow_score if a else None,
            "portfolio_score": a.portfolio_score if a else None,
            "composite_score": a.composite_score if a else None,
            "baseline_score": a.baseline_score if a else None,
            "assessment_status": a.status if a else "pending",
            "application_status": app.status,
        })

    # Min-max normalise composite scores across the pool
    completed = [c for c in candidates if c["composite_score"] is not None]
    if len(completed) > 1:
        scores = [c["composite_score"] for c in completed]
        mn, mx = min(scores), max(scores)
        if mx > mn:
            for c in completed:
                c["composite_score"] = (c["composite_score"] - mn) / (mx - mn)

    # Sort: completed by composite desc, then non-completed at bottom
    completed_sorted = sorted(completed, key=lambda c: c["composite_score"] or 0, reverse=True)
    pending = [c for c in candidates if c["composite_score"] is None]

    # Compute composite ranks
    for i, c in enumerate(completed_sorted):
        c["rank"] = i + 1

    # Compute baseline ranks
    baseline_sorted = sorted(
        [c for c in completed_sorted if c["baseline_score"] is not None],
        key=lambda c: c["baseline_score"] or 0,
        reverse=True,
    )
    baseline_rank_map = {str(c["application_id"]): i + 1 for i, c in enumerate(baseline_sorted)}

    for c in completed_sorted:
        br = baseline_rank_map.get(str(c["application_id"]))
        c["baseline_rank"] = br
        if br is not None and c.get("rank") is not None:
            c["rank_change"] = br - c["rank"]

    ranked = completed_sorted + pending
    return [RankedCandidate(**c) for c in ranked]
