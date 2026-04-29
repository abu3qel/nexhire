"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("recruiter", "candidate", name="user_role"), nullable=False),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # jobs
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("recruiter_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("required_skills", postgresql.JSON, nullable=False, server_default="[]"),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("job_type", sa.Enum("full_time", "part_time", "contract", "internship", name="job_type"), nullable=False),
        sa.Column("status", sa.Enum("open", "closed", "draft", name="job_status"), nullable=False, server_default="open"),
        sa.Column("modality_weights", postgresql.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # applications
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("jobs.id"), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("submitted", "under_review", "shortlisted", "rejected", name="application_status"),
            nullable=False,
            server_default="submitted",
        ),
        sa.Column("resume_path", sa.String(500), nullable=False),
        sa.Column("cover_letter_path", sa.String(500), nullable=True),
        sa.Column("github_url", sa.String(500), nullable=True),
        sa.Column("stackoverflow_url", sa.String(500), nullable=True),
        sa.Column("portfolio_url", sa.String(500), nullable=True),
        sa.Column("raw_resume_text", sa.Text, nullable=False),
        sa.Column("raw_cover_letter_text", sa.Text, nullable=True),
        sa.Column("submitted_at", sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # assessments
    op.create_table(
        "assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("applications.id"), nullable=False, unique=True),
        sa.Column(
            "status",
            sa.Enum("pending", "processing", "completed", "failed", name="assessment_status"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("resume_score", sa.Float, nullable=True),
        sa.Column("cover_letter_score", sa.Float, nullable=True),
        sa.Column("github_score", sa.Float, nullable=True),
        sa.Column("stackoverflow_score", sa.Float, nullable=True),
        sa.Column("portfolio_score", sa.Float, nullable=True),
        sa.Column("composite_score", sa.Float, nullable=True),
        sa.Column("baseline_score", sa.Float, nullable=True),
        sa.Column("resume_details", postgresql.JSON, nullable=True),
        sa.Column("cover_letter_details", postgresql.JSON, nullable=True),
        sa.Column("github_details", postgresql.JSON, nullable=True),
        sa.Column("stackoverflow_details", postgresql.JSON, nullable=True),
        sa.Column("portfolio_details", postgresql.JSON, nullable=True),
        sa.Column("weights_used", postgresql.JSON, nullable=True),
        sa.Column("error_log", postgresql.JSON, nullable=True),
        sa.Column("completed_at", sa.DateTime, nullable=True),
    )

    # candidate_chunks (pgvector)
    op.create_table(
        "candidate_chunks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("applications.id"), nullable=False),
        sa.Column("chunk_text", sa.Text, nullable=False),
        sa.Column("chunk_source", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )
    # Add vector column manually since Alembic doesn't natively know Vector type
    op.execute("ALTER TABLE candidate_chunks ADD COLUMN embedding vector(1536)")
    op.execute("CREATE INDEX ON candidate_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)")


def downgrade() -> None:
    op.drop_table("candidate_chunks")
    op.drop_table("assessments")
    op.drop_table("applications")
    op.drop_table("jobs")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS assessment_status")
    op.execute("DROP TYPE IF EXISTS application_status")
    op.execute("DROP TYPE IF EXISTS job_status")
    op.execute("DROP TYPE IF EXISTS job_type")
    op.execute("DROP TYPE IF EXISTS user_role")
