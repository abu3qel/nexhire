from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

DEFAULT_WEIGHTS = {
    "resume": 0.35,
    "cover_letter": 0.15,
    "github": 0.25,
    "stackoverflow": 0.15,
    "portfolio": 0.10,
}


class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: list[str] = []
    location: str
    job_type: str
    status: str = "open"
    modality_weights: dict = DEFAULT_WEIGHTS


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[list[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    status: Optional[str] = None
    modality_weights: Optional[dict] = None


class JobOut(BaseModel):
    id: uuid.UUID
    recruiter_id: uuid.UUID
    title: str
    description: str
    required_skills: list
    location: str
    job_type: str
    status: str
    modality_weights: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WeightsUpdate(BaseModel):
    modality_weights: dict
