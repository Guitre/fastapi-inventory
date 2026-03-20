from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.normalization import normalize_name


class AddItemRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    quantity: int = Field(..., gt=0)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank_after_normalization(cls, v: str) -> str:
        if not normalize_name(v):
            raise ValueError("Name must contain at least one alphanumeric character")
        return v


class RemoveQuantityRequest(BaseModel):
    quantity: int = Field(..., gt=0)


class InventoryCreatedResponse(BaseModel):
    id: int
    identifier: str


class InventoryItemResponse(BaseModel):
    id: int
    name: str
    normalized_name: str
    quantity: int
    created_at: datetime
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryRemovedResponse(BaseModel):
    id: int
    quantity: int


class InventoryDeletedResponse(BaseModel):
    id: int
    name: str
