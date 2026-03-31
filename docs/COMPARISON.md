# Framework Comparison

Side-by-side comparison of the same features across all four frameworks.

---

## Project Structure

### Express

```
src/
├── controllers/     # Request handlers
├── routes/         # HTTP route definitions
├── services/       # Business logic
├── repositories/   # Database queries
├── middleware/     # Auth, rate limiting
├── db/            # Drizzle ORM setup
├── config/        # Environment config
└── server.ts      # App entry point
```

### FastAPI

```
src/
├── api/
│   ├── routes/    # Endpoint definitions
│   └── deps.py    # Dependencies (DI)
├── core/
│   ├── config.py  # Environment config
│   ├── security.py # JWT, hashing
│   └── database.py # SQLAlchemy setup
├── models/         # Pydantic schemas
├── services/      # Business logic
└── main.py        # App entry point
```

### NestJS

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/               # Data transfer objects
│   └── ...
├── users/
├── health/
├── common/       # Guards, interceptors, decorators
├── config/
└── app.module.ts # Root module
```

### Next.js

```
src/
├── app/                  # App Router
│   ├── (auth)/          # Auth pages
│   ├── (dashboard)/      # Protected pages
│   └── api/             # API routes
├── components/ui/        # Reusable UI
├── hooks/               # React Query hooks
├── lib/                 # Auth, db, redis, env
├── services/            # Business logic
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

---

## Authentication

### Express - JWT with httpOnly Cookies

```typescript
// src/middleware/auth.ts
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// src/routes/authRoutes.ts
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh", authController.refresh);
router.post("/logout", authMiddleware, authController.logout);
```

### FastAPI - JWT with httpOnly Cookies

```python
# src/core/security.py
from jose import jwt
from fastapi import HTTPException, status

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# src/api/routes/auth.py
@router.post("/login")
async def login(credentials: LoginSchema, response: Response):
    # Set httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=create_access_token({"sub": user.id}),
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=15 * 60
    )
    return {"user": user}
```

### NestJS - JWT with Decorators

```typescript
// src/auth/auth.controller.ts
@ApiTags("auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(ThrottlerGuard)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("refresh")
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }
}
```

### Next.js - NextAuth.js (Simplest)

```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      /* ... */
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});

// src/middleware.ts (or proxy.ts in Next.js 16)
export { auth as middleware } from "@/lib/auth";
```

---

## API Routes

### Express - Controller Pattern

```typescript
// src/controllers/authController.ts
export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    const result = await this.authService.register(req.body);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.cookie("refreshToken", result.refreshToken, { httpOnly: true });
    res.json({ user: result.user });
  }
}

// src/routes/authRoutes.ts
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
```

### FastAPI - Function Decorators

```python
# src/api/routes/auth.py
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    db_user = await get_user_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await create_user(user)

@router.post("/login")
async def login(credentials: LoginSchema, response: Response):
    # ... validate and set cookie
    return {"user": user}
```

### NestJS - Decorator-based Controllers

```typescript
// src/auth/auth.controller.ts
@Controller("api/v1/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get("users")
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return this.authService.getUsers();
  }
}
```

### Next.js - API Routes (App Router)

```typescript
// src/app/api/auth/login/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const result = await loginUser(body);

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: 401 },
    );
  }

  // Set httpOnly cookie
  const response = Response.json({ success: true, user: result.user });
  response.cookies.set("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
```

---

## Database Access

### Express - Drizzle ORM

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });

// src/repositories/userRepository.ts
export async function getUsers(limit: number, offset: number) {
  return db.select().from(users).limit(limit).offset(offset);
}

export async function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id));
}
```

### FastAPI - SQLAlchemy + Pydantic

```python
# src/core/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession)

# src/models/user.py
from sqlalchemy import Column, Integer, String
from src.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# src/api/routes/users.py
@router.get("/users")
async def get_users(skip: int = 0, limit: int = 100):
    async with async_session() as session:
        result = await session.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()
```

### NestJS - TypeORM or Prisma

```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
```

### Next.js - Drizzle ORM (Direct in Server Components)

```typescript
// src/lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/schema";

export const db = drizzle(postgres(env.DATABASE_URL), { schema });

// src/services/user.service.ts
export async function getUsers(limit: number, offset: number) {
  return db.select().from(users).limit(limit).offset(offset);
}

