"""Convert all monetary columns from Numeric to BigInteger cents

Revision ID: c9a7310f4e01
Revises: 164f1ed9546b
Create Date: 2026-11-05 20:37:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9a7310f4e01'
down_revision: Union[str, Sequence[str], None] = 'e20f5b0a1a62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Tables and their monetary columns that must be converted from
# Numeric(15,4) → BigInteger (storing cents = value * 100).
MONETARY_COLUMNS = {
    "accounts": ["opening_balance", "current_balance"],
    "transactions": ["amount", "fee_amount"],
    "invoices": ["subtotal", "discount_amount", "tax_amount", "total_amount", "amount_paid", "balance_due"],
    "invoice_items": ["unit_price", "total_amount"],
    "invoice_payments": ["amount", "fee_amount"],
    "budgets": ["total_allocated"],
    "budget_categories": ["allocated_amount"],
    "subscriptions": ["amount"],
    "savings_goals": ["target_amount", "current_amount"],
    "savings_contributions": ["amount"],
    "projects": ["agreed_amount", "budget"],
    "tax_payments": ["amount"],
}

# Columns to drop (no longer needed in the cents model)
DROP_COLUMNS = {
    "transactions": ["base_amount", "exchange_rate"],
    "invoices": ["exchange_rate"],
}


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Convert each monetary column: multiply existing values by 100,
    #    then cast to BIGINT.
    for table, columns in MONETARY_COLUMNS.items():
        for col in columns:
            inspector = sa.inspect(bind)
            if not inspector.has_table(table):
                continue
            column_info = {
                column["name"]: column
                for column in inspector.get_columns(table)
            }.get(col)
            # A database created from the current model already stores cents
            # as BIGINT. Only convert legacy NUMERIC columns, or cents would
            # be multiplied by 100 a second time.
            if column_info is None or not isinstance(column_info["type"], sa.Numeric):
                continue

            # First update the data in-place (Numeric * 100, rounded to int)
            op.execute(
                sa.text(f'UPDATE "{table}" SET "{col}" = ROUND("{col}" * 100)')
            )
            # Then alter the column type
            alter_column = dict(
                existing_type=column_info["type"],
                type_=sa.BigInteger(),
                existing_nullable=column_info["nullable"],
            )
            if bind.dialect.name == "sqlite":
                with op.batch_alter_table(table) as batch_op:
                    batch_op.alter_column(col, **alter_column)
            else:
                if bind.dialect.name == "postgresql":
                    alter_column["postgresql_using"] = f'"{col}"::bigint'
                op.alter_column(table, col, **alter_column)

    # 2. Drop obsolete columns
    for table, columns in DROP_COLUMNS.items():
        inspector = sa.inspect(bind)
        if not inspector.has_table(table):
            continue
        existing_columns = {
            column["name"]
            for column in inspector.get_columns(table)
        }
        for col in columns:
            if col in existing_columns:
                op.drop_column(table, col)
                existing_columns.remove(col)

    # 3. Add currency column to budgets if missing
    inspector = sa.inspect(bind)
    if inspector.has_table("budgets") and "currency" not in {
        column["name"] for column in inspector.get_columns("budgets")
    }:
        op.add_column("budgets", sa.Column("currency", sa.String(3), server_default="USD", nullable=False))


def downgrade() -> None:
    # Reverse: convert BigInteger cents back to Numeric by dividing by 100
    for table, columns in MONETARY_COLUMNS.items():
        for col in columns:
            op.alter_column(
                table, col,
                type_=sa.Numeric(15, 4),
                existing_nullable=False,
                postgresql_using=f'("{col}"::numeric / 100)',
            )

    # Re-add dropped columns
    for table, columns in DROP_COLUMNS.items():
        for col in columns:
            if col == "base_amount":
                op.add_column(table, sa.Column(col, sa.Numeric(15, 4), nullable=True))
            elif col == "exchange_rate":
                op.add_column(table, sa.Column(col, sa.Numeric(15, 6), nullable=True))

    try:
        op.drop_column("budgets", "currency")
    except Exception:
        pass
