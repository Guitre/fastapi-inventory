from sqlalchemy import CheckConstraint, Column, DateTime, Integer, String, func

from app.database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, unique=True, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_updated = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_inventory_items_quantity_non_negative"),
    )

    def __repr__(self) -> str:
        return f"<InventoryItem(id={self.id}, name='{self.name}', qty={self.quantity})>"
