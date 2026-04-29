import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SAEnum, JSON, Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.database import Base


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = (UniqueConstraint("application_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("pending", "processing", "completed", "failed", name="assessment_status"),
        default="pending",
        nullable=False,
    )

    resume_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cover_letter_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    github_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    stackoverflow_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    portfolio_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    composite_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    baseline_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    resume_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    cover_letter_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    github_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    stackoverflow_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    portfolio_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    weights_used: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_log: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    application: Mapped["Application"] = relationship("Application", back_populates="assessment")


class CandidateChunk(Base):
    __tablename__ = "candidate_chunks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_source: Mapped[str] = mapped_column(String(100), nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application: Mapped["Application"] = relationship("Application", back_populates="chunks")
