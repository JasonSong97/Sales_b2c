# Architecture Overview

---

## 1. Repository Structure

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

Rules:

- Root has no `package.json`.
- No package workspace.
- FE and BE do not share packages or dependencies.
- Each app owns its own package setup.

## 2. Frontend

User Web stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

Admin Web stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- data table library can be added in admin app

FE structure:

```text
FE/
  user-web/
  admin-web/
```

User Web and Admin Web are separate apps.

Detailed rules:

- `ARCHITECTURE/FRONTEND_USER_WEB.md`
- `ARCHITECTURE/ADMIN_WEB.md`

## 3. Backend

Backend stack:

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

API split:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Admin API must use auth guard and admin guard.

Detailed rule:

- `ARCHITECTURE/BACKEND.md`

## 4. Backend Module Rule

Each business domain should use this four-layer structure.

```text
domain/
application/
infrastructure/
presentation/
```

Domain layer must not depend on NestJS, Prisma, HTTP clients, or external SDKs.

Application layer orchestrates use cases and uses domain repositories/ports.

Infrastructure layer implements repositories and external adapters.

Presentation layer contains controllers and DTOs.

## 5. AI Integration

AI Provider:

- OpenAI

Use cases:

- Business card OCR
- Meeting note generation
- Excel/CSV import column mapping

Rule:

- OpenAI calls must be wrapped behind backend interfaces/ports.
- Business use cases stay in their domain modules.

## 6. Auth

Providers:

- Kakao
- Google
- Naver
- Apple

Auth is user-based. Admin authorization is role-based.

## 7. Mobile

Mobile is not created in the repo yet.

Future stack:

- React Native
- Expo

Mobile will be added after web MVP validation.

## 8. Data Protection

Sensitive data is masked by default in Admin.

Raw sensitive data access requires:

- explicit action
- reason input
- audit log

Sensitive data includes:

- personal memo
- meeting note body
- deal amount
- user-marked sensitive data

## 9. Testing

Detailed rule:

- `ARCHITECTURE/TESTING.md`

MVP E2E scope includes both User Web and Admin Web.
