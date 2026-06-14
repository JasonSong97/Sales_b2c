# Deal Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
|---:|---|---|---|---|
| 1 | `G01-BE-DEAL-DOMAIN` | Backend | completed | Company, Contact, Product Backend API와 DB 모델 |
| 2 | `G02-FE-DEAL-PAGES` | Frontend | pending | `G01-BE-DEAL-DOMAIN` 완료 |

## 2. G01-BE-DEAL-DOMAIN

목적:

- 딜 도메인 DB와 User API를 구현한다.
- Frontend가 실제 계약으로 딜 화면을 만들 수 있게 한다.

읽을 문서:

- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G01-BE-DEAL-DOMAIN.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`

완료 조건:

- Prisma schema와 migration이 추가된다.
- `/api/deals/*` 계약 API가 모두 구현된다.
- Deal 생성과 최초 다음 행동 로그 생성이 transaction으로 묶인다.
- 목록의 최신 다음 행동 1개 조회가 구현된다.
- export xlsx가 검색/필터/정렬을 반영하고 id, 제품, 최근수정일을 제외한다.
- API 테스트가 통과한다.

## 3. G02-FE-DEAL-PAGES

목적:

- User Web 딜 화면을 새 Backend 계약과 연결한다.

읽을 문서:

- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G02-FE-DEAL-PAGES.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/FE-TODO/G02-FE-DEAL-PAGES.goal.md`

완료 조건:

- 기존 stale Deal contract 사용이 제거된다.
- 단계별 개수, 목록, 상세, 생성, 수정, 로그, export가 실제 API와 연결된다.
- 검색/필터/정렬/페이지네이션이 URL 또는 화면 상태와 일관되게 동작한다.
- Desktop split view와 Mobile 전환 화면이 깨지지 않는다.
- 빌드와 핵심 수동 검증이 통과한다.

## 4. 병렬 처리 기준

- G01은 완료되었으므로 G02는 실제 Backend API를 기준으로 진행한다.
- 실제 mutation, export, 로그 연동은 `DEAL_API.md`와 `DEAL_API_DETAIL.md`의 implemented 계약을 기준으로 진행한다.
- 계약 변경이 발생하면 `DEAL_API.md`, `DEAL_API_DETAIL.md`, 각 goal 문서를 먼저 갱신한다.
