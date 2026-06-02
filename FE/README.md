# FE

Frontend apps are separated by product surface.

## Apps

- `user-web`: user-facing web MVP
- `admin-web`: admin web app

Each app has its own package dependencies. No shared frontend package is used at the monorepo root.

## Canonical Rules

User Web:

- `../AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web:

- `../AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/CONVENTION/ADMIN_WEB.md`

Shared comment/logging:

- `../AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
