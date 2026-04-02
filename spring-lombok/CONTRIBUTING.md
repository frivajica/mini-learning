# Contributing to Mini Spring Project

Thank you for your interest in contributing to Mini Spring!

## Development Setup

### Prerequisites

- Java 21
- Docker & Docker Compose
- Maven (or use the included Maven wrapper)

### Initial Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/mini-learning.git
cd mini-learning/spring-lombok
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET (required, minimum 32 characters)
```

3. **Start infrastructure:**

```bash
docker compose up -d
```

4. **Run the application:**

```bash
./mvnw spring-boot:run
```

5. **Run tests:**

```bash
./mvnw test
```

## Development Workflow

### Code Quality

We enforce code quality through:

- **Checkstyle** - Code style guidelines
- **PMD** - Static code analysis
- **SpotBugs** - Bug detection
- **JaCoCo** - Test coverage

### Running Checks

```bash
# Format code
./mvnw com.diffplug.spotless:apply

# Run all checks
./mvnw verify

# Run specific checks
./mvnw checkstyle:check pmd:check spotbugs:check
```

### Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run quality checks: `./mvnw verify`
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
src/main/java/com/mini/
├── config/           # Security, Redis, CORS configuration
├── controller/       # REST endpoints (Auth, User, Health)
├── service/          # Business logic
├── repository/       # Data access (JPA)
├── model/            # JPA entities
├── dto/              # Request/Response objects
├── security/         # JWT handling
├── exception/        # Error handling
└── util/             # Utilities
```

## Adding Features

### Adding a New REST Endpoint

1. Create a new controller in `src/main/java/com/mini/controller/`
2. Add request/response DTOs in `src/main/java/com/mini/dto/`
3. Add validation using Jakarta Bean Validation annotations
4. Add tests in `src/test/java/com/mini/`

### Adding Database Migrations

Flyway migrations are in `src/main/resources/db/migration/`:

```sql
-- V2__add_new_table.sql
CREATE TABLE new_table (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Ask questions in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
