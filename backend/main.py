"""Main FastAPI application entrypoint."""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.api.routes import router as api_router

app = FastAPI(
    title="Sentinel Agentic Fraud Investigation API",
    description="Backend for the TigerGraph HH Goa Hackathon",
    version="1.0.0",
)

# Set up CORS for the UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/health")
def health_check():
    """System health check endpoint."""
    return {"status": "ok", "service": "Sentinel Backend"}

if __name__ == "__main__":
    import uvicorn
    # When run directly, start the uvicorn server
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
