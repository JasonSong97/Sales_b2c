# Sales B2C Monorepo

This repository root is the monorepo root for `한손에 영업 / onehand.sales`.

The root does not use a package manager workspace. Frontend and backend apps are intentionally independent and each app owns its own dependencies.

## Structure

```text
AGENT/
  PLANNING/
  CONVENTION/
  ARCHITECTURE/
  DECISIONS/
FE/
  user-web/
  admin-web/
BE/
archive/
```

## Rules

- Root has no `package.json`.
- `FE` and `BE` do not share packages or dependencies.
- `FE/user-web` and `FE/admin-web` are separate frontend apps.
- `BE` is a single NestJS server with `/api/*` and `/admin/api/*`.
- Mobile app is not created yet. It will be added later when app development starts.
- `AGENT` is the source of truth for planning, architecture, convention, and decisions.
- `archive` is reference-only and does not override `AGENT`.
