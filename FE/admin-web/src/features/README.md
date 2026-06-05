# Features

Admin business feature slices live here.

Example when `user-management` is implemented:

```text
features/user-management/
  components/
    admin-user-table.tsx
    admin-user-detail-panel.tsx
    user-status-dialog.tsx
  api/
    admin-user.api.ts
    admin-user.queries.ts
  hooks/
    use-admin-user-table-state.ts
  schemas/
    user-status.schema.ts
  types/
    admin-user.types.ts
  index.ts
```

Pages must import from `@/features/user-management`, not from internal feature files.
