"""add confidence_scores and explanation to assessments

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("assessments", sa.Column("confidence_scores", sa.JSON(), nullable=True))
    op.add_column("assessments", sa.Column("explanation", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("assessments", "explanation")
    op.drop_column("assessments", "confidence_scores")
