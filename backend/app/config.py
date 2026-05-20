"""Application configuration"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables"""
    database_url: str = "postgresql+asyncpg://user:password@localhost/db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "your-secret-key-here"
    debug: bool = False

    class Config:
        """Pydantic config"""
        env_file = ".env"


settings = Settings()