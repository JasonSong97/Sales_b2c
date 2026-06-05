# BE

Backend app.

## Stack

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

## API Split

- User API: `/api/*`
- Admin API: `/admin/api/*`

Admin APIs must be protected by admin guards.

## Local Setup

Open a separate terminal for Backend.

Prerequisite: Node.js 24 LTS must be active.

```bash
pnpm install
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run start:dev
```

Local URL: `http://localhost:3000`

Health check: `GET /api/health`

## Canonical Rules

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

