# Admin Web Architecture

`FE/admin-web` follows the feature-first structure from `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`.

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
    admin-api-client.ts
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
src/features/deal-management/
  components/
    admin-deal-table.tsx
    admin-deal-detail-panel.tsx
    sensitive-raw-view-dialog.tsx
  api/
    admin-deal.api.ts
    admin-deal.queries.ts
  hooks/
    use-admin-deal-table-state.ts
  schemas/
    sensitive-raw-view.schema.ts
  types/
    admin-deal.types.ts
  index.ts
```

Route page example:

```text
src/pages/deals/index.tsx
```

The page composes exported feature components from `@/features/deal-management`. It should not import feature internals directly.
