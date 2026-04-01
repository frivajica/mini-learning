# Kong API Gateway

## Overview

Kong is the API gateway in this stack, acting as the single entry point for all Supabase services. It handles routing, rate limiting, CORS, and authentication.

## Architecture

```
                    ┌─────────────────┐
                    │     Kong        │
                    │  API Gateway    │
                    │  (Port 54321)   │
                    └────────┬────────┘
                             │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│     Auth     │  │     REST     │  │   Realtime    │
│   (GoTrue)   │  │  (PostgREST) │  │   Server     │
│   Port 9999  │  │   Port 3000  │  │   Port 4000  │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Key Features Used

### 1. Rate Limiting

Kong's rate limiting plugin restricts API requests per minute:

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 10 # 10 requests per minute for auth
      policy: redis # Uses Redis for distributed rate limiting
      redis_host: redis
```

| Service  | Requests/Minute | Purpose                               |
| -------- | --------------- | ------------------------------------- |
| Auth     | 10              | Prevent brute force on login/register |
| REST API | 100             | General API usage                     |
| Realtime | 50              | WebSocket connections                 |
| Storage  | 30              | File uploads                          |

### 2. CORS (Cross-Origin Resource Sharing)

Configured to allow requests from the Next.js app:

```yaml
plugins:
  - name: cors
    config:
      origins:
        - "http://localhost:3000"
      methods:
        - GET
        - POST
        - PUT
        - DELETE
      credentials: true
```

### 3. Service Routing

Each Supabase service is exposed through Kong:

| Path             | Service       | Purpose                 |
| ---------------- | ------------- | ----------------------- |
| `/auth/v1/*`     | GoTrue        | Authentication          |
| `/rest/v1/*`     | PostgREST     | PostgreSQL REST API     |
| `/realtime/v1/*` | Realtime      | WebSocket subscriptions |
| `/storage/v1/*`  | Storage API   | File storage            |
| `/meta/v1/*`     | Postgres Meta | Database introspection  |

## Configuration File

The declarative configuration is in `docker/kong.yml`:

```yaml
_format_version: "3.0"

services:
  - name: auth-service
    url: http://auth:9999
    routes:
      - name: auth-route
        paths:
          - /auth/v1
    plugins:
      - name: rate-limiting
        config:
          minute: 10
          policy: redis
```

## Rate Limiting Tiers

### Anonymous (未认证)

- Auth endpoints: 10 req/min
- REST API: 100 req/min

### Authenticated (已认证)

- Auth endpoints: 10 req/min
- REST API: 100 req/min (with JWT)

## Local Development

Kong is automatically started with docker-compose:

```bash
docker-compose up -d kong
```

Access Kong Admin at `http://localhost:54322`

## Production Considerations

1. **JWT Secrets**: Use strong, unique secrets per environment
2. **Rate Limits**: Adjust based on expected traffic
3. **SSL/TLS**: Terminate SSL at Kong in production
4. **Plugin Updates**: Keep Kong plugins updated for security
5. **Monitoring**: Enable Kong logging for production

## Troubleshooting

### Check Kong Status

```bash
curl http://localhost:54321
```

### View Kong Logs

```bash
docker logs supabase-kong
```

### Validate Kong Config

```bash
docker run --rm -v $(pwd)/docker:/kong kong:3.4 kong config parse /kong/kong.yml
```

## Learning Resources

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Rate Limiting Plugin](https://docs.konghq.com/hub/kong-inc/rate-limiting/)
- [Kong Declarative Configuration](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative-config/)
