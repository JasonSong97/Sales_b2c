# Deal BE TODO

## 1. 작업 순서

1. `COMMON/API-SPEC/DEAL_API.md`와 `DEAL_API_DETAIL.md`를 읽는다.
2. `BE-TODO/DB-SCHEMA.md`를 기준으로 Prisma schema를 설계한다.
3. `G01-BE-DEAL-DOMAIN.goal.md`를 따라 구현한다.
4. 테스트와 migration 결과를 확인한다.
5. 완료 후 TODO_LOG에 작업 이력과 검증 결과를 남긴다.

## 2. 현재 상태

- 상태: completed
- Backend Deal 모듈: 구현 완료
- Prisma Deal 모델: 구현 완료
- API 계약: implemented

## 3. 주의사항

- DB enum을 만들지 않는다.
- DealStatus는 코드 enum으로 관리한다.
- `expectedEndDate`는 date-only string 계약을 지킨다.
- Deal 생성, DealProduct 생성, 최초 다음 행동 로그 생성은 transaction으로 묶는다.
- Deal 수정에서 `productIds`가 전달되면 DealProduct 연결을 transaction 안에서 교체한다.
- Deal 생성/수정 시 contact가 company에 속하는지 확인한다.
- export에는 id, 제품, 최근수정일을 넣지 않는다.
