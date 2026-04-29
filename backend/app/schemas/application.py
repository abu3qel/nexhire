from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class ApplicationOut(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    status: str
    resume_path: str
    cover_letter_path: Optional[str] = None
    github_url: Optional[str] = None
    stackoverflow_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    submitted_at: datetime

    model_config = {"from_attributes": True}
