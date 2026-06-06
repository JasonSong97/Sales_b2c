# Backend First Plan

## 1. 목적

이 계획은 `MVP-STARTER_PLAN`의 전체 MVP 범위 중 Backend를 먼저 실제 동작 가능한 API 서버로 만들기 위한 실행 계획이다.

현재 저장소는 Backend, User Web, Admin Web의 골조가 만들어져 있고, 상세 도메인 구현은 아직 시작 전 상태다. 따라서 이 계획은 먼저 Backend의 DB, Auth, 공통 기반, 도메인 API, Admin/Audit, 테스트를 `/goal` 단위로 순차 구현하는 것을 목표로 한다.

## 2. 정본 관계

이 계획은 기존 정본을 대체하지 않는다.

- 제품/UX/기술 정본: `AGENT`
- MVP 전체 실행 정본: `TODO/MVP-STARTER_PLAN`
- API endpoint 계약 정본: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC`
- DB schema 정본: `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

`BACKEND-FIRST_PLAN`은 위 정본을 기준으로 Backend 구현 순서와 완료 기준만 좁혀서 관리한다.

## 3. 포함 범위

- Prisma schema, migration, Prisma Client 생성
- Supabase Cloud Auth 검증과 Backend App token/session 구현
- Backend 공통 기반: transaction, error, guard, current user context, pagination, encryption, storage port
- User API `/api/*`
- Admin API `/admin/api/*`
- 사용자 소유권 분리
- soft delete, trash, restore
- 민감정보 암호화, masking, raw view audit
- 외부 provider port와 실제 adapter 연결
- Backend 위험 흐름 테스트

## 4. 제외 범위

- User Web 화면 구현
- Admin Web 화면 구현
- 모바일 앱
- 결제/구독 자동화
- root workspace 생성
- MVP 범위 밖의 staging 환경

Frontend는 이번 계획에서 API 계약을 확인하는 소비자 역할만 가진다. 화면 구현은 기존 `MVP-STARTER_PLAN`의 FE goal 또는 별도 FE 계획에서 진행한다.

## 5. 폴더 구조

```text
BACKEND-FIRST_PLAN/
  README.md
  COMMON/
    README.md
    USER-FLOW.md
    GOAL-WORK-ORDER.md
    PLANNING-REVIEW.md
    API-SPEC/
      README.md
    GOAL-SPECS/
      README.md
  BE-TODO/
    README.md
    BACKEND-FIRST-TODO.md
  FE-TODO/
    README.md
```

## 6. 실행 원칙

- `/goal`은 `COMMON/GOAL-WORK-ORDER.md`의 B00, B01 순서로 실행한다.
- 한 번의 `/goal`에는 하나의 기반 작업 또는 하나의 도메인 vertical slice만 넣는다.
- API 구현 시 기존 `MVP-STARTER_PLAN/COMMON/API-SPEC/*-ENDPOINT-CONTRACT.md`를 반드시 확인한다.
- DB 변경이 있으면 기존 `MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`를 기준으로 한다.
- Backend domain/application 계층은 NestJS, Prisma, Supabase SDK, HTTP SDK를 import하지 않는다.
- User API와 Admin API는 controller/use case를 분리한다.
- Admin raw sensitive view는 사유 입력과 AuditLog transaction 없이는 구현 완료로 보지 않는다.

## 7. 첫 작업

첫 구현 goal은 B01이다.

```text
/goal BACKEND-FIRST_PLAN B01 Prisma schema와 DB migration 기반을 구현한다.
범위는 DB-SCHEMA.md를 BE/prisma/schema.prisma에 반영하고, Prisma validate/generate, local migration 적용, 기본 seed 준비까지다.
Auth/User API와 도메인 CRUD 구현은 제외한다.
```

