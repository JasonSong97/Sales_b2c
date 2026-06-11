# DB Schema

## 1. 목적

이 폴더는 Backend 데이터베이스 구조의 소프트웨어 정본을 관리한다.

현재 기준 소스는 `BE/prisma/schema.prisma`이며, 이 폴더의 문서는 구현자와 기획자가 테이블 역할, 관계, 컬럼 의미를 빠르게 확인하기 위한 주석 포함 설명서다.

## 2. 현재 문서

- `AUTH_USER_SCHEMA.md`: 현재 Backend에 남아 있는 Auth/User DB 구조
- `COMPANY_SCHEMA.md`: 회사 도메인 기본 기능에 필요한 Company DB 구조
- `CONTACT_SCHEMA.md`: 거래처 도메인 기본 기능에 필요한 Contact DB 구조
- `PRODUCT_SCHEMA.md`: 제품 도메인 기본 기능에 필요한 Product 구현 예정 DB 구조. 아직 Prisma schema와 migration에는 반영되지 않았다.

## 3. 현재 DB 범위

현재 Backend DB는 `BE/prisma/schema.prisma`와 migration 기준으로 Auth/User 도메인, Company 기본 도메인, Contact 기본 도메인을 포함한다.

포함:

- `User`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`
- `Company`
- `CompanyField`
- `CompanyRegion`
- `CompanyMemoLog`
- `CompanyUserPrivateMemoLog`
- `Contact`
- `ContactJobGrade`
- `ContactDepartment`
- `ContactMemoLog`
- `ContactUserPrivateMemoLog`

현재 반영된 migration:

- `BE/prisma/migrations/20260611000000_add_company_domain/migration.sql`
- `BE/prisma/migrations/20260611010000_add_contact_domain/migration.sql`

첫 migration에는 Auth/User 기본 테이블과 Company 기본 도메인 테이블이 함께 반영되어 있다. Contact migration에는 거래처, 거래처 직급/부서, 일반 메모 로그, 개인 비밀 메모 로그 테이블이 반영되어 있다.

현재 DB 기준을 완료한 Backend TODO:

- `TODO/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`

아직 포함하지 않음:

- `UserSetting`
- 계정 영구 삭제 예약 컬럼
- 계정 삭제 API용 별도 테이블
- Product 기본 도메인 예정 테이블: `Product`, `ProductCategory`, `ProductStatus`, `ProductMemoLog`, `ProductUserPrivateMemoLog`
- Deal, Schedule, MeetingNote 등 후속 영업 도메인 테이블
- Trash/휴지통 테이블
- Admin 감사/조회 도메인 테이블

회사 도메인의 테이블 역할, 관계, 인덱스 의도는 `COMPANY_SCHEMA.md`를 기준으로 확인한다.
거래처 도메인의 테이블 역할, 관계, 인덱스 의도는 `CONTACT_SCHEMA.md`를 기준으로 확인한다.
제품 도메인의 구현 예정 테이블 역할, 관계, 인덱스 의도는 `PRODUCT_SCHEMA.md`를 기준으로 확인한다. 실제 구현 전에는 `TODO/PRODUCT_DOMAIN_PLAN`의 API 계약과 함께 검토한다.

## 4. 관리 규칙

- 실제 Prisma schema를 수정하면 이 폴더의 문서도 함께 갱신한다.
- migration을 추가하거나 이미 적용된 DB 구조를 바꾸면 관련 schema 문서와 API 문서를 함께 갱신한다.
- 테이블/컬럼을 추가할 때는 역할, nullable 여부, 기본값, 관계, 인덱스 의도를 함께 기록한다.
- 주석은 실제 구현자가 DB만 보고도 의미를 이해할 수 있을 정도로 구체적으로 작성한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
