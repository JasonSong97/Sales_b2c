# /goal G02-FE-DEAL-PAGES

## 1. Goal

User Web 딜 페이지를 새 Backend Deal API 계약에 맞게 구현한다.

## 2. 선행 조건

- `G01-BE-DEAL-DOMAIN`이 완료되어야 한다.
- 최소한 local Backend에서 `/api/deals/stage-counts`, `/api/deals`, `/api/deals/:dealId`가 응답해야 한다.

## 3. 먼저 읽을 문서

- `TODO/DEAL_DOMAIN_PLAN/README.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/USER-FLOW.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G02-FE-DEAL-PAGES.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 4. 작업 체크리스트

- [ ] 기존 Deal feature에서 stale API field 사용 위치를 찾는다.
- [ ] 새 Deal DTO type을 정의한다.
- [ ] Deal API client 함수를 작성한다.
- [ ] TanStack Query key와 hook을 작성한다.
- [ ] 단계별 개수 UI를 API와 연결한다.
- [ ] 목록 조회를 검색/상태 필터/정렬/페이지와 연결한다.
- [ ] split view 상세 조회를 연결한다.
- [ ] 생성 form을 구현하고 회사/거래처/제품 옵션을 연결한다.
- [ ] 수정 form을 구현한다.
- [ ] 다음 행동 로그 목록/생성/수정을 연결한다.
- [ ] 메모 로그 목록/생성/수정을 연결한다.
- [ ] xlsx export 버튼을 연결한다.
- [ ] loading/empty/error/pending 상태를 정리한다.
- [ ] desktop/mobile 레이아웃을 확인한다.
- [ ] lint/build를 실행한다.

## 5. Acceptance Criteria

- 딜 목록 페이지 진입 시 단계별 개수와 목록이 조회된다.
- 검색은 딜 이름에만 적용된다.
- 상태 필터는 DealStatus enum code를 보낸다.
- 정렬은 `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc` 중 하나를 보낸다.
- 목록 item에서 회사와 거래처는 nested object에서 표시한다.
- 목록 item에는 제품이 없다.
- 상세에는 제품이 있다.
- 딜 생성 시 `followingAction`을 함께 보낸다.
- 다음 행동 생성 body는 `followingAction`만 보낸다.
- export는 blob으로 다운로드되고 page를 보내지 않는다.

## 6. 완료 기록

작업 완료 후 TODO_LOG에 아래를 남긴다.

- 수정한 화면과 hook 목록
- 제거한 stale contract field
- 실행한 검증 명령과 결과
- 수동 확인한 화면 경로
