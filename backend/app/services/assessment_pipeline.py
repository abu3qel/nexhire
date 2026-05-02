from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.application import Application
from app.models.assessment import Assessment
from app.services.modalities.resume_module import analyse_resume
from app.services.modalities.cover_letter_module import analyse_cover_letter
from app.services.modalities.github_module import analyse_github
from app.services.modalities.stackoverflow_module import analyse_stackoverflow
from app.services.modalities.portfolio_module import analyse_portfolio
from app.services.fusion import (
    compute_composite_score,
    compute_baseline_score,
    compute_confidence_scores,
    build_explanation,
)
from app.services.rag_service import ingest_candidate_chunks


async def run_pipeline(application_id: str) -> None:
    try:
        await _run_pipeline(application_id)
    except Exception as exc:
        # Top-level safety net — open a fresh session to mark the assessment
        # as failed so it never stays permanently stuck in pending/processing.
        try:
            async with AsyncSessionLocal() as db:
                res = await db.execute(
                    select(Assessment)
                    .join(Application, Assessment.application_id == Application.id)
                    .where(Application.id == application_id)
                )
                assessment = res.scalar_one_or_none()
                if assessment and assessment.status not in ("completed", "failed"):
                    assessment.status = "failed"
                    assessment.error_log = {"pipeline": f"Unhandled exception: {str(exc)}"}
                    await db.commit()
        except Exception:
            pass


async def _run_pipeline(application_id: str) -> None:
    async with AsyncSessionLocal() as db:
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

        # Each modality is individually guarded — a failure sets score to None
        # and logs the error, then the pipeline continues with remaining modalities.
        try:
            resume_result = await analyse_resume(application.raw_resume_text, job.description)
        except Exception as e:
            error_log["resume"] = str(e)

        try:
            cover_letter_result = await analyse_cover_letter(application.raw_cover_letter_text, job.description)
        except Exception as e:
            error_log["cover_letter"] = str(e)

        try:
            github_result = await analyse_github(application.github_url, job.description)
        except Exception as e:
            error_log["github"] = str(e)

        try:
            stackoverflow_result = await analyse_stackoverflow(application.stackoverflow_url, job.description)
        except Exception as e:
            error_log["stackoverflow"] = str(e)

        try:
            portfolio_result = await analyse_portfolio(application.portfolio_url, job.description)
        except Exception as e:
            error_log["portfolio"] = str(e)

        scores = {
            "resume": resume_result["score"] if resume_result else None,
            "cover_letter": cover_letter_result["score"] if cover_letter_result else None,
            "github": github_result["score"] if github_result else None,
            "stackoverflow": stackoverflow_result["score"] if stackoverflow_result else None,
            "portfolio": portfolio_result["score"] if portfolio_result else None,
        }

        modality_details = {
            "resume": resume_result["details"] if resume_result else None,
            "cover_letter": cover_letter_result["details"] if cover_letter_result else None,
            "github": github_result["details"] if github_result else None,
            "stackoverflow": stackoverflow_result["details"] if stackoverflow_result else None,
            "portfolio": portfolio_result["details"] if portfolio_result else None,
        }

        try:
            weights = job.modality_weights
            confidence = compute_confidence_scores(scores, modality_details)
            composite, effective_weights = compute_composite_score(scores, weights, confidence)
            baseline = compute_baseline_score(scores.get("resume"))
            explanation = build_explanation(scores, effective_weights, confidence, composite, baseline)

            assessment.resume_score = scores["resume"]
            assessment.cover_letter_score = scores["cover_letter"]
            assessment.github_score = scores["github"]
            assessment.stackoverflow_score = scores["stackoverflow"]
            assessment.portfolio_score = scores["portfolio"]
            assessment.composite_score = composite
            assessment.baseline_score = baseline
            assessment.resume_details = modality_details["resume"]
            assessment.cover_letter_details = modality_details["cover_letter"]
            assessment.github_details = modality_details["github"]
            assessment.stackoverflow_details = modality_details["stackoverflow"]
            assessment.portfolio_details = modality_details["portfolio"]
            assessment.weights_used = weights
            assessment.confidence_scores = confidence
            assessment.explanation = explanation
            assessment.error_log = error_log if error_log else None
            assessment.status = "completed"
            assessment.completed_at=datetime.now(timezone.utc).replace(tzinfo=None)

            await db.commit()

        except Exception as e:
            error_log["pipeline"] = str(e)
            try:
                await db.rollback()
                assessment.status = "failed"
                assessment.error_log = error_log
                await db.commit()
            except Exception:
                pass
            return

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
                    "resume_details": modality_details["resume"],
                    "github_details": modality_details["github"],
                    "stackoverflow_details": modality_details["stackoverflow"],
                },
                candidate_name=application.candidate.full_name,
            )
        except Exception as e:
            error_log["rag_ingestion"] = str(e)
            assessment.error_log = error_log
            await db.commit()

        if scores["resume"] is None:
            assessment.status = "failed"
            await db.commit()
