from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    # Comma-separated pool of models. Each model has its own free-tier quota,
    # so spreading agents across models multiplies the daily budget.
    GEMINI_MODELS: str = "gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-lite-latest,gemini-3-flash-preview"
    GEMINI_MIN_INTERVAL: float = 12.0  # seconds between Gemini calls (free tier ~5 RPM)
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    DATA_DIR: str = "./data"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def gemini_models_list(self) -> List[str]:
        models = [m.strip() for m in self.GEMINI_MODELS.split(",") if m.strip()]
        return models or [self.GEMINI_MODEL]


settings = Settings()

# Create data directories
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.DATA_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(settings.DATA_DIR, "faiss_index"), exist_ok=True)
os.makedirs(os.path.join(settings.DATA_DIR, "analyses"), exist_ok=True)