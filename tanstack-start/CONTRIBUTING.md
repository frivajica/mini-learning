# Contributing to TanStack Start Mini Project

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- Node.js 20+
- Yarn

### Initial Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/mini-learning.git
cd mini-learning/tanstack-start
```

2. **Install dependencies:**

```bash
yarn install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET (required, minimum 32 characters)
```

4. **Run the development server:**

```bash
yarn dev
```

## Development Workflow

### Code Quality

We use:
- **TypeScript** for type safety
- **Vitest** for testing

### Running Checks

```bash
# Type check
yarn typecheck

# Run tests
yarn test
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run quality checks: `yarn typecheck && yarn test`
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
├── routes/                     # File-based routes
│   ├── index.tsx              # Home (public)
│   ├── login.tsx              # Login (public)
│   ├── register.tsx            # Register (public)
│   ├── _authed.tsx            # Protected layout
│   ├── _authed/dashboard.tsx   # Dashboard
│   ├── _authed/users.tsx       # Users list
│   ├── api/live.ts             # Liveness probe
│   ├── api/ready.ts            # Readiness probe
│   └── api/auth/              # Auth API
├── components/ui/             # UI components
├── lib/                      # Library code
│   ├── api/hooks.ts          # React Query hooks
│   └── query-client.ts        # QueryClient config
├── server/                   # Server-side code
│   ├── auth.ts              # JWT + bcrypt functions
│   ├── db.ts                # SQLite database layer
│   └── rate-limit.ts        # Rate limiting
└── router.tsx               # Router configuration
```

## Adding Features

### Adding a New Route

TanStack Start uses file-based routing. Create a new file in `src/routes/`.

### Adding a Server Function

```typescript
import { createServerFn } from "@tanstack/react-start/server";

export const myFn = createServerFn({ method: "GET" }).handler(async () => {
  return { message: "Hello" };
});
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
