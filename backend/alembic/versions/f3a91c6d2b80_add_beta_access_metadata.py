"""Add beta access metadata to user profiles.

Revision ID: f3a91c6d2b80
Revises: a1c8d5e9407b
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f3a91c6d2b80"
down_revision: Union[str, Sequence[str], None] = "a1c8d5e9407b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if not inspector.has_table("user_profiles"):
        return

    columns = {column["name"] for column in inspector.get_columns("user_profiles")}
    if "user_type" not in columns:
        op.add_column(
            "user_profiles",
            sa.Column("user_type", sa.String(length=20), server_default="beta", nullable=False),
        )
    if "beta_until" not in columns:
        op.add_column(
            "user_profiles",
            sa.Column("beta_until", sa.Date(), server_default="2026-12-31", nullable=False),
        )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if not inspector.has_table("user_profiles"):
        return

    columns = {column["name"] for column in inspector.get_columns("user_profiles")}
    if "beta_until" in columns:
        op.drop_column("user_profiles", "beta_until")
    if "user_type" in columns:
        op.drop_column("user_profiles", "user_type")
