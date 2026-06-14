# Time And Timezone Policy

## 1. 목적

이 문서는 Backend DB schema, API 계약, Frontend 표시에서 시간과 timezone을 어떻게 다룰지 정의한다.

일정 도메인처럼 사용자의 현지 시간이 중요한 기능을 구현할 때도 DB에는 같은 기준으로 저장하고, 화면 표시 단계에서만 사용자 timezone으로 변환한다.

## 2. 기본 원칙

- DB에 저장하는 실제 시각 instant는 UTC 기준이다.
- `createdAt`, `updatedAt`, `deletedAt`, `expiresAt`, `revokedAt`, `lastLoginAt`처럼 시스템이 생성하거나 상태 변경 시점으로 쓰는 컬럼은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 입력한 timezone을 해석한 뒤 DB에는 UTC instant로 저장한다.
- 사용자의 화면 표시는 User Web 또는 Admin Web에서 `Asia/Seoul` 또는 사용자 timezone으로 변환한다.
- 날짜만 필요한 값은 시간 컬럼을 쓰지 않고 Prisma `DateTime @db.Date`로 저장한다.
- Backend API 응답에서 instant는 ISO 8601 UTC string을 기본으로 한다. 예: `2026-06-14T03:10:00.000Z`
- 날짜 전용 값은 `YYYY-MM-DD` string으로 응답한다.

## 3. Prisma 작성 기준

새로운 Prisma schema를 작성할 때 시간 컬럼은 아래 기준을 따른다.

| 용도 | Prisma 기준 | 저장 의미 |
|---|---|---|
| 생성/수정/삭제/만료 시각 | `DateTime` 또는 `DateTime @db.Timestamptz(3)` | UTC instant |
| 일정 시작/종료 시각 | `DateTime @db.Timestamptz(3)` 권장 | 사용자가 입력한 timezone을 UTC instant로 변환한 값 |
| 날짜만 필요한 값 | `DateTime @db.Date` | timezone 없는 날짜 |

기본 시스템 컬럼 예:

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

일정처럼 사용자 timezone 입력이 핵심인 컬럼 예:

```prisma
startAt DateTime @db.Timestamptz(3)
endAt   DateTime @db.Timestamptz(3)
```

날짜만 필요한 컬럼 예:

```prisma
expectedEndDate DateTime @db.Date
```

주의:

- 현재 기존 migration의 여러 `DateTime` 컬럼은 PostgreSQL `TIMESTAMP(3)`로 생성되어 있다. 이 값도 애플리케이션 기준으로 UTC instant로 취급한다.
- 기존 적용 migration 파일은 수정하지 않는다.
- 기존 `TIMESTAMP(3)` 컬럼을 `TIMESTAMPTZ`로 바꾸려면 별도 migration 계획과 데이터 해석 기준을 먼저 문서화한다.
- DB/session timezone에 기대어 KST를 저장하지 않는다.

## 4. Backend 처리 기준

- Backend는 클라이언트에서 받은 timezone 포함 시각 또는 timezone 파라미터를 명확히 해석한 뒤 UTC `Date`로 변환해 저장한다.
- 일정 생성/수정 API는 사용자가 입력한 현지 시각과 timezone을 함께 해석해야 한다.
- Backend 응답에서 시스템 시각과 일정 시각은 `toISOString()` 기준의 UTC ISO string을 기본으로 한다.
- 날짜 전용 값은 `YYYY-MM-DD`로 변환해 응답한다.
- API 계약 문서에는 시간 필드마다 `UTC instant`, `사용자 timezone 입력`, `날짜 전용` 중 무엇인지 적는다.
- 검색/필터에서 `from`, `to`, `weekStart` 같은 기간 값이 들어오면 timezone 기준 포함/제외 범위를 명시한다.

## 5. Frontend 표시 기준

- Frontend는 Backend에서 받은 UTC ISO string을 그대로 화면에 노출하지 않고 표시 timezone으로 변환한다.
- 기본 표시 timezone은 사용자 설정이 없으면 `Asia/Seoul` 또는 브라우저 timezone을 사용한다.
- 일정 화면은 월간/주간 범위를 계산할 때 사용자의 timezone을 기준으로 한다.
- 일정 생성/수정 form은 사용자가 입력한 현지 시각을 Backend가 해석할 수 있도록 ISO string 또는 timezone 정보를 API 계약에 맞게 보낸다.
- 날짜 전용 값은 timezone 변환 없이 `YYYY-MM-DD` 기준으로 표시한다.

## 6. 금지

- `createdAt`, `updatedAt` 같은 시스템 시각을 KST 문자열로 DB에 저장하지 않는다.
- DB 컬럼만 보고 KST라고 가정하지 않는다.
- 날짜만 필요한 필드에 임의의 `00:00:00` 시간을 붙여 instant처럼 저장하지 않는다.
- 일정 `startAt`, `endAt`을 timezone 해석 없이 브라우저/서버 로컬 시간에 의존해 저장하지 않는다.
- API 계약 없이 시간 필드의 request/response 형식을 FE와 BE가 각자 해석하지 않는다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
