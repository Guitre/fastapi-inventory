from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.inventory import (
    AddItemRequest,
    InventoryCreatedResponse,
    InventoryDeletedResponse,
    InventoryItemResponse,
    InventoryRemovedResponse,
    RemoveQuantityRequest,
)
from app.services.inventory import (
    InsufficientStockError,
    ItemNotFoundError,
    delete_item,
    get_item,
    list_items,
    remove_quantity,
    upsert_item,
)
from app.tasks.inventory import process_inventory_change

router = APIRouter()

VALID_ORDER_BY = {"name", "quantity", "last_updated"}
VALID_DIRECTION = {"asc", "desc"}


@router.post("/", status_code=202, response_model=InventoryCreatedResponse)
def add_item(body: AddItemRequest, db: Session = Depends(get_db)):
    item = upsert_item(db, body.name, body.quantity)
    process_inventory_change.delay(item.id, "add", body.quantity)
    return InventoryCreatedResponse(id=item.id, identifier=item.normalized_name)


@router.get("/", response_model=list[InventoryItemResponse])
def list_all_items(
    order_by: str | None = Query(None),
    direction: str | None = Query(None),
    db: Session = Depends(get_db),
):
    if order_by and order_by not in VALID_ORDER_BY:
        raise HTTPException(
            status_code=422,
            detail=f"order_by must be one of: {', '.join(sorted(VALID_ORDER_BY))}",
        )
    if direction and direction not in VALID_DIRECTION:
        raise HTTPException(
            status_code=422,
            detail=f"direction must be one of: {', '.join(sorted(VALID_DIRECTION))}",
        )
    return list_items(db, order_by=order_by, direction=direction)


@router.get("/{item_id}", response_model=InventoryItemResponse)
def get_single_item(item_id: int, db: Session = Depends(get_db)):
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}", status_code=202, response_model=InventoryRemovedResponse)
def delete_item_quantity(
    item_id: int,
    body: RemoveQuantityRequest,
    db: Session = Depends(get_db),
):
    try:
        item = remove_quantity(db, item_id, body.quantity)
    except ItemNotFoundError:
        raise HTTPException(status_code=404, detail="Item not found")
    except InsufficientStockError as exc:
        process_inventory_change.delay(item_id, "remove", body.quantity)
        raise HTTPException(status_code=409, detail=str(exc))
    process_inventory_change.delay(item.id, "remove", body.quantity)
    return InventoryRemovedResponse(id=item.id, quantity=item.quantity)


@router.delete("/{item_id}/permanent", status_code=200, response_model=InventoryDeletedResponse)
def delete_item_permanently(item_id: int, db: Session = Depends(get_db)):
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    response = InventoryDeletedResponse(id=item.id, name=item.name)
    delete_item(db, item_id)
    return response
