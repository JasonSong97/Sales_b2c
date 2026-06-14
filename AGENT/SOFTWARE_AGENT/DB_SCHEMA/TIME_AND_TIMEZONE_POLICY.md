# Time And Timezone Policy

## 1. 목적

이 문서는 Backend DB schema, API 계약, Frontend 표시에서 시간과 timezone을 어떻게 다룰지 정의한다.

이 프로젝트의 DB 저장 기준 시간대는 `Asia/Seoul`이다.

UTC와 한국시간은 같은 값이 아니다. 이 문서에서 정하는 것은 "UTC를 한국시간으로 간주한다"가 아니라, DB에 저장되는 업무/시스템 시각 값을 항상 한국시간(KST, UTC+09:00) 기준으로 만든다는 정책이다.

## 2. 기본 원칙

- DB에 저장하는 date-time 값은 한국시간(KST, `Asia/Seoul`) 기준으로 저장한다.
- `createdAt`, `updatedAt`, `deletedAt`, `expiresAt`, `revokedAt`, `lastLoginAt`처럼 시스템이 생성하거나 상태 변경 시점으로 쓰는 컬럼도 한국시간 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 입력한 날짜/시간을 한국시간 기준으로 해석하고, DB에도 한국시간 값으로 저장한다.
- 사용자 화면 표시는 기본적으로 한국시간 기준으로 표시한다.
- 날짜만 필요한 값은 시간 컬럼을 쓰지 않고 Prisma `DateTime @db.Date`로 저장한다.
- Backend API 응답에서 date-time 값은 한국시간임을 알 수 있게 ISO 8601 offset string을 기본으로 한다. 예: `2026-06-14T12:10:00.000+09:00`
- 날짜 전용 값은 `YYYY-MM-DD` string으로 응답한다.

## 3. Prisma 작성 기준

새로운 Prisma schema를 작성할 때 시간 컬럼은 아래 기준을 따른다.

| 용도 | Prisma 기준 | 저장 의미 |
|---|---|---|
| 생성/수정/삭제/만료 시각 | `DateTime @db.Timestamp(3)` 권장 | 한국시간 기준 wall-clock date-time |
| 일정 시작/종료 시각 | `DateTime @db.Timestamp(3)` 권장 | 사용자가 선택한 한국시간 date-time |
| 날짜만 필요한 값 | `DateTime @db.Date` | timezone 없는 날짜 |

기본 시스템 컬럼 예:

```prisma
createdAt DateTime @default(now()) @db.Timestamp(3)
updatedAt DateTime @updatedAt @db.Timestamp(3)
```

일정 컬럼 예:

```prisma
startAt DateTime @db.Timestamp(3)
endAt   DateTime @db.Timestamp(3)
```

날짜만 필요한 컬럼 예:

```prisma
expectedEndDate DateTime @db.Date
```

주의:

- 기존 migration의 여러 `DateTime` 컬럼은 PostgreSQL `TIMESTAMP(3)`로 생성되어 있다. 이 정책 이후 해당 컬럼들은 프로젝트 기준상 한국시간 값으로 취급한다.
- 기존 적용 migration 파일은 수정하지 않는다.
- `@db.Timestamptz(3)`는 DB가 instant를 timezone 기준으로 정규화/표시하므로, "DB 값 자체를 한국시간으로 저장한다"는 요구에는 기본 선택지가 아니다.
- 기존 UTC 저장값이 섞여 있을 가능성이 있는 컬럼을 KST 기준으로 전환하려면 별도 migration 계획과 데이터 보정 기준을 먼저 문서화한다.
- `@default(now())`, `@updatedAt`, Backend에서 직접 넣는 `new Date()` 값이 실제로 KST로 저장되는지 구현 단계에서 검증한다. 불명확하면 공통 KST clock/parser helper 또는 DB default expression을 사용한다.

## 4. Backend 처리 기준

- Backend는 클라이언트에서 받은 일정 날짜/시간을 한국시간 기준으로 해석한다.
- 일정 생성/수정 API는 `startAt`, `endAt`을 한국시간 입력값으로 보고 DB에도 한국시간 값으로 저장한다.
- Backend 응답에서 시스템 시각과 일정 시각은 한국시간 offset이 포함된 문자열을 기본으로 한다. `toISOString()`은 UTC `Z` 문자열을 만들기 때문에 KST 응답 포맷에 그대로 쓰지 않는다.
- 날짜 전용 값은 `YYYY-MM-DD`로 변환해 응답한다.
- API 계약 문서에는 시간 필드마다 `KST date-time`, `날짜 전용` 중 무엇인지 적는다.
- 검색/필터에서 `from`, `to`, `weekStart` 같은 기간 값이 들어오면 한국시간 기준 포함/제외 범위를 명시한다.

## 5. Frontend 표시 기준

- Frontend는 Backend에서 받은 date-time 값을 한국시간 기준으로 표시한다.
- 일정 화면은 월간/주간 범위를 계산할 때 한국시간 기준으로 계산한다.
- 일정 생성/수정 form은 사용자가 선택한 날짜와 24시간제 시간을 한국시간 값으로 Backend에 보낸다. 예: `2026-06-20T23:15:00+09:00`
- 날짜 전용 값은 timezone 변환 없이 `YYYY-MM-DD` 기준으로 표시한다.

## 6. 금지

- `createdAt`, `updatedAt` 같은 시스템 시각을 UTC 기준으로 저장하지 않는다.
- `startAt`, `endAt` 같은 일정 시각을 UTC로 변환해 DB에 저장하지 않는다.
- KST 값을 API 응답으로 내릴 때 `Z` suffix를 붙여 UTC처럼 보이게 만들지 않는다.
- `toISOString()` 결과를 한국시간 응답 문자열처럼 사용하지 않는다.
- 날짜만 필요한 필드에 임의의 `00:00:00` 시간을 붙여 instant처럼 저장하지 않는다.
- 일정 `startAt`, `endAt`을 브라우저/서버 로컬 timezone에 암묵적으로 의존해 저장하지 않는다. 기준은 항상 `Asia/Seoul`이다.
- API 계약 없이 시간 필드의 request/response 형식을 FE와 BE가 각자 해석하지 않는다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
