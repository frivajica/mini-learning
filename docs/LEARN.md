# FastAPI Learning Guide

> ⭐ = Must know for production apps  
> 🔧 = Important for specific scenarios  
> 📚 = Good to understand

This project is a production-ready FastAPI API. Use this guide to learn FastAPI by comparing with Express and NestJS.

---

## Quick Reference

| Priority | Topic | Section |
|----------|-------|---------|
| ⭐ | Project Structure | [1](#1-project-structure) |
| ⭐ | FastAPI Basics & Path Operations | [2](#2-fastapi-basics--path-operations) |
| ⭐ | Pydantic (Validation) | [3](#3-pydantic-validation) |
| ⭐ | Dependency Injection | [4](#4-dependency-injection) |
| ⭐ | Authentication & JWT | [5](#5-authentication--jwt) |
| ⭐ | RBAC (Role-based Access) | [6](#6-rbac-role-based-access) |
| ⭐ | Database & SQLAlchemy | [7](#7-database--sqlalchemy) |
| ⭐ | API Documentation | [8](#8-api-documentation) |
| ⭐ | Docker Setup | [9](#9-docker-setup) |
| 🔧 | Caching with Redis | [10](#10-caching-with-redis) |
| 🔧 | Testing | [11](#11-testing) |
| 📚 | FastAPI vs Express vs NestJS | [12](#12-fastapi-vs-express-vs-nestjs) |

---

## 1. Project Structure ⭐

### Files to Review
- [src/main.py](../src/main.py) - Application entry point
- [src/core/config.py](../src/core/config.py) - Configuration

### Directory Layout
```
src/
├── api/
│   └── routes/           # API endpoints (like Express routes)
│       ├── auth.py
│       ├── users.py
│       └── health.py
├── core/
│   ├── config.py         # Settings (Pydantic)
│   └── security.py      # JWT, password hashing
├── db/
│   ├── models.py        # SQLAlchemy ORM models
│   ├── repositories.py # Data access layer
│   └── redis.py         # Redis client
├── schemas/
│   └── user.py         # Pydantic schemas (DTOs)
├── services/
│   ├── user_service.py  # Business logic
│   └── cache_service.py
├── dependencies.py       # FastAPI dependency injection
└── main.py             # App factory
```

---

## 2. FastAPI Basics & Path Operations ⭐

### Files to Review
- [src/api/routes/users.py](../src/api/routes/users.py)
- [src/api/routes/auth.py](../src/api/routes/auth.py)

### Key Concepts
FastAPI uses **path operations** (decorators) to define routes:

```python
# src/api/routes/users.py
router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=dict)
async def get_users(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    user_service = UserService(db)
    users, meta = await user_service.get_all(page, limit, search)
    return {"data": users, "meta": meta}

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: DBSession, current_user: CurrentUser):
    ...

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: DBSession, current_user: CurrentAdmin):
    ...
```

### Key Decorators
| Decorator | Purpose |
|-----------|---------|
| `@router.get()`, `@router.post()` | HTTP methods |
| `@router.get("/{id}")` | Path parameters |
| `Query()` | Query parameters |
| `Body()` | Request body |
| `Depends()` | Dependency injection |
| `response_model` | Response serialization |

---

## 3. Pydantic (Validation) ⭐

### Files to Review
- [src/schemas/user.py](../src/schemas/user.py)
- [src/core/config.py](../src/core/config.py)

### Key Concepts
Pydantic provides automatic data validation. It's like Zod for TypeScript but even cleaner:

```python
# src/schemas/user.py
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr  # Auto-validates email format
    name: str | None = None
    password: str = Field(min_length=8)  # Custom validation

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    model_config = ConfigDict(from_attributes=True)  # From ORM
```

### Pydantic Features
| Feature | Example |
|---------|---------|
| Type coercion | `"123"` → `123` |
| Default values | `name: str = "John"` |
| Validation | `Field(min_length=8)` |
| Nested models | `address: AddressSchema` |
| Email validation | `EmailStr` |
| ORM mode | `model_validate(model)` |

### Pydantic Settings
```python
# src/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    
    model_config = SettingsConfigDict(env_file=".env")
```

---

## 4. Dependency Injection ⭐

> **Frontend Analogy**: Similar to React hooks or Vue composables - you declare what you need, FastAPI provides it.

### Files to Review
- [src/dependencies.py](../src/dependencies.py)
- [src/api/routes/users.py](../src/api/routes/users.py)

### Key Concepts
FastAPI has a powerful **Dependency Injection** system:

```python
# src/dependencies.py
async def get_db_session() -> AsyncSession:
    async for session in get_db():
        yield session

async def get_current_user(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    return current_user

# Type alias for cleaner code
DBSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentUser = Annotated[TokenData, Depends(get_current_active_user)]
```

### Using Dependencies
```python
# src/api/routes/users.py
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: DBSession,  # Injected automatically
    current_user: CurrentUser,  # Injected automatically
):
    user_service = UserService(db)
    return await user_service.get_by_id(user_id)
```

### Why It Matters

| Benefit | Explanation |
|---------|-------------|
| **Testability** | Easy to override with mocks |
| **Reusability** | Share logic across routes |
| **Clean Code** | Routes only handle business logic |
| **Type Safety** | Full IDE autocomplete |

---

## 5. Authentication & JWT ⭐

### Files to Review
- [src/core/security.py](../src/core/security.py)
- [src/api/routes/auth.py](../src/api/routes/auth.py)

### Key Concepts

**JWT Token Creation:**
```python
# src/core/security.py
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> TokenData:
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    return TokenData(**payload)
```

**Dependency for Protected Routes:**
```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    return decode_token(credentials.credentials)
```

### Auth Flow

```
1. User → /auth/login → returns JWT tokens
2. User → /users (with Authorization: Bearer <token>)
3. get_current_user dependency → validates token
4. Route handler receives current_user
```

---

## 6. RBAC (Role-based Access) ⭐

### Files to Review
- [src/dependencies.py](../src/dependencies.py)
- [src/api/routes/users.py](../src/api/routes/users.py)

### Key Concepts
FastAPI uses **dependencies** for authorization:

```python
# src/dependencies.py
async def get_current_admin_user(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user

CurrentAdmin = Annotated[TokenData, Depends(get_current_admin_user)]
```

### Usage in Routes
```python
# Only admins can create users
@router.post("", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    db: DBSession,
    current_user: CurrentAdmin,  # Requires ADMIN role
):
    user_service = UserService(db)
    return await user_service.create(data.model_dump(), current_user)

# Anyone logged in can view
@router.get("/{user_id}")
async def get_user(
    user_id: int,
    db: DBSession,
    current_user: CurrentUser,  # Just needs to be logged in
):
    ...
```

---

## 7. Database & SQLAlchemy ⭐

### Files to Review
- [src/db/models.py](../src/db/models.py)
- [src/db/repositories.py](../src/db/repositories.py)

### Key Concepts

**ORM Models:**
```python
# src/db/models.py
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="USER")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
```

**Async Repository:**
```python
# src/db/repositories.py
class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
```

**Database Connection:**
```python
# src/db/models.py
engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession)

async def get_db():
    async with async_session_maker() as session:
        yield session
```

---

## 8. API Documentation ⭐

### Key Concepts
FastAPI has **built-in** Swagger/OpenAPI docs!

```python
# src/main.py
app = FastAPI(
    title="FastAPI Production",
    version="1.0.0",
    docs_url="/api-docs",  # Swagger UI
    redoc_url="/redoc",   # ReDoc
)
```

**Access:** `http://localhost:3000/api-docs`

### Benefits
| Feature | Description |
|---------|-------------|
| Auto-generated | From your code |
| Interactive | Try endpoints |
| Type hints | Shows automatically |
| Schema | JSON schema included |

---

## 9. Docker Setup ⭐

### Files to Review
- [Dockerfile](../Dockerfile)
- [docker-compose.yml](../docker-compose.yml)

### Key Concepts
- Multi-stage build (Python slim + uv)
- PostgreSQL + Redis services
- Health checks
- Non-root user in production

---

## 10. Caching with Redis 🔧

### Files to Review
- [src/db/redis.py](../src/db/redis.py)
- [src/services/cache_service.py](../src/services/cache_service.py)

### Key Concepts

**Redis Client:**
```python
# src/db/redis.py
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
```

**Cache Service:**
```python
# src/services/cache_service.py
class CacheService:
    async def get(self, key: str) -> Any:
        value = await client.get(key)
        return json.loads(value) if value else None
    
    async def set(self, key: str, value: Any, ttl: int = 300):
        await client.setex(key, ttl, json.dumps(value))
```

---

## 11. Testing 🔧

### Files to Review
- [tests/test_auth.py](../tests/test_auth.py)

### Key Concepts
FastAPI works great with **pytest** and `httpx`:

```python
# tests/test_auth.py
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={...})
    assert response.status_code == 201
```

### Running Tests
```bash
pytest              # Run tests
pytest --cov       # With coverage
```

---

## 12. FastAPI vs Express vs NestJS 📚

### Quick Comparison

| Feature | Express | NestJS | FastAPI |
|---------|---------|--------|---------|
| **Language** | JavaScript | TypeScript | Python |
| **DI System** | Manual | Built-in | Built-in |
| **Validation** | Zod/middleware | Pipes (Zod) | Pydantic |
| **API Docs** | Swagger (manual) | Swagger (manual) | Auto! |
| **Type Safety** | Optional | Full | Full |
| **Learning Curve** | Easy | Medium | Easy |

### Key Differences

| Aspect | FastAPI | NestJS |
|--------|---------|--------|
| **Validation** | Pydantic (cleaner) | Pipes |
| **DI** | `Depends()` | `@Injectable()` |
| **Routes** | `@router.get()` | `@Get()` |
| **Async** | Native (`async/await`) | Native (`async/await`) |

### When to Use Each

| Use Case | Framework |
|----------|-----------|
| Python team, ML/AI apps | FastAPI |
| Enterprise, Java/C# background | NestJS |
| Simple APIs, Node.js team | Express |
