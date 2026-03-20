from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://inventory:inventory@postgres:5432/inventory"
    RABBITMQ_URL: str = "amqp://guest:guest@rabbitmq:5672//"
    DEBUG: bool = False

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
