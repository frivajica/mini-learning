# Contributing to NestJS Mini Project

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Yarn

### Initial Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/mini-learning.git
cd mini-learning/nest
```

2. **Install dependencies:**

```bash
yarn install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET and JWT_REFRESH_SECRET (both min 32 chars)
```

4. **Start infrastructure:**

```bash
docker compose up -d postgres redis
```

5. **Generate database schema:**

```bash
yarn db:generate
```

6. **Run the application:**

```bash
yarn start:dev
```

## Development Workflow

### Code Quality

We use:
- **ESLint** for linting
- **TypeScript** for type safety
- **Jest** for testing

### Running Checks

```bash
# Lint code
yarn lint

# Run tests
yarn test

# Run tests with coverage
yarn test:cov
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run quality checks: `yarn lint && yarn test`
4. Commit your changes: `git commit -m "feat: add my feature"`
5. Push to your branch: `git push origin feature/my-feature`
6. Open a Pull Request

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting)
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/      # Passport JWT strategy
│   ├── guards/          # Authorization guards
│   └── dto/             # Data transfer objects
├── users/               # Users module
├── health/              # Health check module
├── database/            # Drizzle ORM setup
├── common/
│   ├── decorators/      # Custom decorators (Roles)
│   ├── filters/        # Exception filters
│   └── interceptors/   # Logging interceptor
├── config/              # Configuration
├── app.module.ts
└── main.ts
```

## Adding Features

### Adding a New REST Endpoint

1. Create a new controller in the appropriate module
2. Add service methods for business logic
3. Use Zod for validation in DTOs
4. Use Guards for authorization
5. Add tests

### Database Migrations

```bash
# Generate migration from schema changes
yarn db:generate

# Push schema to database (development)
yarn db:push
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
