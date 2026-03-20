from celery import Celery

from app.config import settings

celery_app = Celery(
    "inventory_worker",
    broker=settings.RABBITMQ_URL,
    backend="rpc://",
    include=["app.tasks.inventory"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)
