from datetime import datetime
from typing import Optional

from sqlalchemy import Select, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.db.models import RefreshToken, User
from src.core.security import get_password_hash, verify_password


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, email: str, password: str, name: Optional[str] = None) -> User:
        user = User(
            email=email,
            name=name,
            hashed_password=get_password_hash(password),
            role="USER",
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_by_id(self, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
    ) -> tuple[list[User], int]:
        stmt = select(User).order_by(User.id)

        if search:
            stmt = stmt.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar() or 0

        stmt = stmt.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(stmt)
        users = result.scalars().all()

        return list(users), total

    async def update(self, user_id: int, **kwargs) -> Optional[User]:
        if "password" in kwargs:
            kwargs["hashed_password"] = get_password_hash(kwargs.pop("password"))

        stmt = update(User).where(User.id == user_id).values(**kwargs).returning(User)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, user_id: int) -> bool:
        stmt = delete(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.rowcount > 0

    async def verify_password(self, user: User, password: str) -> bool:
        return verify_password(password, user.hashed_password)


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            is_revoked=False,
        )
        self.db.add(refresh_token)
        await self.db.flush()
        return refresh_token

    async def get_by_token(self, token: str) -> Optional[RefreshToken]:
        stmt = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.is_revoked == False,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke_token(self, token: str) -> bool:
        stmt = update(RefreshToken).where(RefreshToken.token == token).values(is_revoked=True)
        result = await self.db.execute(stmt)
        return result.rowcount > 0

    async def revoke_all_user_tokens(self, user_id: int) -> bool:
        stmt = update(RefreshToken).where(RefreshToken.user_id == user_id).values(is_revoked=True)
        result = await self.db.execute(stmt)
        return result.rowcount > 0
