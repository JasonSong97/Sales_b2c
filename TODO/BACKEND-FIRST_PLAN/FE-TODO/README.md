# Backend First FE TODO

## 1. 이번 계획의 FE 범위

이번 계획은 Backend 우선 구현이다. 따라서 User Web과 Admin Web 화면 구현은 포함하지 않는다.

FE의 역할은 Backend API 계약의 소비자로서 다음을 확인하는 것이다.

- Backend response shape가 User Web/Admin Web 후속 구현에 충분한가
- error shape가 401, 403, 409, 410, validation error를 구분할 수 있는가
- auth refresh와 file upload/download가 후속 FE 구현에서 처리 가능한 형태인가
- Admin masking/raw view 흐름이 UI로 구현 가능한 API 구조인가

## 2. 후속 FE 작업

Backend API가 안정된 뒤 FE 작업은 기존 `MVP-STARTER_PLAN`의 FE goal 또는 별도 FE 계획에서 진행한다.

후속 작업 후보:

- User Web auth/protected route
- User Web company/contact/product/deal 화면
- User Web schedule/meeting/import/export/trash/search 화면
- Admin Web users/domain tables
- Admin Web masking/raw view/audit log 화면
- User/Admin Playwright E2E

## 3. 금지

- 이번 Backend First goal 안에서 User Web/Admin Web 화면을 함께 구현하지 않는다.
- Backend API 미완성 상태에서 FE mock 화면을 정본처럼 확정하지 않는다.
- FE가 `/admin/api/*`와 `/api/*` 경계를 흐리게 만들지 않는다.

