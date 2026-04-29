import os
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.application import Application
from app.models.assessment import Assessment
from app.models.job import Job
from app.models.user import User
from app.config import settings
from app.services.modalities.resume_module import analyse_resume
from app.services.modalities.cover_letter_module import analyse_cover_letter
from app.services.modalities.github_module import analyse_github
from app.services.modalities.stackoverflow_module import analyse_stackoverflow
from app.services.modalities.portfolio_module import analyse_portfolio
from app.services.fusion import compute_composite_score, compute_baseline_score
from app.services.rag_service import ingest_candidate_chunks


async def run_pipeline(application_id: str) -> None:
    async with AsyncSessionLocal() as db:
        # Load application with relationships
        result = await db.execute(
            select(Application)
            .options(
                selectinload(Application.job),
                selectinload(Application.candidate),
                selectinload(Application.assessment),
            )
            .where(Application.id == application_id)
        )
        application = result.scalar_one_or_none()
        if not application:
            return

        assessment = application.assessment
        if not assessment:
            assessment = Assessment(application_id=application_id, status="pending")
            db.add(assessment)
            await db.flush()

        assessment.status = "processing"
        await db.commit()

        job = application.job
        error_log: dict = {}

        resume_result = None
        cover_letter_result = None
        github_result = None
        stackoverflow_result = None
        portfolio_result = None

        # Resume (required)
        try:
            resume_result = await analyse_resume(application.raw_resume_text, job.description)
        except Exception as e:
            error_log["resume"] = str(e)

        # Cover letter (optional)
        try:
            cover_letter_result = await analyse_cover_letter(application.raw_cover_letter_text, job.description)
        except Exception as e:
            error_log["cover_letter"] = str(e)

        # GitHub (optional)
        try:
            github_result = await analyse_github(application.github_url, job.description)
        except Exception as e:
            error_log["github"] = str(e)

        # Stack Overflow (optional)
        try:
            stackoverflow_result = await analyse_stackoverflow(application.stackoverflow_url, job.description)
        except Exception as e:
            error_log["stackoverflow"] = str(e)

        # Portfolio (optional)
        try:
            portfolio_result = await analyse_portfolio(application.portfolio_url, job.description)
        except Exception as e:
            error_log["portfolio"] = str(e)

        # Extract scores
        scores = {
            "resume": resume_result["score"] if resume_result else None,
            "cover_letter": cover_letter_result["score"] if cover_letter_result else None,
            "github": github_result["score"] if github_result else None,
            "stackoverflow": stackoverflow_result["score"] if stackoverflow_result else None,
            "portfolio": portfolio_result["score"] if portfolio_result else None,
        }

        weights = job.modality_weights
        composite = compute_composite_score(scores, weights)
        baseline = compute_baseline_score(scores.get("resume"))

        # Update assessment
        assessment.resume_score = scores["resume"]
        assessment.cover_letter_score = scores["cover_letter"]
        assessment.github_score = scores["github"]
        assessment.stackoverflow_score = scores["stackoverflow"]
        assessment.portfolio_score = scores["portfolio"]
        assessment.composite_score = composite
        assessment.baseline_score = baseline
        assessment.resume_details = resume_result["details"] if resume_result else None
        assessment.cover_letter_details = cover_letter_result["details"] if cover_letter_result else None
        assessment.github_details = github_result["details"] if github_result else None
        assessment.stackoverflow_details = stackoverflow_result["details"] if stackoverflow_result else None
        assessment.portfolio_details = portfolio_result["details"] if portfolio_result else None
        assessment.weights_used = weights
        assessment.error_log = error_log if error_log else None
        assessment.status = "completed"
        assessment.completed_at = datetime.utcnow()

        await db.commit()

        # Ingest RAG chunks
        try:
            await ingest_candidate_chunks(
                db=db,
                application_id=application_id,
                resume_text=application.raw_resume_text,
                cover_letter_text=application.raw_cover_letter_text,
                github_data=github_result,
                portfolio_data=portfolio_result,
                assessment_data={
                    "resume_score": scores["resume"],
                    "cover_letter_score": scores["cover_letter"],
                    "github_score": scores["github"],
                    "stackoverflow_score": scores["stackoverflow"],
                    "portfolio_score": scores["portfolio"],
                    "composite_score": composite,
                    "resume_details": resume_result["details"] if resume_result else None,
                    "github_details": github_result["details"] if github_result else None,
                    "stackoverflow_details": stackoverflow_result["details"] if stackoverflow_result else None,
                },
                candidate_name=application.candidate.full_name,
            )
        except Exception as e:
            error_log["rag_ingestion"] = str(e)
            assessment.error_log = error_log
            await db.commit()

        # Update status to failed if resume was unavailable
        if scores["resume"] is None:
            assessment.status = "failed"
            await db.commit()
