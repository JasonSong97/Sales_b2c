# Shared Backend

Shared backend code is split by layer:

```text
shared/
  domain/
  application/
  infrastructure/
  presentation/
```

Rules:

- `shared/domain`: domain errors and domain-safe primitives.
- `shared/application`: ports, transaction abstractions, current user context types.
- `shared/infrastructure`: Prisma, logger, encryption/storage/external provider adapters.
- `shared/presentation`: filters, guards, decorators, DTO helpers.

Do not place business feature logic here. If code knows about Company, Contact, Product, Deal, or Admin workflows, it belongs in a module.
