from typing import Optional

from fastapi import APIRouter, Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas.user import (
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from src.services.user_service import AuthService
from src.dependencies import DBSession

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    db: DBSession,
):
    auth_service = AuthService(db)
    return await auth_service.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: DBSession,
):
    auth_service = AuthService(db)
    return await auth_service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshRequest,
    db: DBSession,
):
    auth_service = AuthService(db)
    return await auth_service.refresh(data.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    db: DBSession,
    refresh_token: Optional[str] = Header(None),
):
    auth_service = AuthService(db)
    await auth_service.logout(refresh_token)
    return MessageResponse(message="Logged out successfully")
