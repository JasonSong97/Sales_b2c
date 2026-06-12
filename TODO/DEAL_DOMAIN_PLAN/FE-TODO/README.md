# Deal FE TODO

## 1. 작업 순서

1. `COMMON/USER-FLOW.md`를 읽는다.
2. `COMMON/API-SPEC/DEAL_API.md`와 `DEAL_API_DETAIL.md`를 읽는다.
3. `G02-FE-DEAL-PAGES.goal.md`를 따라 User Web 딜 화면을 구현한다.
4. 완료 후 TODO_LOG에 검증 결과를 남긴다.

## 2. 현재 상태

- 상태: pending
- 기존 User Web 딜 UI: stale contract 가능성 있음
- Backend Deal API: G01 완료 전까지 없음

## 3. 주의사항

- User Web은 `/api/*`만 호출한다.
- 목록에는 제품을 표시하지 않는다.
- 상세에는 제품을 표시한다.
- export 요청에는 page를 보내지 않는다.
- 기존 mock field를 새 API field로 교체한다.