// src/app/(dashboard)/users/page.tsx (Server Component)
export default async function UsersPage() {
  const users = await getUsers(10, 0); // Direct DB access!
  return <UserList users={users} />;
}
```

---

## Validation

### Express - Zod

```typescript
// Shared schemas
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// In controller
const result = registerSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
```

### FastAPI - Pydantic (Built-in)

```python
# src/models/schemas.py
from pydantic import BaseModel, EmailStr, field_validator

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2)

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

# In route
@router.post("/register")
async def register(user: UserCreate):
    # Already validated!
    return await create_user(user)
```

### NestJS - class-validator

```typescript
// src/auth/dto/register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}

// In controller
async register(@Body() registerDto: RegisterDto) {
  // Already validated by class-validator!
  return this.authService.register(registerDto);
}
```

### Next.js - Zod (Same as Express)

```typescript
// src/lib/validations.ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

// In API route
const result = registerSchema.safeParse(body);
if (!result.success) {
  return Response.json({ errors: result.error.issues }, { status: 400 });
}
```

---

## Middleware Pattern

### Express - Classic Middleware Chain

```typescript
// src/middleware/rateLimit.ts
export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;
  const key = `rate:${ip}`;
  const count = redis.incr(key);

  if (count === 1) redis.expire(key, 60);

  if (count > 100) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
}

// src/server.ts
app.use(rateLimit);
app.use(authMiddleware);
app.use("/api", routes);
```

### FastAPI - Dependency Injection

```python
# src/api/deps.py
async def get_current_user(
    request: Request,
    response: Response,
    token: str | None = Cookie(None)
) -> User:
    if not token:
        raise HTTPException(401, "Not authenticated")

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return await get_user(int(user_id))

# Usage in routes
@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### NestJS - Guards & Interceptors

```typescript
// src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.accessToken;

    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}

// Usage
@Get('users')
@UseGuards(JwtAuthGuard)
async getUsers() {
  return this.authService.getUsers();
}
```

### Next.js - Middleware (proxy.ts)

```typescript
// src/proxy.ts (Next.js 16)
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(function proxy(req) {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isAuthPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Error Handling

### Express - Try/Catch Middleware

```typescript
// src/middleware/errorHandler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err.stack);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.issues,
    });
  }

  if (err instanceof UnauthorizedException) {
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
```

### FastAPI - Exception Handlers

```python
# src/main.py
from fastapi import HTTPException

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### NestJS - Exception Filters

```typescript
// src/common/filters/http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Usage
@UseFilters(HttpExceptionFilter)
@Controller("api")
export class AppController {}
```

### Next.js - API Response Pattern

```typescript
// src/app/api/users/route.ts
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const users = await getUsers();
    return Response.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

---

## Configuration

### Express - Manual Env Loading

```typescript
// src/config/index.ts
import "dotenv/config";

export const config = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  PORT: parseInt(process.env.PORT || "3000", 10),
};
```

### FastAPI - Pydantic Settings

```python
# src/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REDIS_URL: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

### NestJS - @nestjs/config

```typescript
// src/config/configuration.ts
export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "15m",
  },
});

// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
```

### Next.js - Env Validation with Zod

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  REDIS_URL: z.string().optional(),
});

let validated = false;

export function validateEnv() {
  if (validated) return;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error("Environment validation failed");
  }
  validated = true;
}

export const env = {
  get DATABASE_URL() {
    validateEnv();
    return process.env.DATABASE_URL!;
  },
};
```

---

## Summary Table

| Feature        | Express        | FastAPI        | NestJS          | Next.js          |
| -------------- | -------------- | -------------- | --------------- | ---------------- |
| **Setup**      | Manual         | Auto-generated | CLI             | create-next-app  |
| **Routing**    | Express Router | Decorators     | Controllers     | App Router files |
| **Validation** | Zod            | Pydantic       | class-validator | Zod              |
| **Auth**       | Manual JWT     | Manual JWT     | @nestjs/jwt     | NextAuth.js      |
| **DI**         | Manual         | Depends        | Built-in        | Hooks/Context    |
| **Types**      | Manual         | Pydantic       | TypeScript      | TypeScript       |
| **Docs**       | Manual         | Swagger UI     | Swagger         | Next.js Docs     |
| **Best For**   | Learning       | Python teams   | Enterprise      | React apps       |
