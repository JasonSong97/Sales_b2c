# Frontend Architecture

`FE` contains two independent frontend apps:

- `user-web`: responsive user-facing sales workflow app
- `admin-web`: desktop-only admin console

There is no root frontend package and no shared frontend package. Each app owns its dependencies, API client, UI primitives, tests, and build config.

Both apps follow the feature-first structure:

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    ui/
    layout/
  features/
  hooks/
  lib/
  pages/
  store/
  styles/
  types/
  utils/
  main.tsx
```

User Web API client:

```text
FE/user-web/src/lib/api-client.ts
```

Admin Web API client:

```text
FE/admin-web/src/lib/admin-api-client.ts
```

Feature expansion example:

```text
src/features/<feature>/
  components/
  api/
  hooks/
  schemas/
  types/
  index.ts
```

Pages are route entry points and should compose feature public exports only.
