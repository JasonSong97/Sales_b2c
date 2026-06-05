# Module Template

Use this structure for new backend modules:

```text
<module>/
  domain/
    *.entity.ts
    *.value-object.ts
    *.errors.ts
  application/
    ports/
      *.repository.ts
      *.port.ts
    use-cases/
      *.use-case.ts
  infrastructure/
    persistence/
      prisma-*.repository.ts
      *.prisma-mapper.ts
    adapters/
      *.adapter.ts
  presentation/
    http/
      dto/
        *.dto.ts
      *.controller.ts
  <module>.module.ts
```

Dependency direction:

```text
presentation -> application -> domain
infrastructure -> application/domain
```

`domain` and `application` must not import Prisma, NestJS controllers, HTTP clients, OpenAI/Supabase SDKs, or frontend-facing DTOs.
