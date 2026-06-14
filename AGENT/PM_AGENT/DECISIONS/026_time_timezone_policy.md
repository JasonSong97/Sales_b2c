# 시간/타임존 저장 기준 결정

## 1. 결정

시간과 timezone이 관련된 DB/API/Frontend 구현은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

핵심 기준:

- `createdAt`, `updatedAt` 같은 시스템 시각은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 입력한 timezone을 고려하되 DB에는 UTC instant로 저장한다.
- 사용자 화면 표시는 Frontend에서 `Asia/Seoul` 또는 사용자 timezone으로 변환한다.
- 날짜만 필요한 값은 Prisma `DateTime @db.Date`를 사용한다.

## 2. 이유

일정 도메인은 사용자 현지 시간과 DB 저장 시각이 섞이기 쉽다.

DB에 KST 문자열이나 서버 로컬 시간을 직접 저장하면 다음 문제가 생긴다.

- 서버 timezone 변경 시 같은 코드가 다른 시각을 저장한다.
- 일정 월간/주간 조회 범위가 사용자 timezone과 어긋난다.
- Admin Web, User Web, export 결과가 서로 다른 기준으로 표시될 수 있다.
- 나중에 모바일 앱이나 다른 timezone 사용자를 지원할 때 migration 비용이 커진다.

따라서 DB는 UTC instant를 저장하고, 화면에서만 표시 timezone으로 변환한다.

## 3. 적용 범위

- Prisma schema와 migration 설계
- Backend DTO, application service, repository mapping
- API 계약 문서의 request/response 시간 필드
- User Web 일정/딜/메모/목록 표시
- Admin Web 운영 조회/감사 로그 표시
- Export 파일의 시간 표시 기준

## 4. 구현 규칙

- API 계약 문서에는 시간 필드마다 `UTC instant`, `사용자 timezone 입력`, `날짜 전용` 중 하나를 명시한다.
- Backend 응답의 instant는 ISO 8601 UTC string을 기본으로 한다.
- 일정 생성/수정 API는 사용자의 입력 timezone을 명시적으로 해석한다.
- Frontend는 UTC ISO string을 그대로 출력하지 않고 표시 timezone으로 변환한다.
- 날짜 전용 값은 timezone 변환 없이 `YYYY-MM-DD`로 다룬다.
- 기존 적용 migration은 직접 수정하지 않는다. 기존 `TIMESTAMP(3)` 컬럼을 바꿔야 하면 별도 migration 계획을 먼저 만든다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
