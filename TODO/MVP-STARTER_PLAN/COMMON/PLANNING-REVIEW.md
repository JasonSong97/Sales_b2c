# MVP Starter 기획 검토 결과

## 1. 결론

- 판정: 조건부 통과
- 이유: `COMMON` 구조, 사용자 흐름, `/goal` 작업 순서, 공통 API 명세, goal별 화면/API/DB 추적 명세, DB 스키마 초안이 구현 직전 기준으로 정리되었다. 다만 실제 구현을 시작하기 전에는 G00에서 운영 결정값을 먼저 확정해야 한다.

## 2. 검토 대상

검토한 문서:

- `TODO/MVP-STARTER_PLAN/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/*`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/*`
- `TODO/MVP-STARTER_PLAN/FE-TODO/*`
- `TODO/MVP-STARTER_PLAN/BE-TODO/*`

기준 문서:

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`

## 3. 핵심 발견 사항

| 등급 | 문서 | 문제 | 영향 | 권장 조치 |
|---|---|---|---|---|
| Major | `COMMON/GOAL-WORK-ORDER.md` | G00 운영 결정이 실제 구현 전 선행되어야 한다. | G01 이후 스캐폴딩에서 package manager, Node 버전, local DB 방식이 흔들릴 수 있다. | 첫 `/goal`은 반드시 G00으로 실행한다. |
| Minor | `BE-TODO/API-TODO.md` | 기존 문서는 API 계약보다 Backend 작업 목록 성격이 강하다. | 구현자는 API 계약을 `COMMON/API-SPEC`에서 확인해야 한다. | `BE-TODO/API-TODO.md`는 Backend 구현 TODO로 유지하고, 상세 API 계약은 `COMMON/API-SPEC`을 정본으로 본다. |

## 4. 충돌 사항

현재 구현을 막는 Critical 충돌은 없다.

정리된 기준:

- API 명세 정본: `COMMON/API-SPEC`
- Backend 작업 목록: `BE-TODO/API-TODO.md`
- DB 스키마 정본: `BE-TODO/DB-SCHEMA.md`
- 화면/API/DB goal 추적 정본: `COMMON/GOAL-SPECS`

## 5. 사용자의 결정이 필요한 질문

현재 추가 질문 없이 문서 기준 작업은 진행할 수 있다.

단, 실제 구현을 시작하는 첫 goal인 G00에서는 다음 운영 결정이 문서로 확정되어야 한다.

- package manager
- Node 버전
- local DB 실행 방식
- Supabase 사용 방식
- 인증 구현 1차 전략
- `.env.example` 변수 목록

## 6. 구현 가능 여부

- 바로 구현 가능 여부: G00부터 가능
- 구현 전 반드시 수정할 항목: 없음
- 첫 번째로 실행할 goal: G00. 구현 전 운영 결정 정리

## 7. 구현 시작 원칙

- G00 없이 G01, G02, G03으로 넘어가지 않는다.
- 각 `/goal`은 `COMMON/GOAL-WORK-ORDER.md`의 순서를 따른다.
- 각 `/goal` 실행 전 `COMMON/GOAL-SPECS`의 해당 상세 명세를 확인한다.
- API 구현이 포함된 goal은 `COMMON/API-SPEC`의 해당 문서를 확인한다.
- DB 변경이 포함된 goal은 `BE-TODO/DB-SCHEMA.md`와 연결 DB 모델을 확인한다.

## 8. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
