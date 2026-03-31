import json
from typing import Any, Optional

import redis.asyncio as redis

from src.db.redis import get_redis


class CacheService:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def get_client(self) -> redis.Redis:
        if self.redis is None:
            self.redis = await get_redis()
        return self.redis

    async def get(self, key: str) -> Optional[Any]:
        client = await self.get_client()
        value = await client.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = 300,
    ) -> None:
        client = await self.get_client()
        await client.setex(key, ttl, json.dumps(value))

    async def delete(self, key: str) -> None:
        client = await self.get_client()
        await client.delete(key)

    async def delete_pattern(self, pattern: str) -> None:
        client = await self.get_client()
        keys = []
        async for key in client.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await client.delete(*keys)

    async def get_or_set(
        self,
        key: str,
        fetch_func,
        ttl: int = 300,
    ) -> Any:
        cached = await self.get(key)
        if cached is not None:
            return cached

        value = await fetch_func()
        await self.set(key, value, ttl)
        return value


cache_service = CacheService()
