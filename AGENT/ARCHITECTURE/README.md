# ARCHITECTURE

Architecture source-of-truth documents live here.

Current documents:

- `OVERVIEW.md`
- `BACKEND.md`
- `FRONTEND_USER_WEB.md`
- `ADMIN_WEB.md`
- `TESTING.md`

Future documents:

- mobile architecture
- deployment architecture

Rules:

- If an archived document conflicts with this folder, this folder wins.
- Mobile rules are not canonical yet.
- User Web and Admin Web are separate apps.
- Backend is one NestJS server for MVP, split by `/api/*` and `/admin/api/*`.
