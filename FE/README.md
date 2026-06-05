# FE

Frontend apps are separated by product surface.

## Apps

- `user-web`: user-facing web MVP
- `admin-web`: admin web app

Each app has its own package dependencies. No shared frontend package is used at the monorepo root.

## Local Setup

Open separate terminals for each app.

Prerequisite: Node.js 24 LTS must be active. The apps have `.nvmrc`/`engines` set to Node 24.

User Web:

```bash
cd FE/user-web
pnpm install
pnpm run dev
```

Admin Web:

```bash
cd FE/admin-web
pnpm install
pnpm run dev
```

Local ports:

- User Web: `http://localhost:5173`
- Admin Web: `http://localhost:5174`

Both frontend apps are deployed to Vercel as separate projects.

## Canonical Rules

User Web:

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web:

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/ADMIN_WEB.md`

Shared comment/logging:

- `../AGENT/SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`


