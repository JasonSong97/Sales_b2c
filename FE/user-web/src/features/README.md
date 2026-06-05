# Features

Business feature slices live here.

Example when the `deal` feature is implemented:

```text
features/deal/
  components/
    deal-list.tsx
    deal-detail-panel.tsx
    deal-create-dialog.tsx
  hooks/
    use-deal-filters.ts
  api/
    deal.api.ts
    deal.queries.ts
  schemas/
    deal.schema.ts
  types/
    deal.types.ts
  index.ts
```

Pages must import from `@/features/deal`, not from internal feature files.
