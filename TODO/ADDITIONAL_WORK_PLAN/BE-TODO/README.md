# Additional Work BE TODO

## 1. 목적

이 폴더는 추가 유지보수 계획 중 Backend 구현 작업을 goal 단위로 관리한다.

## 2. 현재 goal

- `[완료] G01-BE-COMPANY-LIST-CONTACT-COUNT.goal.md`
- `[완료] G02-BE-COMPANY-CONTACT-LIST.goal.md`
- `[완료] G03-BE-COMPANY-EXPORT-XLSX.goal.md`
- `[완료] G04-BE-CONTACT-EXPORT-XLSX.goal.md`
- `[완료] G05-BE-PRODUCT-EXPORT-XLSX.goal.md`
- `[대기] G06-BE-COMPANY-LIST-DEAL-COUNT.goal.md`
- `[대기] G07-BE-COMPANY-EXPORT-DEAL-COUNT.goal.md`
- `[대기] G08-BE-COMPANY-DEAL-LIST.goal.md`
- `[대기] G09-BE-CONTACT-DEAL-LIST.goal.md`
- `[대기] G10-BE-PRODUCT-LIST-DEAL-COUNT-SORT.goal.md`
- `[대기] G11-BE-PRODUCT-EXPORT-DEAL-COUNT.goal.md`
- `[대기] G12-BE-PRODUCT-DEAL-LIST.goal.md`

## 2.1. 현재 Backend 상태

- 추가 Backend API 5개는 구현 완료 상태다.
- 회사/거래처/제품의 연결 딜 count와 연결 딜 목록 API는 G06-G12로 구현 대기 상태다.
- 검증 결과는 `TODO_LOG/2026-06-12/ADDITIONAL_WORK_PLAN_BACKEND/WORK_LOG.md`를 기준으로 확인한다.
- G06-G12 구현 후 `FE-TODO`와 각 도메인 FE goal에서 화면/API client에 반영한다.

## 3. 규칙

- 구현 전 `COMMON/API-SPEC` 계약을 확인한다.
- 구현 후 관련 기존 API 계약 문서를 함께 갱신한다.
- 검증 결과와 남은 리스크는 `TODO_LOG`에 기록한다.
