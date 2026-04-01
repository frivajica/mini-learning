# Infrastructure

## Architecture Overview

This project uses a microservices architecture with Docker Compose for local development and containerization for production.

## Service Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                            │
│                                                                 │
│  ┌──────────────┐                                               │
│  │    Next.js   │◄────── Port 3000                              │
│  │   (App)      │                                               │
│  └──────┬───────┘                                               │
│         │                                                         │
│         ▼                                                         │
│  ┌──────────────┐                                               │
│  │    Kong     │◄────── Port 54321 (external)                   │
│  │  (Gateway)   │                                               │
│  └──────┬───────┘                                               │
│         │                                                         │
│  ┌──────┴───────┐    ┌──────────┐    ┌──────────┐              │
│  │  PostgreSQL  │    │   Auth   │    │   REST   │              │
│  │     DB       │◄──►│ (GoTrue) │◄──►│ (PostgREST)            │
│  └──────────────┘    └──────────┘    └──────────┘              │
│        │                                                         │
│        │         ┌──────────┐    ┌──────────┐                   │
│        └────────►│ Realtime │    │  Storage │                   │
│                  └──────────┘    └──────────┘                    │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Redis   │    │  Studio  │    │   Meta   │              │
│  │ (Cache)  │    │  (UI)    │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                             │
│  ┌──────────┐    ┌──────────┐                              │
│  │  Mail    │    │  Sentry  │                              │
│  │ (Mailpit)│    │ (Errors) │                              │
│  └──────────┘    └──────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Services

### Core Services

| Service       | Container         | Port  | Purpose          |
| ------------- | ----------------- | ----- | ---------------- |
| PostgreSQL    | supabase-db       | 5432  | Main database    |
| Kong          | supabase-kong     | 54321 | API Gateway      |
| GoTrue (Auth) | supabase-auth     | 9999  | Authentication   |
| PostgREST     | supabase-rest     | 3000  | REST API         |
| Realtime      | supabase-realtime | 4000  | WebSocket server |
| Storage       | supabase-storage  | 5000  | File storage     |
| Postgres Meta | supabase-meta     | 8080  | DB introspection |

### Infrastructure Services

| Service | Container       | Port        | Purpose                 |
| ------- | --------------- | ----------- | ----------------------- |
| Redis   | supabase-redis  | 6379        | Caching & rate limiting |
| Studio  | supabase-studio | 54323       | Admin UI                |
| Mail    | supabase-mail   | 1025, 54326 | Email testing           |
| Sentry  | sentry          | 9000        | Error tracking          |

### Application

| Service | Container         | Port | Purpose          |
| ------- | ----------------- | ---- | ---------------- |
| Next.js | next-supabase-app | 3000 | Main application |

## Port Mapping Reference

| Host Port | Service     | Notes                       |
| --------- | ----------- | --------------------------- |
| 3000      | Next.js App | Main application            |
| 5432      | PostgreSQL  | Direct DB access (dev only) |
| 54321     | Kong        | API Gateway                 |
| 54322     | Kong Admin  | Admin API                   |
| 54323     | Studio      | Supabase Admin UI           |
| 54324     | Realtime    | WebSocket                   |
| 54325     | Meta        | PostgreSQL introspection    |
| 54326     | Mail        | Web interface               |
| 6379      | Redis       | Cache/Rate limiting         |
| 9000      | Sentry      | Error tracking UI           |
| 9999      | Auth        | Auth service (internal)     |

## Health Checks

All services have health check endpoints:

| Service    | Health Endpoint                 | Expected Response |
| ---------- | ------------------------------- | ----------------- |
| PostgreSQL | `pg_isready`                    | OK                |
| Kong       | `http://localhost:54321`        | 200               |
| Auth       | `http://localhost:9999/health`  | 200               |
| PostgREST  | `http://localhost:54321:3000/`  | 200               |
| Meta       | `http://localhost:54325/health` | 200               |
| Redis      | `redis-cli ping`                | PONG              |

## Data Persistence

Volumes are used for persistent data:

| Volume       | Service    | Data           |
| ------------ | ---------- | -------------- |
| db_data      | PostgreSQL | Database files |
| storage_data | Storage    | Uploaded files |
| redis_data   | Redis      | Cache data     |
| sentry_data  | Sentry     | Event data     |

## Environment Variables

Key environment variables for infrastructure:

```env
# Database
POSTGRES_PASSWORD=postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Kong (internal)
KONG_DECLARATIVE_CONFIG=/var/lib/kong/kong.yml

# Redis
REDIS_HOST=redis
```

## Network Configuration

All services communicate over a Docker bridge network:

```yaml
networks:
  default:
    driver: bridge
```

Services reference each other by container name:

- `http://supabase-db:5432` (PostgreSQL)
- `http://supabase-auth:9999` (Auth)
- `http://supabase-redis:6379` (Redis)

## Development vs Production

### Development

- All services run via docker-compose
- Hot reload enabled for Next.js
- Source mounted as volumes
- Exposed ports for debugging

### Production

- Use Vercel for Next.js deployment
- Supabase Cloud or self-hosted
- Environment variables for secrets
- Docker image for Kong/Postgres

## Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps

# Restart a specific service
docker-compose restart kong

# Stop all services
docker-compose down

# Scale a service
docker-compose up -d --scale realtime=2
```
