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
    try:
        await db.execute(text("SELECT 1"))
        redis = await get_redis()
        await redis.ping()
        return {"status": "ready", "database": "ok", "redis": "ok"}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}
