# Gerenciamento de Estoque

Sistema de estoque conteinerizado com **FastAPI**, **PostgreSQL**,
**Celery/RabbitMQ** e frontend **React**. Toda a stack sobe com um
unico comando via Docker Compose.

## Execucao com Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Isso inicia todos os servicos (PostgreSQL, RabbitMQ, backend, Celery
Worker, frontend e Nginx). As migrations rodam automaticamente.

| Servico             | URL                           |
|---------------------|-------------------------------|
| Frontend            | http://localhost              |
| API                 | http://localhost/api/inventory |
| API Health          | http://localhost/api/health    |
| RabbitMQ Management | http://localhost:15672         |

## Execucao sem Docker

Pre-requisitos: Python 3.12, Node.js 20+, PostgreSQL 16 e RabbitMQ
rodando localmente.

**Backend:**

```bash
cd backend
python3.12 -m venv venv && source venv/bin/activate
pip install -e ".[dev]"

export DATABASE_URL="postgresql://inventory:inventory@localhost:5432/inventory"
export RABBITMQ_URL="amqp://guest:guest@localhost:5672//"

alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Celery Worker** (outro terminal):

```bash
cd backend && source venv/bin/activate
celery -A app.tasks.celery_app:celery_app worker --loglevel=info --concurrency=4
```

**Frontend** (outro terminal):

```bash
cd frontend
npm ci
npm run dev
```

## Makefile

| Comando          | Descricao                           |
|------------------|-------------------------------------|
| `make up`        | Sobe todos os servicos              |
| `make down`      | Para e remove containers e volumes  |
| `make logs`      | Acompanha logs de todos os servicos |
| `make test`      | Executa testes com pytest           |
| `make lint`      | Executa linter (Ruff)               |
| `make typecheck` | Verificacao de tipos (mypy)         |
| `make migrate`   | Executa migrations do Alembic       |
| `make db`        | Abre console psql                   |

## Decisoes Tecnicas

- **Bloqueio pessimista**: serializa escritas conflitantes sem retry
  storms.
- **Duas colunas de nome** (`name` + `normalized_name`): preserva
  exibicao em pt-BR enquanto evita duplicatas.
- **Arquitetura em camadas** (`routes -> services -> models`)
- **React + TypeScript + Vite**: tipagem estatica e bundle otimizado,
  com Tailwind CSS para estilizacao.
