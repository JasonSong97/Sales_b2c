# Backend Observability Convention

## 1. 목적

이 문서는 Backend가 운영 중 문제를 추적할 수 있도록 로그, 감사 로그, request context, error context를 어떻게 남길지 정의한다.

초기 단계에서는 별도 APM이나 복잡한 metrics 체계를 필수로 하지 않는다. 대신 모든 기능이 구조화 로그와 감사 로그 기준을 지키도록 해서, 나중에 tracing과 metrics를 붙일 수 있는 형태를 유지한다.

## 2. 범위

관측성은 아래 네 가지를 구분한다.

- application log: 시스템 동작과 오류를 추적하기 위한 구조화 로그
- audit log: 관리자 행동, 민감정보 접근, 데이터 변경 사유를 추적하기 위한 비즈니스 기록
- request context: 하나의 HTTP 요청을 묶는 request id, user id, route, method
- provider context: 외부 Provider 호출의 성공, 실패, latency, retry 여부

테스트 작성은 이 문서의 필수 범위가 아니다.

## 3. Structured Log 원칙

Backend log는 JSON line 형식의 structured log를 사용한다.

필수 필드:

| 필드 | 설명 |
|---|---|
| `timestamp` | ISO timestamp |
| `service` | 서비스 이름 |
| `level` | `log`, `warn`, `error`, `debug`, `verbose` |
| `event` 또는 `message` | 짧은 이벤트 키 또는 메시지 |
| `context` | 모듈, use case, adapter 같은 실행 위치 |
| `requestId` | HTTP 요청 단위 추적 ID. 없으면 생성한다. |

권장 context:

- `userId`
- `adminUserId`
- `route`
- `method`
- `statusCode`
- `durationMs`
- `provider`
- `errorCode`

민감정보는 context에 원문으로 남기지 않는다.

## 4. Event Naming

로그 event key는 짧은 영어 dot notation으로 작성한다.

예:

```text
auth.exchange.succeeded
auth.refresh.failed
company.created
company.privateMemo.readDenied
admin.sensitiveRawView.requested
provider.supabase.jwtVerifyFailed
```

규칙:

- 과거형 또는 결과가 드러나는 이름을 사용한다.
- 같은 이벤트는 같은 이름을 재사용한다.
- 사용자 입력값을 event key에 넣지 않는다.
- 한국어 설명은 주석과 문서에 쓰고, 로그 event key는 영어로 유지한다.

## 5. Logging 위치

허용:

- exception filter
- guard에서 인증/권한 실패 요약
- infrastructure adapter에서 외부 Provider 실패
- application use case에서 중요한 비즈니스 이벤트 요약
- bootstrap 또는 module 초기화 실패

금지:

- domain layer logging
- controller에 흩어진 임의 logging
- `console.log`
- 멀티라인 구분선, ASCII box 로그
- 개인정보, token, password, 민감 메모 원문 logging

## 6. Audit Log 기준

audit log는 application log와 다르다. audit log는 사용자의 행동 이력 또는 관리자 접근 이력으로 DB에 남아야 하는 비즈니스 데이터다.

audit log가 필요한 흐름:

- Admin이 사용자 또는 회사 데이터를 변경한다.
- Admin이 기본 masking을 우회해 민감정보 원문을 조회한다.
- soft delete, restore, hard delete가 수행된다.
- 권한이 큰 설정값이나 정책값이 변경된다.
- 외부 Provider 연동 상태가 사용자 데이터에 영향을 준다.

audit log 필수 필드:

- actor user id
- actor role
- action
- target type
- target id
- reason 또는 reason required 여부
- request id
- created at

민감정보 원문은 audit log에도 저장하지 않는다. 필요한 경우 redacted summary만 저장한다.

## 7. Request Context

모든 HTTP 요청은 request id를 가져야 한다.

규칙:

- incoming `x-request-id`가 있으면 신뢰 가능한 범위에서 이어받는다.
- 없으면 서버에서 생성한다.
- response header에 `x-request-id`를 반환한다.
- exception filter와 logger wrapper는 request id를 포함할 수 있어야 한다.
- TODO/API 명세에는 observability가 필요한 API의 request context 사용 여부를 적는다.

## 8. Error Observability

error logging은 사용자에게 보이는 에러 응답과 운영자가 보는 진단 정보를 분리한다.

규칙:

- client response에는 domain error code와 안전한 message만 반환한다.
- stack trace는 production client response에 포함하지 않는다.
- exception filter는 unknown error를 structured log로 남긴다.
- domain error는 필요 이상으로 error level log를 남기지 않는다.
- provider adapter는 provider error를 내부 error로 변환하면서 provider, status, retry 가능 여부를 context에 남긴다.

## 9. Metrics와 Tracing

초기 단계에서 별도 metrics/tracing 시스템은 필수가 아니다.

다만 새 기능의 TODO/API 명세에는 아래 중 필요한 항목을 적는다.

- latency를 봐야 하는 외부 Provider 호출 여부
- 실패율을 봐야 하는 배치/import 작업 여부
- 사용량을 봐야 하는 Admin 기능 여부
- request id로 추적해야 하는 사용자 신고 가능 흐름 여부

나중에 APM을 붙일 때 event key, request id, provider context를 그대로 metric/trace attribute로 옮길 수 있어야 한다.

## 10. TODO와 API 명세 작성 규칙

API가 mutation, Admin 기능, 민감정보, 외부 Provider, batch/import를 포함하면 `COMMON/API-SPEC/*`와 `BE-TODO`에 아래 항목을 반드시 적는다.

- application log event key
- audit log 필요 여부
- audit log action, target, reason 필요 여부
- request id 사용 여부
- 외부 Provider 호출 logging 위치
- PII redaction 기준
- 실패 시 남길 error code와 안전한 context

단순 조회 API라도 Admin cross-user 조회이거나 민감정보 masking이 관련되면 observability 항목을 생략하지 않는다.

## 11. 금지 사항

- 개인정보 원문을 log context에 넣지 않는다.
- token, refresh token, authorization header를 logging하지 않는다.
- 민감 메모, meeting note body, deal amount를 평문 logging하지 않는다.
- audit log가 필요한 행동을 application log만으로 대체하지 않는다.
- request id 없이 외부 Provider 실패를 남기지 않는다.
- `console.log`로 임시 로그를 남긴 채 커밋하지 않는다.

## 12. Review Checklist

- API 명세에 observability 항목이 있는가?
- mutation 또는 Admin API에 audit log 필요 여부가 적혀 있는가?
- 민감정보가 redaction 대상인지 명시됐는가?
- 외부 Provider 실패 로그의 event key와 context가 정의됐는가?
- request id가 exception filter와 logger에서 이어질 수 있는가?
- application log와 audit log를 혼동하지 않았는가?

## 13. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
