import logging
import random
import time

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


class SimulatedProcessingError(Exception):
    pass


@celery_app.task(
    bind=True,
    max_retries=3,
    autoretry_for=(SimulatedProcessingError,),
    retry_backoff=2,
    retry_backoff_max=60,
    retry_jitter=True,
)
def process_inventory_change(self, item_id: int, operation: str, quantity: int):  # type: ignore[no-untyped-def]
    logger.info(
        "Processing: item_id=%s op=%s qty=%s attempt=%s/%s",
        item_id,
        operation,
        quantity,
        self.request.retries,
        self.max_retries,
    )

    # 50% simulated failure
    if random.random() < 0.5:
        logger.warning(
            "Simulated failure for item_id=%s (attempt %s)",
            item_id,
            self.request.retries,
        )
        raise SimulatedProcessingError(f"Simulated error for item {item_id}")

    # Throttle 1-5s at the END
    throttle = random.uniform(1, 5)
    logger.info("Throttling %.2fs for item_id=%s", throttle, item_id)
    time.sleep(throttle)

    logger.info("Completed: item_id=%s op=%s", item_id, operation)
    return {"item_id": item_id, "operation": operation, "status": "completed"}
