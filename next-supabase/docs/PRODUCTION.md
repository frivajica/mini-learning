# Production Deployment

## Overview

This guide covers production readiness, deployment strategies, and security hardening for the Next-Supabase project.

## Pre-Production Checklist

### Security Hardening

- [ ] Change all default secrets
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting (Kong)
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring (Sentry)

### Environment Variables

Never commit secrets to git. Use environment variables:

```env
# Supabase (Self-hosted)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry
SENTRY_DSN=https://your-sentry.com
SENTRY_AUTH_TOKEN=your-auth-token

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Deployment Options

### Option 1: Vercel + Supabase Cloud

Best for: Quick setup, managed infrastructure

1. Deploy Next.js to Vercel
2. Connect to Supabase Cloud
3. Set environment variables
4. Configure custom domain

### Option 2: Vercel + Self-Hosted Supabase

Best for: Full control, self-hosted

1. Deploy Supabase via Docker on VPS
2. Configure Supabase with your domain
3. Deploy Next.js to Vercel
4. Connect to self-hosted Supabase

### Option 3: Docker + Kubernetes

Best for: Enterprise, full containerization

1. Containerize all services
2. Deploy to Kubernetes
3. Set up Ingress with TLS
4. Configure persistent volumes

## Docker Production Deployment

### Building the Image

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - kong
```

## Kong Rate Limiting (Production)

Increase rate limits for production:

```yaml
# docker/kong.yml
plugins:
  - name: rate-limiting
    config:
      minute: 1000 # Increase for production
      policy: redis
```

## Sentry Self-Hosted Setup

### Initialize Sentry Database

```bash
docker-compose up -d db redis
docker-compose run --rm sentry upgrade
```

### Create Admin User

```bash
docker-compose run --rm sentry createuser
```

### Configure DSN

Set `SENTRY_DSN` in your Next.js environment to point to your Sentry instance.

## Monitoring

### Health Check Endpoint

The `/api/health` endpoint returns service status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Sentry Integration

Error tracking is configured via `src/lib/sentry.ts`:

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

## Database Backups

Configure automated backups for PostgreSQL:

```yaml
# In docker-compose.yml for db service
volumes:
  db_data:
    driver: local
```

Use `pg_dump` for manual backups:

```bash
docker-compose exec db pg_dump -U postgres > backup.sql
```

## Performance Optimization

### Next.js Optimization

```typescript
// next.config.js
{
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### Database Connection Pooling

Use PgBouncer for connection pooling in production:

```yaml
services:
  pgbouncer:
    image: edoburu/pgbouncer
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/postgres
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 100
```

## CI/CD Pipeline

See `.github/workflows/` for GitHub Actions configuration:

- `test.yml` - Lint, typecheck, unit tests, E2E tests
- `deploy.yml` - Build Docker image, deploy to Vercel

## Security Checklist

- [ ] Rotate all JWT secrets
- [ ] Enable HTTPS everywhere
- [ ] Configure CSP headers
- [ ] Set secure cookie flags
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Penetration testing
- [ ] Rate limit all endpoints
- [ ] Validate all inputs (Zod)
- [ ] Sanitize outputs

## Disaster Recovery

1. **Backups**: Daily automated PostgreSQL backups
2. **Monitoring**: Sentry for error alerts
3. **Logging**: Centralized logging with Kong
4. **Incident Response**: Documented runbooks
5. **Communication**: Status page for users

## Useful Commands

```bash
# Start production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f app

# Scale services
docker-compose up -d --scale app=3

# Restart with new config
docker-compose down && docker-compose -f docker-compose.prod.yml up -d
```
