# 활성 TODO Backend API / Frontend 작업 재검토

## 1. 목적

이 문서는 `TODO/DONE`을 제외한 활성 TODO 계획을 기준으로 Backend API 구현 상태와 Frontend 남은 작업 목적을 재검토한 결과를 남긴다.

Frontend 작업자는 이 문서를 먼저 보고 어떤 API가 준비되어 있는지, 각 화면에서 어떤 사용자 행동을 우선 구현해야 하는지 확인한다.

## 2. 검토 기준

- 검토일: 2026-06-12
- 검토 대상: `TODO/DONE/**`을 제외한 `TODO` 활성 계획
- Backend 구현 대조 기준: `BE/src/modules/auth`, `BE/src/modules/user`, `BE/src/modules/company`, `BE/src/modules/contact`, `BE/src/modules/product`, `BE/prisma/schema.prisma`
- API 명세 기준: 각 활성 계획의 `COMMON/API-SPEC/*`
- 문서 기준: `AGENT/AGENT_USAGE_RULES.md`, `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`

## 3. 결론

- Auth/User, Company, Contact, Product 기본 Backend API는 구현되어 있다.
- 추가 유지보수 범위인 Company `contactCount`, 회사 연결 Contact 전체 목록, Company/Contact/Product xlsx export API도 구현되어 있다.
- 활성 TODO의 API 명세는 request 형태, response 형태, 내부 비즈니스 로직, DB 연결, transaction, observability, 에러, FE/BE 처리 기준을 포함한다.
- 남은 주요 작업은 `FE/user-web`과 `FE/admin-web`의 실제 API 연동, 화면 상태 관리, 검색/필터/페이지네이션/다운로드 UI 구현이다.

## 4. 활성 계획별 Backend API 상태

| 계획 | Backend API 상태 | 구현 근거 | API 명세 상태 | 남은 주요 작업 |
|---|---|---|---|---|
| `AUTH_FE_INTEGRATION_PLAN` | 완료 | `BE/src/modules/auth`, `BE/src/modules/user` | `AUTH_USER_API_DETAIL.md`에 request/response/비즈니스 로직 작성됨 | User/Admin Web 실제 인증 연동, 설정 화면 |
| `COMPANY_DOMAIN_PLAN` | 완료 | `BE/src/modules/company` | `COMPANY_API.md`, `COMPANY_API_DETAIL.md` 기준 `implemented` | 회사 목록/생성/상세/메모 화면, `contactCount`, 연결 Contact 목록, xlsx export 표시 |
| `CONTACT_DOMAIN_PLAN` | 완료 | `BE/src/modules/contact` | `CONTACT_API.md`, `CONTACT_API_DETAIL.md` 기준 `implemented` | 거래처 목록/생성/상세/메모 화면, xlsx export 표시 |
| `PRODUCT_DOMAIN_PLAN` | 완료 | `BE/src/modules/product` | `PRODUCT_API.md`, `PRODUCT_API_DETAIL.md` 기준 `implemented` | 제품 목록/생성/상세/메모 화면, xlsx export 표시 |
| `ADDITIONAL_WORK_PLAN` | 완료 | Company/Contact/Product export와 회사 보조 API 구현 완료 | 추가 API 5개 모두 `implemented` | 기존 도메인 FE 작업에 반영 |

## 5. Backend API 구성 확인

### Auth/User

구현 API:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /admin/api/me`
- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`

Frontend 목적:

- mock-only 인증을 Supabase Auth와 Backend token exchange 흐름으로 교체한다.
- User Web은 `/api/me`, Admin Web은 `/admin/api/me`로 route guard를 판단한다.
- 설정 화면에서 개인 정보 조회/이름 수정/등록 기기 조회를 제공한다.

### Company

구현 API:

- `GET /api/companies`
- `GET /api/companies/export/xlsx`
- `GET /api/companies/:companyId/contacts`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `GET /api/company-fields`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `GET /api/company-regions`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `POST /api/companies/:companyId/memo-logs`
- `GET /api/companies/:companyId/memo-logs`
- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
- `POST /api/companies/:companyId/private-memo-logs`
- `GET /api/companies/:companyId/private-memo-logs`
- `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`

Frontend 목적:

- 회사 목록에서 회사명 검색, 회사 분야/지역 필터, 20개 단위 페이지네이션을 제공한다.
- 목록 item의 `contactCount`를 `거래처 수`로 표시한다.
- 회사 단건 화면에서 기본 정보와 메모를 보여주고, 보조 영역에 `GET /api/companies/:companyId/contacts` 결과를 표시한다.
- 회사 목록 내보내기 버튼은 현재 검색어와 필터를 `GET /api/companies/export/xlsx`에 전달하되 `page`는 제거한다.

### Contact

구현 API:

- `GET /api/contacts`
- `GET /api/contacts/export/xlsx`
- `GET /api/contacts/company-options`
- `GET /api/contacts/:contactId`
- `POST /api/contacts`
- `PATCH /api/contacts/:contactId`
- `GET /api/contact-job-grades`
- `POST /api/contact-job-grades`
- `DELETE /api/contact-job-grades/:jobGradeId`
- `GET /api/contact-departments`
- `POST /api/contact-departments`
- `DELETE /api/contact-departments/:departmentId`
- `POST /api/contacts/:contactId/memo-logs`
- `GET /api/contacts/:contactId/memo-logs`
- `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`
- `POST /api/contacts/:contactId/private-memo-logs`
- `GET /api/contacts/:contactId/private-memo-logs`
- `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`

