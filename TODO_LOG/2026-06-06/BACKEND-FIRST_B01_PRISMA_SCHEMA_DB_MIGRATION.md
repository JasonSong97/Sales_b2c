# Backend First B01 적용 검토 기록

## 1. 작업명

Backend First B01. Prisma schema와 DB migration 기반

## 2. 작업 일자

2026-06-06

## 3. 관련 계획과 goal

- 계획: `TODO/BACKEND-FIRST_PLAN`
- Goal: `B01. Prisma schema와 DB migration 기반`
- 기준 문서: `TODO/BACKEND-FIRST_PLAN/COMMON/GOAL-WORK-ORDER.md`
- DB 정본: `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

## 4. 적용 범위

Backend MVP DB 기반을 만들기 위해 Prisma schema, 초기 migration, seed 스크립트를 적용했다.

적용된 내용:

- MVP enum과 model을 `BE/prisma/schema.prisma`에 반영
- 초기 migration SQL 생성
- local Docker PostgreSQL에 migration 적용
- 시스템 `DealActivityType` seed 추가
- `pnpm run prisma:seed` script 추가

제외한 내용:

- Auth/User API 구현
- 도메인 CRUD API 구현
- Supabase Auth provider 설정
- Supabase Cloud project 연결
- OpenAI, Google Calendar, SMTP, Web Push 실제 adapter 구현

## 5. 변경 파일

- `BE/package.json`
- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260606000000_init_mvp_schema/migration.sql`
- `BE/prisma/seed.ts`

## 6. 검증 결과

통과한 검증:

- Docker Desktop daemon 확인
- `pnpm run db:dev:up`
- `docker compose ps`: `sales_b2c_postgres` healthy 확인
- `pnpm exec prisma migrate deploy`: migration 적용 성공
- `pnpm run prisma:seed`: seed 적용 성공
- seed 확인 query: 시스템 `DealActivityType` 6개 확인
- `pnpm exec prisma migrate status`: Database schema is up to date
- `pnpm run prisma:validate`
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run build`

주의한 검증:

- 샌드박스 기본 권한에서는 Docker socket과 localhost DB 접근이 막혔다.
- Docker와 local Postgres 접근이 필요한 명령은 승인 권한으로 실행했다.

## 7. 검토 결과

판정: 통과

근거:

- B01 완료 기준인 Prisma schema validation이 통과했다.
- local DB에 migration을 적용했다.
- Prisma seed를 실행했고 기본 시스템 활동 타입 6개를 확인했다.
- generated Prisma Client 기준으로 Backend typecheck, lint, build가 통과했다.
- Auth/User API와 도메인 CRUD는 B01 제외 범위로 유지했다.

## 8. 남은 리스크 또는 보류 사항

- Supabase 계정과 project는 아직 없다. B03 Auth/User 전까지 준비하면 된다.
- `BE/.env` 파일은 없다. 현재 검증은 명령별 환경 변수 주입으로 수행했다.
- Prisma 계정은 필요 없다. 현재 Prisma는 ORM/CLI로만 사용한다.
- migration은 초기 schema 기준이다. 적용 후 migration 파일은 수정하지 않는 정책을 지킨다.

## 9. 다음 권장 작업

다음 작업은 `BACKEND-FIRST_PLAN`의 B02다.

권장 범위:

- Prisma module/service 정리
- Prisma transaction manager adapter
- domain/application error base
- HTTP exception filter의 domain error mapping
- current user context 골격
- AuthGuard/AdminGuard 골격
- pagination DTO/type
- `EncryptionPort`와 test adapter

