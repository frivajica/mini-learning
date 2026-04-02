# Documentation

Quick navigation for this Payload CMS project.

## Getting Started

- [Quick Start](./QUICKSTART.md) - Run the project in 5 minutes
- [Architecture](./ARCHITECTURE.md) - How the pieces fit together

## Learning

- [Learn Payload CMS](./guides/LEARN.md) - Payload concepts and usage
- [Authentication](./guides/AUTH_INFO.md) - Built-in auth + OAuth setup
- [File Storage](./guides/STORAGE.md) - Media handling and storage

## Reference

- [Collections](./guides/COLLECTIONS.md) - Collection configuration guide

---

## Tech Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| CMS       | Payload 3.x (canary)              |
| Framework | Next.js 16                       |
| Database  | SQLite (dev) / PostgreSQL (prod) |
| Auth      | Payload built-in + Google OAuth  |
| Storage   | Local filesystem                  |
| Styling   | Tailwind CSS                      |
| Testing   | Vitest + Playwright               |

## Project Structure

```
payload/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes (health, custom endpoints)
│   │   ├── (app)/        # Public frontend routes
│   │   └── (payload)/    # Payload admin routes
│   ├── collections/       # Modular collection definitions
│   ├── components/       # React components
│   └── lib/             # Utilities (payload, lexical, rate-limit)
├── docs/                 # Documentation
│   ├── guides/           # Learning guides
│   └── *.md              # Reference docs
├── proxy.ts              # Next.js 16 Proxy (middleware)
├── payload.config.ts     # Payload CMS configuration
└── docker-compose.yml   # Docker setup
```
payload/
├── src/
│   ├── app/              # Next.js App Router
│   ├── collections/      # Modular collection definitions
│   ├── components/       # React components
│   └── lib/             # Utilities + Payload client
├── docs/                # Documentation
│   ├── guides/          # Learning guides
│   └── *.md             # Reference docs
├── payload.config.ts    # Payload CMS configuration
└── docker-compose.yml  # Docker setup
```
