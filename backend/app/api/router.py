from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.inventory import router as inventory_router
from app.database import get_db
from app.tasks.celery_app import celery_app

router = APIRouter(prefix="/api")

router.include_router(inventory_router, prefix="/inventory", tags=["inventory"])


@router.get("/health", tags=["health"])
def health_check(db: Session = Depends(get_db)):
    checks: dict = {"status": "ok"}

    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception:
        checks["status"] = "degraded"
        checks["database"] = "disconnected"

    try:
        conn = celery_app.connection()
        conn.ensure_connection(max_retries=1, timeout=3)
        conn.close()
        checks["rabbitmq"] = "connected"
    except Exception:
        checks["status"] = "degraded"
        checks["rabbitmq"] = "disconnected"

    return checks
