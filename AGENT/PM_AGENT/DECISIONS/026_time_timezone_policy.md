# 시간/타임존 저장 기준 결정

## 1. 결정

시간과 timezone이 관련된 DB/API/Frontend 구현은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

핵심 기준:

- DB에 저장하는 date-time 값은 한국시간(KST, `Asia/Seoul`) 기준으로 저장한다.
- `createdAt`, `updatedAt` 같은 시스템 시각도 한국시간 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 선택한 날짜/시간을 한국시간 기준으로 해석하고 DB에도 한국시간 값으로 저장한다.
- 사용자 화면 표시는 한국시간 기준으로 표시한다.
- 날짜만 필요한 값은 Prisma `DateTime @db.Date`를 사용한다.

## 2. 이유

일정 도메인은 사용자 현지 시간과 DB 저장 시각이 섞이기 쉽다.

이 프로젝트는 국내 사용자와 국내 영업 일정을 1차 기준으로 한다. 따라서 DB 조회값, 운영 확인값, 화면 표시값의 기준을 모두 한국시간으로 맞춘다.

이 결정의 핵심은 다음 혼선을 줄이는 것이다.

- DB에서 직접 확인한 `createdAt`, `updatedAt`, 일정 시간이 화면의 한국시간과 다르게 보이는 문제
- 일정 월간/주간 조회 범위가 한국시간 날짜 경계와 어긋나는 문제
- Admin Web, User Web, export 결과가 서로 다른 기준으로 표시되는 문제
- 일정 생성/수정에서 `23:15` 같은 24시간제 입력값이 UTC 변환으로 전날/다음날처럼 보이는 문제

## 3. 적용 범위

- Prisma schema와 migration 설계
- Backend DTO, application service, repository mapping
- API 계약 문서의 request/response 시간 필드
- User Web 일정/딜/메모/목록 표시
- Admin Web 운영 조회/감사 로그 표시
- Export 파일의 시간 표시 기준

## 4. 구현 규칙

- API 계약 문서에는 시간 필드마다 `KST date-time`, `날짜 전용` 중 하나를 명시한다.
- Backend 응답의 date-time은 한국시간 offset이 포함된 문자열을 기본으로 한다. 예: `2026-06-14T12:10:00.000+09:00`
- 일정 생성/수정 API는 사용자의 입력 날짜/시간을 한국시간으로 해석한다.
- Frontend는 일정과 시스템 시각을 한국시간 기준으로 표시한다.
- 날짜 전용 값은 timezone 변환 없이 `YYYY-MM-DD`로 다룬다.
- 기존 적용 migration은 직접 수정하지 않는다. 기존 `TIMESTAMP(3)` 컬럼을 바꿔야 하면 별도 migration 계획을 먼저 만든다.
- UTC와 한국시간은 같은 값이 아니므로, KST 값을 `Z` suffix가 붙은 UTC 문자열처럼 표현하지 않는다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
