from datetime import datetime, timezone

from sqlalchemy import case
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.inventory import InventoryItem
from app.utils.normalization import clean_display_name, normalize_name


class ItemNotFoundError(Exception):
    def __init__(self, item_id: int) -> None:
        self.item_id = item_id
        super().__init__(f"Item {item_id} not found")


class InsufficientStockError(Exception):
    def __init__(self, item_id: int, requested: int, available: int) -> None:
        self.item_id = item_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Estoque insuficiente. Solicitado: {requested}, "
            f"disponivel: {available}. Quantidade ajustada para 0."
        )


def upsert_item(db: Session, raw_name: str, quantity: int) -> InventoryItem:
    norm = normalize_name(raw_name)
    display = clean_display_name(raw_name)

    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.normalized_name == norm)
        .with_for_update()
        .first()
    )

    if item:
        item.quantity += quantity  # type: ignore[operator]
        item.last_updated = datetime.now(timezone.utc)  # type: ignore[assignment]
    else:
        item = InventoryItem(
            name=display,
            normalized_name=norm,
            quantity=quantity,
        )
        db.add(item)

    try:
        db.commit()
    except IntegrityError:
        # Concurrent insert race: another transaction created the same item.
        # Rollback, re-fetch the now-existing row with a lock, and update it.
        db.rollback()
        item = (
            db.query(InventoryItem)
            .filter(InventoryItem.normalized_name == norm)
            .with_for_update()
            .first()
        )
        if item is None:
            raise  # pragma: no cover — should not happen
        item.quantity += quantity  # type: ignore[operator]
        item.last_updated = datetime.now(timezone.utc)  # type: ignore[assignment]
        db.commit()

    db.refresh(item)
    return item


def remove_quantity(db: Session, item_id: int, quantity: int) -> InventoryItem:
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == item_id)
        .with_for_update()
        .first()
    )

    if not item:
        raise ItemNotFoundError(item_id)

    clamped = False
    available = item.quantity

    if item.quantity < quantity:  # type: ignore[operator]
        clamped = True
        item.quantity = 0
    else:
        item.quantity -= quantity  # type: ignore[operator]
    item.last_updated = datetime.now(timezone.utc)  # type: ignore[assignment]
    db.commit()
    db.refresh(item)

    if clamped:
        raise InsufficientStockError(item.id, quantity, available)  # type: ignore[arg-type]

    return item


def delete_item(db: Session, item_id: int) -> None:
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == item_id)
        .with_for_update()
        .first()
    )

    if not item:
        raise ItemNotFoundError(item_id)

    db.delete(item)
    db.commit()


def get_item(db: Session, item_id: int) -> InventoryItem | None:
    return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()


def list_items(
    db: Session,
    order_by: str | None = None,
    direction: str | None = None,
) -> list[InventoryItem]:
    query = db.query(InventoryItem)

    if order_by:
        column = getattr(InventoryItem, order_by)
        if direction == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
    else:
        # Default: low-stock items first, then most recently updated, then name
        low_stock = case(
            (InventoryItem.quantity < 5, 0),  # type: ignore[operator]
            else_=1,
        )
        query = query.order_by(
            low_stock.asc(),
            InventoryItem.last_updated.desc(),
            InventoryItem.name.asc(),
        )

    return list(query.all())
