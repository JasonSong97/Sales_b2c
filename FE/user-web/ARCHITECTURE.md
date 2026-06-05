# User Web Architecture

`FE/user-web` follows the feature-first structure from `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`.

Current shape:

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    layout/
    ui/
  features/
  hooks/
  lib/
    api-client.ts
    env.ts
    query-client.ts
  pages/
  store/
  styles/
  types/
  utils/
  main.tsx
```

Feature expansion example:

```text
src/features/company/
  components/
    company-list.tsx
    company-create-dialog.tsx
    company-detail-summary.tsx
  api/
    company.api.ts
    company.queries.ts
  hooks/
    use-company-list-params.ts
  schemas/
    company.schema.ts
  types/
    company.types.ts
  index.ts
```

Route page example:

```text
src/pages/companies/index.tsx
```

The page composes exported feature components from `@/features/company`. It should not import feature internals directly.
