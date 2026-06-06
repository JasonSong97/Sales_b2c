# Backend First 기획 검토 결과

## 1. 판정

조건부 통과

## 2. 이유

Backend 우선 구현 방향은 현재 프로젝트 상태와 맞다.

- 현재 BE/FE/Admin은 골조 단계다.
- 실제 기능 구현은 DB schema와 Auth/User 기반부터 시작해야 한다.
- 기존 `MVP-STARTER_PLAN`의 API/DB 계약이 상세하므로, 새 계획은 계약을 복제하지 않고 Backend 실행 순서만 좁히는 편이 안전하다.

## 3. 조건

구현 전 조건:

- API 상세 계약은 `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC`를 정본으로 유지한다.
- DB schema는 `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`를 정본으로 유지한다.
- 이 계획에서 API path, request/response, DB model을 임의 변경하지 않는다.
- 변경이 필요하면 먼저 기존 정본 문서를 갱신한다.

## 4. 주요 리스크

| 등급 | 리스크 | 대응 |
|---|---|---|
| Major | DB schema 없이 Auth/Domain API를 먼저 구현하면 repository/use case가 흔들린다. | B01에서 Prisma schema와 migration을 먼저 완료한다. |
| Major | Supabase Auth, App token, AuthDevice/AuthSession을 한 goal에 너무 크게 구현할 수 있다. | B03은 Auth/User만 포함하고 도메인 CRUD를 제외한다. |
| Major | Admin raw view는 보안 위험이 크다. | B17에서 reason validation과 AuditLog transaction 테스트를 완료 기준으로 둔다. |
| Minor | FE route와 API 계약 일부 표현이 다르다. | Backend는 API 계약을 우선하고, FE는 후속 계획에서 맞춘다. |

## 5. 구현 진입 판단

B01부터 구현 가능하다.

권장 첫 명령:

```text
/goal BACKEND-FIRST_PLAN B01 Prisma schema와 DB migration 기반을 구현한다.
범위는 DB-SCHEMA.md를 BE/prisma/schema.prisma에 반영하고, Prisma validate/generate, local migration 적용, 기본 seed 준비까지다.
Auth/User API와 도메인 CRUD 구현은 제외한다.
```

## 6. 관련 문서

- `TODO/BACKEND-FIRST_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`

