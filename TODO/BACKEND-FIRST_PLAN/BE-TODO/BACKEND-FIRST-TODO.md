# Backend First 구현 TODO

## 1. 구현 기준

- Backend는 단일 NestJS 서버다.
- User API는 `/api/*`, Admin API는 `/admin/api/*`를 사용한다.
- 각 도메인은 `domain`, `application`, `infrastructure`, `presentation` 계층을 가진다.
- Controller는 application use case만 호출한다.
- Application layer가 transaction 경계를 가진다.
- Prisma는 infrastructure 계층에서만 사용한다.
- 외부 provider는 application port 뒤에 둔다.
- 사용자 소유 데이터는 항상 `userId`로 필터링한다.
- Admin raw sensitive view는 사유 입력과 AuditLog transaction 없이는 완료로 보지 않는다.

## 2. 공통 구현 체크리스트

각 Backend goal에서 확인한다.

- DTO validation이 있다.
- request/response DTO가 domain entity를 직접 노출하지 않는다.
- ownership check가 있다.
- soft delete 대상은 `deletedAt`, `permanentDeleteAt`을 처리한다.
- 삭제된 상세 조회는 410, 삭제된 mutation은 409 정책을 따른다.
- transaction이 필요한 흐름은 application use case에서 묶는다.
- domain/application 계층이 NestJS, Prisma, Supabase SDK를 import하지 않는다.
- focused test가 있다.

## 3. 우선 작업 묶음

### Foundation

- Prisma schema/migration
- Prisma module
- transaction manager
- error mapping
- current user context
- AuthGuard/AdminGuard
- pagination
- encryption/storage ports

### Auth/User

- Supabase token verification
- Backend App token issue/verify
- refresh cookie/session
- device slot policy
- user settings
- admin role bootstrap

### Core Domain

- Company
- Contact
- Product
- Tag
- PersonalMemo
- Deal

### Workflow

- Schedule
- MeetingNote
- BusinessCard
- Import
- Export
- Notification
- Trash
- Search

### Admin/Audit

- Admin dashboard
- global lists
- per-user lists
- masking
- raw sensitive view
- audit log

### Test/Release

- ownership isolation
- AdminGuard
- transaction side effects
- import rollback
- raw view audit
- build/typecheck/lint/test

## 4. 검증 명령

Backend goal 완료 시 기본적으로 아래 명령을 우선 확인한다.

```bash
cd /Users/jaegeunsong/Desktop/workplace/Sales_b2c/BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run test
pnpm run build
```

DB migration이 포함된 goal은 local Docker PostgreSQL이 필요하다.

```bash
cd /Users/jaegeunsong/Desktop/workplace/Sales_b2c/BE
pnpm run db:dev:up
```

## 5. 구현 금지

- root `package.json` 또는 workspace 생성
- User/Admin API를 같은 controller에서 role branch로 처리
- Controller에서 Prisma 직접 호출
- domain/application에서 Prisma type import
- Supabase SDK type을 application/domain에 노출
- 민감 원문을 평문 DB 저장
- PII를 logger에 평문 출력
- 적용된 migration 수정/삭제

