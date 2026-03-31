from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


# Create User
class UserCreate(UserBase):
    password: str = Field(min_length=8)


# Update User
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None


# User Response
class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Role Update
class RoleUpdate(BaseModel):
    role: str = Field(pattern="^(USER|ADMIN|MODERATOR)$")


# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(UserBase):
    password: str = Field(min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str


# Pagination
class PaginatedResponse(BaseModel):
    data: list
    meta: dict
