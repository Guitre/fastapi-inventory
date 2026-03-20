.PHONY: up down logs logs-api logs-worker shell db migrate lint typecheck test build

up:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f backend

logs-worker:
	docker compose logs -f celery-worker

shell:
	docker compose exec backend bash

db:
	docker compose exec postgres psql -U inventory -d inventory

migrate:
	docker compose exec backend alembic upgrade head

lint:
	docker compose exec backend ruff check app/

typecheck:
	docker compose exec backend mypy app/

test:
	docker compose exec backend pytest -v

build:
	docker compose build
