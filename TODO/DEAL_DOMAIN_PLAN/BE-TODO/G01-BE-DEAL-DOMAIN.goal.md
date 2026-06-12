# /goal G01-BE-DEAL-DOMAIN

## 1. Goal

Backend Deal 도메인 DB와 User API를 구현한다.

## 2. 먼저 읽을 문서

- `TODO/DEAL_DOMAIN_PLAN/README.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G01-BE-DEAL-DOMAIN.md`
- `TODO/DEAL_DOMAIN_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`

## 3. 작업 체크리스트

- [ ] Prisma schema에 Deal 모델 3개와 relation을 추가한다.
- [ ] migration을 생성한다.
- [ ] Prisma Client를 생성한다.
- [ ] DealStatus enum과 label mapper를 만든다.
- [ ] Deal module을 기존 Backend module 구조에 맞춰 추가한다.
- [ ] DTO validation을 작성한다.
- [ ] repository에서 ownership 조건을 포함한 query를 작성한다.
- [ ] application service에서 생성 transaction을 구현한다.
- [ ] 목록 API의 최신 다음 행동 1개 조회를 구현한다.
- [ ] 옵션 API 3개를 `createdAt DESC`로 구현한다.
- [ ] export xlsx를 구현한다.
- [ ] 다음 행동 로그 API 3개를 구현한다.
- [ ] 메모 로그 API 3개를 구현한다.
- [ ] observability event를 남긴다.
- [ ] API 테스트를 추가한다.
- [ ] lint/test/e2e 가능한 검증을 실행한다.

## 4. API 완료 목록

완료 시 아래 API가 모두 동작해야 한다.

- [ ] `GET /api/deals/stage-counts`
- [ ] `GET /api/deals`
- [ ] `GET /api/deals/:dealId`
- [ ] `POST /api/deals`
- [ ] `PATCH /api/deals/:dealId`
- [ ] `GET /api/deals/company-options`
- [ ] `GET /api/deals/contact-options`
- [ ] `GET /api/deals/product-options`
- [ ] `GET /api/deals/export/xlsx`
- [ ] `GET /api/deals/:dealId/following-action-logs`
- [ ] `POST /api/deals/:dealId/following-action-logs`
- [ ] `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- [ ] `GET /api/deals/:dealId/memo-logs`
- [ ] `POST /api/deals/:dealId/memo-logs`
- [ ] `PATCH /api/deals/:dealId/memo-logs/:memoLogId`

## 5. Acceptance Criteria

- 인증 없이는 401을 반환한다.
- 타 사용자 Deal/FK/Log 접근은 404를 반환한다.
- 목록 응답은 nested company/contact/latestFollowingAction을 사용한다.
- 목록 응답에는 product가 없다.
- 상세 응답은 nested product를 포함한다.
- 생성 API는 Deal과 최초 다음 행동 로그를 함께 만든다.
- 최초 다음 행동 로그의 `checkComplete`은 false다.
- `expectedEndDate`는 `YYYY-MM-DD`만 허용한다.
- option API 3개는 `createdAt DESC`다.
- following action log와 memo log 목록은 `createdAt DESC`다.
- export에는 id, 제품, 최근수정일이 없다.

## 6. 완료 기록

작업 완료 후 TODO_LOG에 아래를 남긴다.

- 구현한 API 목록
- migration 이름
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
