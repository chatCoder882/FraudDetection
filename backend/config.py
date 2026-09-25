"""Sentinel — Configuration & environment loader."""

import os
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env")


class Settings:
    """Application settings sourced from environment variables."""

    # TigerGraph
    TG_HOST: str = os.getenv("TG_HOST", "")
    TG_USERNAME: str = os.getenv("TG_USERNAME", "")
    TG_PASSWORD: str = os.getenv("TG_PASSWORD", "")
    TG_SECRET: str = os.getenv("TG_SECRET", "")
    TG_GRAPHNAME: str = os.getenv("TG_GRAPHNAME") or os.getenv("TG_GRAPH", "FraudGraph")

    # LLM — Gemini
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")

    # App
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"]


settings = Settings()
