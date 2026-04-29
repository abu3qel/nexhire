import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

DEFAULT_WEIGHTS = {
    "resume": 0.35,
    "cover_letter": 0.15,
    "github": 0.25,
    "stackoverflow": 0.15,
    "portfolio": 0.10,
}


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recruiter_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    required_skills: Mapped[list] = mapped_column(JSON, default=list)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    job_type: Mapped[str] = mapped_column(
        SAEnum("full_time", "part_time", "contract", "internship", name="job_type"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        SAEnum("open", "closed", "draft", name="job_status"),
        default="open",
        nullable=False,
    )
    modality_weights: Mapped[dict] = mapped_column(JSON, default=lambda: dict(DEFAULT_WEIGHTS))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recruiter: Mapped["User"] = relationship("User", back_populates="jobs")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="job")
