from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
import uuid


class AssessmentOut(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    status: str
    resume_score: Optional[float] = None
    cover_letter_score: Optional[float] = None
    github_score: Optional[float] = None
    stackoverflow_score: Optional[float] = None
    portfolio_score: Optional[float] = None
    composite_score: Optional[float] = None
    baseline_score: Optional[float] = None
    resume_details: Optional[Any] = None
    cover_letter_details: Optional[Any] = None
    github_details: Optional[Any] = None
    stackoverflow_details: Optional[Any] = None
    portfolio_details: Optional[Any] = None
    weights_used: Optional[Any] = None
    confidence_scores: Optional[Any] = None
    explanation: Optional[Any] = None
    error_log: Optional[Any] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class RankedCandidate(BaseModel):
    application_id: uuid.UUID
    candidate_id: uuid.UUID
    candidate_name: str
    candidate_email: str
    resume_score: Optional[float] = None
    cover_letter_score: Optional[float] = None
    github_score: Optional[float] = None
    stackoverflow_score: Optional[float] = None
    portfolio_score: Optional[float] = None
    composite_score: Optional[float] = None
    baseline_score: Optional[float] = None
    assessment_status: str
    application_status: str
    has_resume: bool = False
    has_cover_letter: bool = False
    has_github: bool = False
    has_stackoverflow: bool = False
    has_portfolio: bool = False
    rank: Optional[int] = None
    baseline_rank: Optional[int] = None
    rank_change: Optional[int] = None


class RAGChatRequest(BaseModel):
    application_id: uuid.UUID
    message: str
    conversation_history: list[dict] = []


class RAGChatResponse(BaseModel):
    answer: str
    sources: list[str]
    retrieval_confidence: float = 0.0
