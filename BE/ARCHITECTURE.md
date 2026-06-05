# Backend Architecture

`BE` is a single NestJS backend that serves User API and Admin API.

Path rules:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Module rules:

- `domain`: entities, value objects, domain errors. No NestJS, Prisma, HTTP SDK, OpenAI, Supabase, or logger imports.
- `application`: use cases, ports, repository interfaces, transaction orchestration, permission checks.
- `infrastructure`: Prisma repositories and external adapters.
- `presentation`: controllers, DTOs, guards, filters, decorators, response mapping.

Feature modules should follow this shape:

```text
src/modules/<feature>/
  domain/
  application/
    ports/
    use-cases/
  infrastructure/
    persistence/
    adapters/
  presentation/
    http/
      dto/
  <feature>.module.ts
```

Small modules may leave unused folders absent until needed, but cross-layer dependency direction stays the same.

Example when `company` grows:

```text
src/modules/company/
  domain/
    company.entity.ts
    company-log.entity.ts
    company.errors.ts
  application/
    ports/
      company.repository.ts
    use-cases/
      create-company.use-case.ts
      list-companies.use-case.ts
      get-company.use-case.ts
  infrastructure/
    persistence/
      prisma-company.repository.ts
      company.prisma-mapper.ts
  presentation/
    http/
      dto/
        create-company.dto.ts
        company-response.dto.ts
      company.controller.ts
  company.module.ts
```

Shared technical primitives live under `src/shared`. Domain/application code may depend on shared domain/application primitives, but not on shared infrastructure or presentation.
