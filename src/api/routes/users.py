from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from src.schemas.user import (
    RoleUpdate,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from src.services.user_service import UserService
from src.dependencies import DBSession, CurrentUser, CurrentAdmin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=dict)
async def get_users(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
):
    user_service = UserService(db)
    users, meta = await user_service.get_all(page, limit, search)
    return {"data": [user.model_dump() for user in users], "meta": meta}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser,
    db: DBSession,
):
    user_service = UserService(db)
    return await user_service.get_by_id(current_user.user_id)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    user_service = UserService(db)
    return await user_service.get_by_id(user_id)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    db: DBSession,
    current_user: CurrentAdmin,
):
    user_service = UserService(db)
    return await user_service.create(
        data.model_dump(),
        current_user,
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    user_service = UserService(db)
    return await user_service.update(
        user_id,
        data.model_dump(exclude_unset=True),
        current_user,
    )


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    data: RoleUpdate,
    db: DBSession,
    current_user: CurrentAdmin,
):
    user_service = UserService(db)
    return await user_service.update_role(user_id, data.role, current_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: DBSession,
    current_user: CurrentAdmin,
):
    user_service = UserService(db)
    await user_service.delete(user_id, current_user)
