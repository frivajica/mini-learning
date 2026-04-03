from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.redis import get_redis
from src.dependencies import DBSession

router = APIRouter(tags=["Health"])


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "ok"}


@router.get("/health/ready", status_code=status.HTTP_200_OK)
async def readiness_check(
    db: AsyncSession = Depends(DBSession),
):
    checks = {"database": {"status": "ok"}, "redis": {"status": "ok"}}
    is_ready = True

    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        checks["database"] = {"status": "error", "error": str(e)}
        is_ready = False

    try:
        redis = await get_redis()
        await redis.ping()
    except Exception as e:
        checks["redis"] = {"status": "error", "error": str(e)}
        is_ready = False

    if not is_ready:
        return {"status": "not ready", "checks": checks}

    return {
        "status": "ready",
        "checks": checks,
    }
