from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/nexhire"
    OPENAI_API_KEY: str = ""
    GITHUB_TOKEN: str = ""
    STACK_EXCHANGE_KEY: str = ""
    JWT_SECRET_KEY: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REDIS_URL: str = "redis://localhost:6379/0"
    UPLOAD_DIR: str = "uploads/"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
