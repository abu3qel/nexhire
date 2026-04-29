import asyncio
import os
from celery import Celery
from app.config import settings

# HuggingFace tokenizers use Rust parallelism which deadlocks in forked worker processes.
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

celery_app = Celery(
    "nexhire",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    broker_connection_retry_on_startup=True,
)


@celery_app.task(name="run_assessment", bind=True, max_retries=2)
def run_assessment(self, application_id: str) -> dict:
    from app.services.assessment_pipeline import run_pipeline
    try:
        asyncio.run(run_pipeline(application_id))
        return {"status": "completed", "application_id": application_id}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)
