# P0 G00-G04 구현 기반 상세 명세

## 1. 목적

P0는 실제 도메인 기능 구현 전에 Backend, User Web, Admin Web, DB 기반을 준비하는 단계다.

이 단계의 목표는 앱을 실행할 수 있는 최소 구조, 공통 인증 흐름을 붙일 준비, Prisma schema 반영 기반을 만드는 것이다.

## G00. 구현 전 운영 결정 정리

### 목적

스캐폴딩 전에 반복 질문이 발생하지 않도록 개발 운영 기본값을 확정한다.

### 산출 문서

- `AGENT/PM_AGENT/DECISIONS`의 운영 결정 문서
- `.env.example` 변수 목록 초안
- package manager와 Node 버전 기준
- local DB 실행 방식
- 인증 1차 구현 전략

### 화면 명세

화면 구현 없음.

단, G02와 G03에서 사용할 login placeholder는 다음 전제를 따른다.

- User Web: `/login`, `/`
- Admin Web: `/login`, `/`
- 실제 OAuth 버튼은 G05 이후 활성화한다.

### API 연결

- 직접 구현 API 없음
- G01에서 `GET /api/health`를 구현할 준비를 한다.

### DB 연결

- Prisma schema 적용 전 결정 단계
- 관련 모델 후보: User, UserOAuthAccount, UserSetting

### 완료 기준

- G01-G05 작업자가 다시 기술 선택을 묻지 않아도 된다.
- 결정이 문서에 남아 있다.
- 미확정 항목은 G00의 보류 항목으로만 남기고 후속 goal에 암묵적으로 넘기지 않는다.

## G01. Backend 프로젝트 스캐폴딩

### 목적

`BE`에 NestJS 서버의 최소 실행 기반을 만든다.

### 화면 명세

화면 없음.

### API 명세

- `GET /api/health`
- 상세 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`

### Backend 구현 범위

- NestJS bootstrap
- ConfigModule
- global ValidationPipe
- global exception filter
- structured logger wrapper
- request context middleware
- health controller
- Prisma 설치 준비

### DB 연결

- Prisma client 설치 준비
- migration은 G04에서 수행

### 상태/에러 기준

- validation error response 형식이 고정되어야 한다.
- 예상하지 못한 예외도 공통 error shape로 내려와야 한다.

### 완료 기준

- `BE` 서버가 local에서 실행된다.
- `GET /api/health`가 `status = ok`를 반환한다.
- typecheck 또는 lint가 통과한다.

## G02. User Web 프로젝트 스캐폴딩

### 목적

`FE/user-web`에 사용자 앱의 최소 실행 기반을 만든다.

### 화면 명세

#### `/login`

- 목적: 사용자가 로그인 화면에 진입했을 때 서비스 진입점을 확인한다.
- 주요 UI: 서비스명, 소셜 로그인 placeholder 버튼, disabled 상태 설명 문구
- 상태:
  - loading: provider 목록을 불러오는 중
  - empty: provider가 비활성화된 경우
  - error: provider API 실패
  - success: provider 버튼 표시

#### `/`

- 목적: 로그인 후 홈 shell placeholder를 표시한다.
- 주요 UI: 상단/하단 navigation placeholder, 딜 파이프라인 placeholder
- 인증 연동 전에는 mock user 또는 local guard로 접근을 허용할 수 있다.

### API 연결

- G02에서는 실제 API 연동 대신 API client 뼈대만 만든다.
- G05 이후 `GET /api/me`, `GET /api/auth/providers`를 연결한다.

### 상태/validation

- route guard는 인증 미구현 상태에서 TODO 주석 없이 명확한 mock mode로 분리한다.
- API base URL은 환경 변수에서 읽는다.

### 완료 기준

- User Web dev server가 실행된다.
- `/login`과 `/`가 렌더링된다.
- Tailwind, shadcn/ui, Router, TanStack Query provider가 연결된다.

## G03. Admin Web 프로젝트 스캐폴딩

### 목적

`FE/admin-web`에 Admin 운영 콘솔의 최소 실행 기반을 만든다.

### 화면 명세

#### `/login`

- 목적: Admin 사용자가 운영 콘솔 로그인 진입점을 확인한다.
- 주요 UI: Admin 타이틀, 로그인 placeholder, 권한 필요 안내
- 상태: loading, error, success placeholder

#### `/`

- 목적: 운영 콘솔 shell을 데스크톱 기준으로 표시한다.
- 주요 UI: 좌측 navigation, 상단 header, content placeholder
- 기본 breakpoint: 데스크톱 중심. 모바일 최적화는 MVP Admin 범위가 아니다.

### API 연결

- G03에서는 `adminApiClient` 뼈대만 만든다.
- G05 이후 `GET /admin/api/me`를 연결한다.

### 상태/validation

- Admin route guard는 `role = ADMIN` 전제를 가진다.
- non-admin 접근 차단 UI는 G31/G35에서 구체화한다.

### 완료 기준

- Admin Web dev server가 실행된다.
- Admin shell이 데스크톱 레이아웃으로 보인다.
- TanStack Table을 설치하고 사용할 준비가 되어 있다.

## G04. Prisma schema 1차 반영과 DB 연결

### 목적

MVP 핵심 도메인을 담을 수 있는 DB schema와 Prisma client 기반을 만든다.

### 화면 명세

화면 없음.

### DB 명세

- 구현 기준: `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- 핵심 모델: User, Company, Contact, Product, Deal, DealActivity, Schedule, MeetingNote, Tag, AuditLog, ImportJob, ExportJob, Notification, AiJob

### API 연결

- 직접 도메인 API 구현은 제외
- G01 health API에서 DB 연결 확인을 선택적으로 붙일 수 있다.

### seed 기준

- DealActivityType 시스템 기본값
- ProductConnectionType UI 라벨 기준

### 완료 기준

- Prisma schema validate가 통과한다.
- migration 또는 db push가 local 기준으로 성공한다.
- seed 실행이 가능하다.

## 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
