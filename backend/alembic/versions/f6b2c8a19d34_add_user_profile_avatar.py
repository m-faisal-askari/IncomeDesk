"""Add profile image data to user profiles.

Revision ID: f6b2c8a19d34
Revises: b04166e8572d
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f6b2c8a19d34"
down_revision: Union[str, Sequence[str], None] = "b04166e8572d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    table_exists = inspector.has_table("user_profiles")
    if table_exists:
        columns = {column["name"] for column in inspector.get_columns("user_profiles")}
    else:
        columns = set()
    if table_exists and "avatar_url" not in columns:
        op.add_column("user_profiles", sa.Column("avatar_url", sa.Text(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    table_exists = inspector.has_table("user_profiles")
    if table_exists:
        columns = {column["name"] for column in inspector.get_columns("user_profiles")}
    else:
        columns = set()
    if table_exists and "avatar_url" in columns:
        op.drop_column("user_profiles", "avatar_url")
