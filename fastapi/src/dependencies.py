from typing import Annotated, Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.repositories import UserRepository
from src.db.models import get_db
from src.core.security import TokenData, get_current_user
from src.services.user_service import UserService


async def get_db_session() -> AsyncSession:
    async for session in get_db():
        yield session


async def get_current_active_user(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    return current_user


async def get_current_admin_user(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


def get_user_repository(
    db: AsyncSession = Depends(get_db_session),
) -> UserRepository:
    return UserRepository(db)


def get_user_service(
    db: AsyncSession = Depends(get_db_session),
) -> UserService:
    return UserService(db)


# Type aliases for cleaner dependencies
DBSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentUser = Annotated[TokenData, Depends(get_current_active_user)]
CurrentAdmin = Annotated[TokenData, Depends(get_current_admin_user)]
OptionalCurrentUser = Optional[TokenData]
