# Supabase Setup

This backend currently uses Supabase only as an external Auth provider.

## Scope

- PostgreSQL: Backend connects directly through Prisma.
- Auth: FE signs in with Supabase Auth, then Backend verifies the Supabase access token through `/api/auth/exchange`.

FE must not write directly to Supabase PostgreSQL.

## Required Values

Create `BE/.env` from `BE/.env.example` and fill these values:

```env
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_JWKS_URL="https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json"
SUPABASE_JWT_ISSUER="https://<project-ref>.supabase.co/auth/v1"
APP_JWT_SECRET=""
APP_REFRESH_TOKEN_SECRET=""
INITIAL_ADMIN_EMAILS=""
```

Use long random strings for `APP_JWT_SECRET` and `APP_REFRESH_TOKEN_SECRET`.

`INITIAL_ADMIN_EMAILS` is a comma-separated allowlist for the first admin accounts.

## Verification

```bash
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run build
```

## Current Code Links

- Auth verifier port: `src/shared/application/ports/external-auth-verifier.port.ts`
- Supabase JWT adapter: `src/shared/infrastructure/supabase/supabase-jwt-verifier.adapter.ts`

Business domain tables and migrations should be added later only when requested.
