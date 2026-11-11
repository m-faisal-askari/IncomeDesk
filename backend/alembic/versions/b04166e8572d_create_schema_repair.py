"""Repair schemas skipped by the original empty baseline migrations.

Revision ID: b04166e8572d
Revises: d7e4c2f891ab
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b04166e8572d"
down_revision: Union[str, Sequence[str], None] = "d7e4c2f891ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from backend.app.core.database import Base
    from backend.app.models import models as _models

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if all(inspector.has_table(table_name) for table_name in Base.metadata.tables):
        return

    # This forward repair is safe for partially initialized schemas: it adds
    # missing model tables without dropping or changing existing tables.
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    # This revision may repair tables that existed before it ran. Dropping
    # them during downgrade could destroy application data, so keep them.
    pass
