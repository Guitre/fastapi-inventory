"""Create inventory_items table

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "inventory_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("normalized_name", sa.String(length=255), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "last_updated",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("normalized_name"),
        sa.CheckConstraint("quantity >= 0", name="ck_inventory_items_quantity_non_negative"),
    )
    op.create_index(
        op.f("ix_inventory_items_normalized_name"),
        "inventory_items",
        ["normalized_name"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_inventory_items_normalized_name"), table_name="inventory_items")
    op.drop_table("inventory_items")
