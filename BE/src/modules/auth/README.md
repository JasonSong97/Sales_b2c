# Auth Module

Current scope:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /admin/api/me`
- App access token guard
- Admin guard
- `UserOAuthAccount`, `AuthDevice`, and `AuthSession` persistence

Business-domain authentication rules should be added later inside the owning domain module.