Frontend 목적:

- 거래처 목록에서 이름 검색, 회사/부서/직급 필터, 20개 단위 페이지네이션을 제공한다.
- 거래처 생성은 회사 선택을 필수로 하고, `contactMemo`는 초기 일반 메모 로그 입력이라는 의미로 표시한다.
- 거래처 상세/수정, 일반 메모 로그, 개인 비밀 메모 로그를 API 계약에 맞게 구현한다.
- 거래처 목록 내보내기 버튼은 현재 검색어와 필터를 `GET /api/contacts/export/xlsx`에 전달하되 `page`는 제거한다.

### Product

구현 API:

- `GET /api/products`
- `GET /api/products/export/xlsx`
- `GET /api/products/:productId`
- `POST /api/products`
- `PATCH /api/products/:productId`
- `GET /api/product-categories`
- `POST /api/product-categories`
- `DELETE /api/product-categories/:categoryId`
- `GET /api/product-statuses`
- `POST /api/product-statuses`
- `DELETE /api/product-statuses/:statusId`
- `POST /api/products/:productId/memo-logs`
- `GET /api/products/:productId/memo-logs`
- `PATCH /api/products/:productId/memo-logs/:memoLogId`
- `POST /api/products/:productId/private-memo-logs`
- `GET /api/products/:productId/private-memo-logs`
- `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId`

Frontend 목적:

- 제품 목록에서 제품명 검색, 카테고리/상태 필터, 20개 단위 페이지네이션을 제공한다.
- 목록에는 제품명, 카테고리, 상태, 등록일만 표시하고 가격과 최근수정일은 표시하지 않는다.
- 제품 생성/상세/수정, 일반 메모 로그, 개인 비밀 메모 로그를 API 계약에 맞게 구현한다.
- 제품 목록 내보내기 버튼은 현재 검색어와 필터를 `GET /api/products/export/xlsx`에 전달하되 `page`는 제거한다.

## 6. API 명세 완성도 점검

| API 명세 범위 | Request 형태 | Response 형태 | 내부 비즈니스 로직 | 판정 |
|---|---|---|---|---|
| Auth/User | path/query/header/body 구분 있음 | DTO 이름, status, body, 필드 설명 있음 | 인증, device, session, role 흐름 있음 | 통과 |
| Company | 검색/필터/페이지/본문 요청 구분 있음 | 목록/상세/옵션/메모/export 응답 설명 있음 | ownership, option 검증, memo transaction, export 흐름 있음 | 통과 |
| Contact | 검색/필터/페이지/본문 요청 구분 있음 | 목록/상세/옵션/메모/export 응답 설명 있음 | 회사 필수, ownership, option 검증, memo transaction, export 흐름 있음 | 통과 |
| Product | 검색/필터/페이지/본문 요청 구분 있음 | 목록/상세/옵션/메모/export 응답 설명 있음 | ownership, option 검증, memo transaction, export 흐름 있음 | 통과 |
| Additional Work | 추가 API 5개 request/response 작성됨 | `contactCount`, 연결 Contact 목록, xlsx binary 응답 설명 있음 | 검색/필터 반영, page 제외, ownership, 정렬, 파일 컬럼 기준 있음 | 통과 |

## 7. Frontend 우선 작업

1. Auth 연동을 먼저 처리한다.
2. User Web API client가 Backend App access token, refresh-on-401, blob 다운로드를 처리할 수 있게 한다.
3. Company 화면을 구현하면서 목록 검색/필터/페이지네이션, `contactCount`, 연결 Contact 목록, 회사 xlsx export를 함께 반영한다.
4. Contact 화면을 구현하면서 목록 검색/필터/페이지네이션, 옵션 관리, 메모, 거래처 xlsx export를 반영한다.
5. Product 화면을 구현하면서 목록 검색/필터/페이지네이션, 옵션 관리, 메모, 제품 xlsx export를 반영한다.

## 8. 주의사항

- Export API는 JSON이 아니라 xlsx binary 응답이다.
- Export API에는 현재 목록의 검색어와 필터만 전달하고 `page`는 전달하지 않는다.
- Company 목록의 `totalCount`는 회사 개수다. `contactCount`는 각 회사 item의 연결 거래처 수다.
- 회사 단건 응답 자체는 변경하지 않는다. 연결 Contact 목록은 별도 API로 조회한다.
- `TODO/DONE`은 완료 이력 보관 공간이므로 현재 남은 작업 판정에 포함하지 않는다.

## 9. 관련 문서

- `TODO/README.md`
- `TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/API-SPEC/AUTH_USER_API_DETAIL.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `TODO/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_CONTACT_COUNT_API.md`
- `TODO/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_CONTACT_LIST_API.md`
- `TODO/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_XLSX_API.md`
- `TODO/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_EXPORT_XLSX_API.md`
- `TODO/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_XLSX_API.md`
