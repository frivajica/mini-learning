# NestJS vs Express

A comparison of how the same features are implemented in Express vs NestJS.

---

## Quick Comparison

| Aspect | Express | NestJS |
|--------|---------|--------|
| **Framework Type** | Minimal, unopinionated | Full-featured, opinionated |
| **DI System** | Manual | Built-in |
| **Code Organization** | Manual | Modules |
| **Learning Curve** | Low | Medium |
| **Flexibility** | High | Medium |

---

## 1. Dependency Injection

### Express (Manual DI)
```typescript
// src/di/container.ts
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const createUserController = () => userController;
```

### NestJS (Built-in DI)
```typescript
// src/users/users.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private configService: ConfigService,
  ) {}
}
```

---

## 2. Controllers

### Express
```typescript
// src/controllers/userController.ts
export class UserController {
  constructor(private userService: IUserService) {}

  getAll = asyncHandler(async (req, res) => {
    const users = await this.userService.getAll();
    res.json(users);
  });
}

export const userController = new UserController(userService);
```

### NestJS
```typescript
// src/users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
```

---

## 3. Routing

### Express
```typescript
// src/routes/userRoutes.ts
const router = Router();
router.get('/', authenticate, userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.post('/', authenticate, authorize('ADMIN'), userController.create);
```

### NestJS
```typescript
// src/users/users.controller.ts
@Controller('users')
export class UsersController {
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() { }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id', ParseIntPipe) id: number) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) { }
}
```

---

## 4. Authentication

### Express (Middleware)
```typescript
// src/middleware/auth.ts
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, config.jwt.secret);
  req.user = decoded;
  next();
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new UnauthorizedError('Not authorized');
  }
  next();
};
```

### NestJS (Guards)
```typescript
// src/auth/guards/roles.guard.ts
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

// Usage in controller
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
create() { }
```

---

## 5. Validation

### Express (Middleware)
```typescript
// src/middleware/validate.ts
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  req.body = result.data;
  next();
};

// Usage
router.post('/', validate(createUserSchema), controller.create);
```

### NestJS (Pipes)
```typescript
// src/main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
}));

// DTO with Zod
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

// Usage in controller
@Post()
create(@Body() createUserDto: CreateUserDto) { }
```

---

## 6. Error Handling

### Express (Middleware)
```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
};
```

### NestJS (Exception Filters)
```typescript
// src/common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
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

---

## 7. Modules Organization

### Express (Manual)
```
src/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middleware/
├── di/
│   └── container.ts
```

### NestJS (Modules)
```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/
│   ├── guards/
│   └── dto/
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
├── database/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
├── config/
├── app.module.ts
└── main.ts
```

---

## 8. Testing

### Express
```typescript
// test/userService.test.ts
jest.mock('../repositories/userRepository', () => ({
  userRepository: {
    findAll: jest.fn(),
  },
}));

const userService = new UserService(userRepository);
```

### NestJS
```typescript
// src/auth/auth.controller.spec.ts
const module = await Test.createTestingModule({
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService,
      useValue: mockAuthService,
    },
  ],
}).compile();

const controller = module.get<AuthController>(AuthController);
```

---

## When to Use Each

### Use Express when:
- Building simple APIs or prototypes
- Need maximum flexibility
- Team is new to Node.js
- Small to medium projects

### Use NestJS when:
- Building enterprise/large applications
- Need structured architecture
- Team knows OOP (TypeScript, Java, C#)
- Need built-in features (DI, Guards, Pipes)
- Want consistent code organization

---

## Summary

| Feature | Express | NestJS |
|---------|---------|--------|
| DI | Manual | Built-in |
| Validation | Middleware | Pipes |
| Auth | Middleware | Guards |
| Error Handling | Middleware | Exception Filters |
| Organization | Your choice | Modules |
| Learning Curve | Easy | Medium |
| Flexibility | High | Medium |

NestJS brings Angular-like patterns to Node.js. It's great for teams coming from strongly-typed languages or when you need enterprise-grade architecture out of the box.
