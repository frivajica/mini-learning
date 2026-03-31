from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models import User
from src.db.repositories import RefreshTokenRepository, UserRepository
from src.schemas.user import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    TokenData,
)
from src.core.config import get_settings

settings = get_settings()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.token_repo = RefreshTokenRepository(db)

    async def register(self, data: RegisterRequest) -> TokenResponse:
        existing_user = await self.user_repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user = await self.user_repo.create(
            email=data.email,
            password=data.password,
            name=data.name,
        )

        return await self._create_tokens(user)

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not await self.user_repo.verify_password(user, data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        await self.token_repo.revoke_all_user_tokens(user.id)
        return await self._create_tokens(user)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        token_data = decode_token(refresh_token, token_type="refresh")

        stored_token = await self.token_repo.get_by_token(refresh_token)
        if not stored_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if stored_token.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired",
            )

        user = await self.user_repo.get_by_id(token_data.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        await self.token_repo.revoke_token(refresh_token)
        return await self._create_tokens(user)

    async def logout(self, refresh_token: str) -> None:
        if refresh_token:
            await self.token_repo.revoke_token(refresh_token)

    async def _create_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(
            data={"user_id": user.id, "email": user.email, "role": user.role}
        )
        refresh_token = create_refresh_token(
            data={"user_id": user.id, "email": user.email, "role": user.role}
        )

        expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, refresh_token, expires_at)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_all(
        self,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
    ) -> tuple[list[UserResponse], dict]:
        users, total = await self.user_repo.get_all(page, limit, search)

        return (
            [UserResponse.model_validate(user) for user in users],
            {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit,
            },
        )

    async def get_by_id(self, user_id: int) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return UserResponse.model_validate(user)

    async def create(self, data: dict, current_user: TokenData) -> UserResponse:
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        user = await self.user_repo.create(**data)
        return UserResponse.model_validate(user)

    async def update(self, user_id: int, data: dict, current_user: TokenData) -> UserResponse:
        if current_user.role != "ADMIN" and current_user.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        user = await self.user_repo.update(user_id, **data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return UserResponse.model_validate(user)

    async def delete(self, user_id: int, current_user: TokenData) -> None:
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        deleted = await self.user_repo.delete(user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

    async def update_role(self, user_id: int, role: str, current_user: TokenData) -> UserResponse:
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        user = await self.user_repo.update(user_id, role=role)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return UserResponse.model_validate(user)
