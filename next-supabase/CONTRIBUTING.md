# Contributing

Thank you for your interest in contributing to Mini Next Supabase!

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Initial Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/next-supabase.git
cd next-supabase
```

2. **Install dependencies:**

```bash
yarn install
```

3. **Set up environment variables:**

```bash
cp .env.example .env.local
```

4. **Start Docker services:**

```bash
docker-compose up -d
```

5. **Start development server:**

```bash
yarn dev
```

6. **Open http://localhost:3000**

## Development Workflow

### Code Quality

We enforce code quality through:

- **ESLint** - Linting
- **TypeScript** - Type safety
- **Vitest** - Unit and component tests
- **Playwright** - End-to-end tests

### Running Checks

```bash
# Lint code
yarn lint

# Type check
yarn typecheck

# Run all tests
yarn test

# Run E2E tests
yarn test:e2e
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run quality checks: `yarn lint && yarn typecheck && yarn test`
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
next-supabase/
├── src/
│   ├── actions/        # Server Actions
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   ├── hooks/         # React Query hooks
│   └── lib/           # Utilities and clients
├── docs/              # Documentation
├── e2e/               # Playwright E2E tests
├── docker/            # Docker configurations
└── .github/workflows/ # GitHub Actions
```

## Adding Features

### Adding a New Server Action

1. Create a new file in `src/actions/` (e.g., `tasks.ts`)
2. Use `"use server"` directive
3. Validate input with Zod
4. Return appropriate errors or success

### Adding a New API Route

1. Create a route file in `src/app/api/`
2. Handle authentication via middleware or session validation
3. Return JSON responses

### Adding Tests

**Unit tests** (`src/__tests__/`):

- Test validation logic
- Test utility functions
- Test server action logic

**Component tests** (`src/__tests__/components/`):

- Test UI component rendering
- Test component interactions

**E2E tests** (`e2e/`):

- Test user flows
- Test authenticated routes

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Ask questions in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
