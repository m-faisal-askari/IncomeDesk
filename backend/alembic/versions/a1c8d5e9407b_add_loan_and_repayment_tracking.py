"""Add loan liabilities and repayment history.

Revision ID: a1c8d5e9407b
Revises: f6b2c8a19d34
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1c8d5e9407b"
down_revision: Union[str, Sequence[str], None] = "f6b2c8a19d34"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("loans"):
        op.create_table(
            "loans",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=128), nullable=False),
            sa.Column("lender_name", sa.String(length=200), nullable=False),
            sa.Column("loan_type", sa.String(length=40), nullable=False),
            sa.Column("principal_amount", sa.BigInteger(), nullable=False),
            sa.Column("currency", sa.String(length=3), nullable=False),
            sa.Column("date_borrowed", sa.Date(), nullable=False),
            sa.Column("due_date", sa.Date(), nullable=True),
            sa.Column("annual_interest_rate", sa.Numeric(precision=7, scale=4), nullable=True),
            sa.Column("purpose", sa.Text(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("received_into_account_id", sa.String(length=36), nullable=True),
            sa.Column("receipt_transaction_id", sa.String(length=36), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.CheckConstraint("principal_amount > 0", name="ck_loan_principal_positive"),
            sa.CheckConstraint("due_date IS NULL OR due_date >= date_borrowed", name="ck_loan_due_after_borrowed"),
            sa.CheckConstraint("annual_interest_rate IS NULL OR annual_interest_rate >= 0", name="ck_loan_interest_rate_nonnegative"),
            sa.CheckConstraint(
                "loan_type IN ('PERSONAL', 'BUSINESS', 'AUTO', 'MORTGAGE', 'STUDENT', 'CREDIT_CARD', 'FAMILY_FRIEND', 'OTHER')",
                name="ck_loan_type_valid",
            ),
            sa.ForeignKeyConstraint(["received_into_account_id"], ["accounts.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["receipt_transaction_id"], ["transactions.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    loan_indexes = {index["name"] for index in inspector.get_indexes("loans")}
    if "ix_loans_user_id" not in loan_indexes:
        op.create_index("ix_loans_user_id", "loans", ["user_id"], unique=False)
    if "idx_loan_user_borrowed" not in loan_indexes:
        op.create_index("idx_loan_user_borrowed", "loans", ["user_id", "date_borrowed"], unique=False)

    if not inspector.has_table("loan_payments"):
        op.create_table(
            "loan_payments",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=128), nullable=False),
            sa.Column("loan_id", sa.String(length=36), nullable=False),
            sa.Column("principal_amount", sa.BigInteger(), nullable=False),
            sa.Column("interest_amount", sa.BigInteger(), nullable=False),
            sa.Column("payment_date", sa.Date(), nullable=False),
            sa.Column("account_id", sa.String(length=36), nullable=True),
            sa.Column("transaction_id", sa.String(length=36), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.CheckConstraint("principal_amount >= 0", name="ck_loan_payment_principal_nonnegative"),
            sa.CheckConstraint("interest_amount >= 0", name="ck_loan_payment_interest_nonnegative"),
            sa.CheckConstraint("principal_amount + interest_amount > 0", name="ck_loan_payment_positive"),
            sa.ForeignKeyConstraint(["account_id"], ["accounts.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["loan_id"], ["loans.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    payment_indexes = {index["name"] for index in inspector.get_indexes("loan_payments")}
    if "ix_loan_payments_user_id" not in payment_indexes:
        op.create_index("ix_loan_payments_user_id", "loan_payments", ["user_id"], unique=False)
    if "ix_loan_payments_loan_id" not in payment_indexes:
        op.create_index("ix_loan_payments_loan_id", "loan_payments", ["loan_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("loan_payments"):
        op.drop_table("loan_payments")
    inspector = sa.inspect(bind)
    if inspector.has_table("loans"):
        op.drop_table("loans")
