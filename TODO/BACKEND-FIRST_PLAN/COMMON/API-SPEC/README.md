# Backend First API Spec 참조

## 1. 원칙

이 계획은 API 계약을 새로 정의하지 않는다.

상세 API 계약은 아래 문서를 정본으로 본다.

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`

## 2. 구현 규칙

Backend goal을 실행할 때는 해당 goal의 endpoint contract를 먼저 읽는다.

필수 확인 항목:

- method/path
- request DTO 이름과 validation
- response DTO 이름과 필드
- 사용자 소유권 검증
- transaction 필요 여부
- soft delete error 정책
- Admin masking/raw view/audit 여부
- 연결 DB model

## 3. 새 API가 필요한 경우

기존 API 계약에 없는 API가 필요하면 바로 구현하지 않는다.

1. 필요한 이유를 현재 goal 결과에 기록한다.
2. `MVP-STARTER_PLAN/COMMON/API-SPEC` 또는 이 계획의 API-SPEC에 계약을 먼저 추가한다.
3. `PLANNING-REVIEW.md`를 갱신한다.
4. 그 다음 별도 `/goal`로 구현한다.

