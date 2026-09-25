"""TigerGraph connection singleton."""

import logging

import pyTigerGraph
from backend.config import settings

logger = logging.getLogger(__name__)

def get_tg_connection() -> pyTigerGraph.TigerGraphConnection:
    """Initialize and return a TigerGraph connection."""
    missing = [
        name for name, value in {
            "TG_HOST": settings.TG_HOST,
            "TG_USERNAME": settings.TG_USERNAME,
            "TG_PASSWORD": settings.TG_PASSWORD,
            "TG_GRAPHNAME/TG_GRAPH": settings.TG_GRAPHNAME,
            "TG_SECRET": settings.TG_SECRET,
        }.items() if not value
    ]
    if missing:
        raise RuntimeError("Missing TigerGraph configuration: " + ", ".join(missing))

    conn = pyTigerGraph.TigerGraphConnection(
        host=settings.TG_HOST,
        username=settings.TG_USERNAME,
        password=settings.TG_PASSWORD,
        graphname=settings.TG_GRAPHNAME
    )
    
    # Get token using the secret
    conn.getToken(settings.TG_SECRET)
    return conn

# Keep the API available when TigerGraph is temporarily unreachable. Graph-backed
# operations can handle an unavailable connection when they are invoked.
try:
    tg_conn = get_tg_connection()
except Exception as exc:
    logger.warning("TigerGraph connection unavailable: %s", exc)
    tg_conn = None
