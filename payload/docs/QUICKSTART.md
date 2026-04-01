# Quick Start

Get up and running in 5 minutes.

## 1. Start with Docker Compose

```bash
docker-compose up --build
```

Access:

- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

## 2. Manual Setup

### Prerequisites

- Node.js 20+
- Yarn (or npm)
- PostgreSQL (for production) or SQLite (for dev)

### Installation

```bash
cd payload
yarn install
```

### Development

```bash
yarn dev
# Opens at http://localhost:3000/admin
```

### Production Build

```bash
yarn build
yarn start
```

## 3. Create Admin User

1. Navigate to http://localhost:3000/admin
2. Click "Create Account"
3. Set up your admin user

## 4. Environment Variables

```bash
# Copy example env
cp .env.example .env

# Required for production
PAYLOAD_SECRET_KEY=your-secret-key
DATABASE_URI=postgresql://user:pass@host:5432/payload
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

## 5. Key Scripts

```bash
yarn dev          # Start development server
yarn build       # Build for production
yarn start       # Start production server
yarn test        # Run unit tests
yarn test:e2e    # Run E2E tests
yarn lint        # Run ESLint
```

## 6. Default Collections

| Collection | Slug         | Purpose                 |
| ---------- | ------------ | ----------------------- |
| Users      | `users`      | Authentication          |
| Posts      | `posts`      | Blog posts              |
| Categories | `categories` | Hierarchical categories |
| Tags       | `tags`       | Flat tags               |
| Media      | `media`      | File uploads            |

## 7. Admin Features

- Rich text editor (Lexical)
- Draft/publish workflow
- Media library with image processing
- Role-based access control (admin/user)
