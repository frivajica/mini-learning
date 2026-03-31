# NestJS Learning Guide

> ⭐ = Must know for production apps  
> 🔧 = Important for specific scenarios  
> 📚 = Good to understand

This project is a production-ready NestJS API. Use this guide to learn NestJS by comparing with Express.

---

## Quick Reference

| Priority | Topic | Section |
|----------|-------|---------|
| ⭐ | Project Structure | [1](#1-project-structure) |
| ⭐ | Modules | [2](#2-modules) |
| ⭐ | Controllers | [3](#3-controllers) |
| ⭐ | Services | [4](#4-services) |
| ⭐ | Dependency Injection | [5](#5-dependency-injection) |
| ⭐ | Authentication & JWT | [6](#6-authentication--jwt) |
| ⭐ | Guards & Authorization | [7](#7-guards--authorization) |
| ⭐ | Pipes & Validation | [8](#8-pipes--validation) |
| ⭐ | Exception Filters | [9](#9-exception-filters) |
| ⭐ | Security (Helmet, CORS) | [10](#10-security-helmet--cors) |
| ⭐ | API Documentation (Swagger) | [11](#11-api-documentation-swagger) |
| ⭐ | Rate Limiting | [12](#12-rate-limiting) |
| ⭐ | Database & Drizzle | [13](#13-database--drizzle) |
| ⭐ | Docker Setup | [14](#14-docker-setup) |
| 🔧 | Middleware & Compression | [15](#15-middleware--compression) |
| 🔧 | Interceptors | [16](#16-interceptors) |
| 🔧 | Graceful Shutdown | [17](#17-graceful-shutdown) |
| 🔧 | Testing | [18](#18-testing) |
| 📚 | NestJS vs Express | [19](#19-nestjs-vs-express) |

---

## 1. Project Structure ⭐

### Files to Review
- [src/app.module.ts](../src/app.module.ts) - Root module
- [src/main.ts](../src/main.ts) - Entry point

### Directory Layout
```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/       # Passport strategies
│   ├── guards/          # Authorization guards
│   └── dto/             # Data transfer objects
├── users/               # Users module
├── common/              # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
├── database/            # Database configuration
├── config/              # Configuration
├── health/              # Health checks
├── cache/               # Caching
└── main.ts              # Entry point
```

---

## 2. Modules ⭐

### Files to Review
- [src/app.module.ts](../src/app.module.ts)

### Key Concepts
A module groups related code (controllers, services, imports).

```typescript
@Module({
  imports: [DatabaseModule],         // Import other modules
  controllers: [UsersController],     // Controllers in this module
  providers: [UsersService],          // Services in this module
  exports: [UsersService],           // Expose to other modules
})
export class UsersModule {}
```

### Global Module
Use `@Global()` to make a module available app-wide (e.g., DatabaseModule).

---

## 3. Controllers ⭐

### Files to Review
- [src/users/users.controller.ts](../src/users/users.controller.ts)
- [src/auth/auth.controller.ts](../src/auth/auth.controller.ts)

### Key Concepts
Controllers handle incoming requests and return responses.

```typescript
@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Key Decorators
| Decorator | Purpose |
|-----------|---------|
| `@Controller()` | Defines a controller |
| `@Get()`, `@Post()`, `@Put()`, `@Delete()` | HTTP methods |
| `@Param()` | Route parameters |
| `@Body()` | Request body |
| `@Query()` | Query parameters |
| `@UseGuards()` | Apply guards |
| `@ApiTags()` | Swagger docs |

---

## 4. Services ⭐

### Files to Review
- [src/users/users.service.ts](../src/users/users.service.ts)
- [src/auth/auth.service.ts](../src/auth/auth.service.ts)

### Key Concepts
Services contain business logic. Mark with `@Injectable()`.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private configService: ConfigService,
  ) {}

  async findAll(pagination: PaginationDto) {
    return { data: [], meta: {} };
  }
}
```

---

## 5. Dependency Injection ⭐

> **Frontend Analogy**: Think of DI like React props - you don't create your child components inside a parent, you receive them. DI does the same for backend services.

### Files to Review
- [src/database/database.module.ts](../src/database/database.module.ts)
- [src/app.module.ts](../src/app.module.ts)
- [src/users/users.service.ts](../src/users/users.service.ts)

### What is Dependency Injection?

Instead of creating dependencies yourself, the framework **injects** them for you.

**Without DI (you create everything):**
```typescript
// Like doing this in React: const service = new UserService(new Database())
const db = new Database();
const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);
```

**With DI (someone gives it to you):**
```typescript
// Just declare what you need, NestJS gives it to you
constructor(private userService: UserService) {}
```

### Why Does It Matter?

| Benefit | Explanation |
|---------|-------------|
| **Testability** | Easy to swap real DB with mock |
| **Single Responsibility** | Services don't create their dependencies |
| **Loose Coupling** | Classes don't know how to create their dependencies |
| **Flexibility** | Easy to swap implementations (e.g., different DB) |

### How NestJS DI Works

**Step 1: Mark class as injectable**
```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private configService: ConfigService,
  ) {}
}
```

**Step 2: Register in module**
```typescript
// src/users/users.module.ts
@Module({
  providers: [UsersService],  // NestJS creates this for you
})
export class UsersModule {}
```

**Step 3: Use in constructor (automatic)**
```typescript
// src/users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}  // Injected!
}
```

### vs Express (Manual DI)

In Express, you manually wire everything:

```typescript
// src/di/container.ts
const userRepository = new UserRepository(dbConnection);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export { userController };
```

NestJS does this automatically based on types!

---

## 6. Authentication & JWT ⭐

### Files to Review
- [src/auth/auth.service.ts](../src/auth/auth.service.ts)
- [src/auth/strategies/jwt.strategy.ts](../src/auth/strategies/jwt.strategy.ts)
- [src/auth/auth.controller.ts](../src/auth/auth.controller.ts)

### Key Concepts

**JWT Strategy:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.userId, email: payload.email, role: payload.role };
  }
}
```

**Usage in Controller:**
```typescript
@UseGuards(AuthGuard('jwt'))
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

### What is Passport?

**Passport** is the standard authentication framework for Node.js. It provides a pluggable system with "strategies" for different auth methods (JWT, Google, Facebook, etc.).

```typescript
// Passport strategies are like adapters
passport.use(new JwtStrategy(options, verifyFn));
passport.use(new LocalStrategy(options, verifyFn));
passport.use(new GoogleStrategy(options, verifyFn));
```

### What Does Passport Do Here?

In this project, Passport handles the heavy lifting of JWT authentication:

| Step | What Passport Does |
|------|-------------------|
| 1. Extract | Reads `Authorization: Bearer <token>` from header |
| 2. Verify | Checks JWT signature using secret |
| 3. Expire | Ensures token hasn't expired |
| 4. Validate | Calls your `validate()` method with decoded payload |

Your `validate()` method just transforms the JWT payload into a user object:

```typescript
async validate(payload: JwtPayload) {
  // Payload contains { userId, email, role } from the token
  return { id: payload.userId, email: payload.email, role: payload.role };
}
```

### What Would Happen Without Passport?

You'd have to manually:
- Parse the `Authorization` header
- Decode the JWT with crypto
- Verify the signature
- Check expiration
- Handle all error cases

Passport does all this automatically!

### validate() in Real Apps

In production, your `validate()` should **fetch user from database**:

```typescript
async validate(payload: JwtPayload) {
  // 1. Fetch user from DB to ensure they still exist
  const user = await this.userService.findById(payload.userId);
  
  if (!user || user.isDeleted) {
    throw new UnauthorizedException('User not found');
  }
  
  // 2. Return user (attaches to req.user)
  return { id: user.id, email: user.email, role: user.role };
}
```

This ensures that even if a token is valid, the user account hasn't been deleted/disabled.

---

## 7. Guards & Authorization ⭐

### Files to Review
- [src/auth/guards/roles.guard.ts](../src/auth/guards/roles.guard.ts)
- [src/common/decorators/roles.decorator.ts](../src/common/decorators/roles.decorator.ts)

### Key Concepts
Guards determine if a request should be handled (like Express middleware but more powerful).

**Roles Guard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles?.includes(user.role);
  }
}
```

**Custom Decorator:**
```typescript
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage:**
```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Delete(':id')
deleteUser(id: number) { }
```

---

## 8. Pipes & Validation ⭐

### Files to Review
- [src/main.ts](../src/main.ts)
- [src/auth/dto/auth.dto.ts](../src/auth/dto/auth.dto.ts)

### Key Concepts
Pipes transform data or validate input.

**Global ValidationPipe:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Strip non-whitelisted props
  transform: true,              // Transform payloads to DTO instances
  forbidNonWhitelisted: true,   // Throw if non-whitelisted
}));
```

**DTO with Zod:**
```typescript
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});
```

**Type Conversion:**
```typescript
// Auto converts string "1" to number 1
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { }
```

---

## 9. Exception Filters ⭐

### Files to Review
- [src/common/filters/http-exception.filter.ts](../src/common/filters/http-exception.filter.ts)

### Key Concepts
Exception filters handle errors and format responses.

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
```

**Register globally in app.module.ts:**
```typescript
{
  provide: APP_FILTER,
  useFactory: (configService: ConfigService) => {
    return new AllExceptionsFilter(configService);
  },
  inject: [ConfigService],
},
```

---

## 10. Security (Helmet & CORS) ⭐

### Files to Review
- [src/main.ts](../src/main.ts)

### Key Concepts

**Helmet** - Sets security HTTP headers:
```typescript
import helmet from 'helmet';

app.use(helmet());
```

**CORS** - Enable cross-origin requests:
```typescript
const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',').filter(Boolean);
app.enableCors({
  origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : false,
  credentials: true,
});
```

### Why It Matters
| Feature | Protection |
|---------|------------|
| Helmet | XSS, clickjacking, MIME sniffing, etc. |
| CORS | Controls which domains can access your API |

---

## 11. API Documentation (Swagger) ⭐

### Files to Review
- [src/main.ts](../src/main.ts)

### Key Concepts
Swagger/OpenAPI generates interactive API docs.

```typescript
const config = new DocumentBuilder()
  .setTitle('NestJS Production API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```

**Access:** `http://localhost:3000/api-docs`

**Disable in production:**
```typescript
if (!isProduction) {
  // Setup Swagger
}
```

---

## 12. Rate Limiting ⭐

### Files to Review
- [src/app.module.ts](../src/app.module.ts)

### Key Concepts
Protect API from abuse using `@nestjs/throttler`.

**Setup in app.module.ts:**
```typescript
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    throttlers: [
      {
        ttl: config.get<number>('RATE_LIMIT_TTL') || 60000,  // Time window (ms)
        limit: config.get<number>('RATE_LIMIT_LIMIT') || 100, // Max requests
      },
    ],
  }),
}),
```

**Apply to controller:**
```typescript
@Controller('users')
@UseGuards(ThrottlerGuard)
export class UsersController { }
```

---

## 13. Database & Drizzle ⭐

### Files to Review
- [src/database/schema.ts](../src/database/schema.ts)
- [src/database/database.module.ts](../src/database/database.module.ts)

### Key Concepts

**Schema (same as Express):**
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('USER'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Global Database Module:**
```typescript
@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return drizzle(configService.get<string>('DATABASE_URL')!, { schema });
      },
    },
  ],
})
export class DatabaseModule {}
```

**Usage in Service:**
```typescript
@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: any) {}
}
```

---

## 14. Docker Setup ⭐

### Files to Review
- [Dockerfile](../Dockerfile)
- [docker-compose.yml](../docker-compose.yml)

### Key Concepts
- Multi-stage build
- Health checks
- PostgreSQL + Redis services

---

## 15. Middleware & Compression 🔧

### Files to Review
- [src/main.ts](../src/main.ts)

### Compression
Reduces response size by 70-90% for text data.

```typescript
import compression from 'compression';

app.use(compression());
```

### Custom Middleware
NestJS middleware can use `@Injectable()` pattern:

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.time('Request');
    res.on('finish', () => console.timeEnd('Request'));
    next();
  }
}

// Apply in module:
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(LoggerMiddleware)
    .forRoutes('users');
}
```

---

## 16. Interceptors 🔧

### Files to Review
- [src/common/interceptors/logging.interceptor.ts](../src/common/interceptors/logging.interceptor.ts)
- [src/app.module.ts](../src/app.module.ts)

### Key Concepts
Interceptors transform responses or add extra logic (like logging, timing).

**Logging Interceptor:**
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.logger.log(`${method} ${url} ${response.statusCode} - ${Date.now() - now}ms`);
      }),
    );
  }
}
```

**Register globally:**
```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
},
```

---

## 17. Graceful Shutdown 🔧

### Files to Review
- [src/main.ts](../src/main.ts)

### Key Concepts
Clean up resources on SIGTERM/SIGINT (e.g., Kubernetes, Docker).

```typescript
const shutdown = async (signal: string) => {
  logger.log(`Received ${signal}. Shutting down gracefully...`);
  await app.close();
  logger.log('Application closed');
  process.exit(0);
};

const forceExit = () => {
  logger.error('Forced shutdown after timeout');
  process.exit(1);
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
  setTimeout(forceExit, 10000); // Force after 10s
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
  setTimeout(forceExit, 10000);
});
```

---

## 18. Testing 🔧

### Files to Review
- [src/auth/auth.controller.spec.ts](../src/auth/auth.controller.spec.ts)

### Key Concepts

```typescript
const module = await Test.createTestingModule({
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService,
      useValue: mockAuthService, // Mock implementation
    },
  ],
}).compile();

const controller = module.get<AuthController>(AuthController);
```

### Benefits
- Easy mocking with `useValue`
- Built-in testing module
- Similar to Angular testing

---

## 19. NestJS vs Express 📚

See `NEST_VS_EXPRESS.md` for detailed comparison.

---

## Learning Path

1. **Start with**: `src/main.ts` - Entry point
2. **Then**: `src/app.module.ts` - How modules are organized
3. **Then**: `src/users/users.controller.ts` - How routes are defined
4. **Then**: `src/users/users.service.ts` - Business logic

### Key Differences from Express

| Express | NestJS |
|---------|--------|
| Manual DI | Built-in DI |
| Middleware | Guards, Interceptors, Pipes |
| Routes in files | Controllers with decorators |
| Manual error handling | Exception Filters |
| Your organization | Modules |

---

## Interview Questions

### ⭐ High Priority
1. Explain NestJS module system
2. How does dependency injection work in NestJS?
3. Guards vs Middleware - when to use each?
4. How do you handle validation in NestJS?

### 🔧 Medium Priority
1. Explain the difference between Guards and Interceptors
2. How does the exception filter work?
3. How do you test NestJS applications?
4. What's the purpose of modules in NestJS?
