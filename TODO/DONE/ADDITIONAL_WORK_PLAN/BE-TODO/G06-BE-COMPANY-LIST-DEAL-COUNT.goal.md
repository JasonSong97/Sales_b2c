# /goal G06 BE Company List Deal Count

## /goal 입력문

아래 문서를 먼저 읽고, 회사 목록 페이지네이션 API 응답에 회사별 딜 수 `dealCount`를 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_DEAL_COUNT_API.md`

## 목표

`GET /api/companies` 응답의 `items[]`에 `dealCount: number`를 추가한다.

## 구현 범위

- `BE/src/modules/company/application/ports/company.repository.ts`
- `BE/src/modules/company/application/services/company-application.service.ts`
- `BE/src/modules/company/infrastructure/persistence/prisma-company.repository.ts`
- 필요 시 Company 응답 타입 또는 mapper
- Company controller spec 또는 application service spec
- 관련 API 계약 문서 상태 갱신

## 비즈니스 규칙

- 기존 요청 query는 변경하지 않는다.
- `contactCount`가 이미 있으면 그대로 유지하고 `dealCount`만 추가한다.
- `totalCount`는 회사 전체 개수 기준을 유지한다.
- `dealCount`는 `Deal.companyId = Company.id`와 현재 사용자 `userId` 기준으로 계산한다.
- 다른 사용자의 딜 수가 섞이면 안 된다.
- 회사 목록 정렬, page size, 검색, 필터 동작은 변경하지 않는다.

## 구현 제한

- `GET /api/companies/:companyId` 단건 응답은 변경하지 않는다.
- 딜 목록 API는 이 goal에서 만들지 않는다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- N+1 count 쿼리를 만들지 않는다.

## 권장 구현 방향

Prisma relation `_count` 또는 `Deal` group by 집계를 우선 검토한다. 현재 repository mapper에서 회사 목록 item으로 변환할 때 `dealCount`를 함께 매핑한다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- 딜이 없는 회사는 `dealCount: 0`을 반환한다.
- 딜이 있는 회사는 실제 연결 수를 반환한다.
- `contactCount`와 `dealCount`가 함께 반환된다.
- 검색/필터 적용 시 `totalCount`는 회사 개수 기준으로 유지된다.
- 다른 사용자의 딜 수가 섞이지 않는다.

## 완료 보고

- 변경한 파일
- 응답 shape 변경 내용
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
