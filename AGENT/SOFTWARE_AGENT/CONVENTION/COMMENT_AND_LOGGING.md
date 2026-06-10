# Comment And Logging Convention

## 1. Comment Principle

Comments explain WHY, not WHAT.

단, 이 프로젝트는 사용자 확정 규칙으로 모든 함수와 메소드에 기능 주석을 강제한다. 이 기능 주석은 아래 `Mandatory Function Comment` 규칙을 우선한다.

Default:

- no comment
- clear naming first
- smaller function/component first
- type/schema first

Use comments only when code cannot express the reason. 기능 주석은 예외로 항상 작성한다.

## 2. Mandatory Function Comment

모든 코드의 함수와 메소드에는 바로 위에 다음 형식의 1줄 주석을 단다.

```ts
// 기능 : 사용자 프로필을 조회합니다.
async execute() {
  // ...
}
```

필수 대상:

- Backend class method
- Backend function
- Frontend function
- React component function
- React hook function
- event handler function
- API client function
- test helper function

규칙:

- 문구는 반드시 `// 기능 : `으로 시작한다.
- 한 줄로 쓴다.
- 해당 함수/메소드가 담당하는 사용자 또는 시스템 기능을 한국어로 적는다.
- 단순히 함수명을 번역하지 말고, 호출자가 기대하는 역할을 적는다.
- 익명 inline callback이 복잡한 기능을 가지면 이름 있는 함수로 추출한 뒤 기능 주석을 단다.

좋은 예:

```ts
// 기능 : 등록된 기기 목록을 현재 세션 기준으로 조회합니다.
async listActiveDevices() {
  // ...
}

// 기능 : 로그인 만료 시 refresh 요청을 한 번만 수행합니다.
async refreshAccessToken() {
  // ...
}
```

부족한 예:

```ts
// 기능 : listActiveDevices 함수입니다.
async listActiveDevices() {
  // ...
}

// 기능 : 데이터를 처리합니다.
function handleSubmit() {
  // ...
}
```

## 3. When Comments Are Allowed

Allowed:

- business constraint
- legal/operational retention rule
- external provider oddity
- browser compatibility workaround
- performance tradeoff with measured or expected scale
- security/audit reason
- TODO/FIXME/HACK/NOTE/WARNING with context

Examples:

```text
// 거래처 삭제는 30일 soft delete 유지가 정책이다. 복구 요청 가능성이 높다.
// Google Calendar는 MVP에서 가져오기만 한다. 양방향 동기화는 의도적으로 제외했다.
// Admin raw view reason은 PII 가능성이 있어 client logger에 보내지 않는다.
```

## 4. Forbidden Comments

Forbidden:

- code translated into Korean, except the mandatory `// 기능 : ...` function comment
- JSX structure comments such as "header" or "body"
- parameter descriptions already obvious from TypeScript
- change history
- author/date
- commented-out code
- visual separators made of repeated symbols
- step comments like `// 1`, `// 2` inside straightforward code

If a step comment is needed, consider extracting a function.

## 5. JSDoc

Use JSDoc only for public APIs used across modules/features, and only when it adds rules or context.

Do not duplicate TypeScript types in JSDoc.

Useful JSDoc content:

- usage constraints
- permission assumptions
- external system behavior
- non-obvious serialization rules

## 6. Standard Comment Tags

Use these formats:

```text
TODO(#123): ...
TODO(2026-06-02): ...
FIXME(#123): ...
HACK: ...
NOTE: ...
WARNING: ...
```

Every tag needs a reason.

## 7. Backend Logging

Backend logs are structured JSON.

Rules:

- use pino or the project logger wrapper
- no `console.log`
- no ASCII boxes or multiline separators
- short English event key
- context object for details
- PII redacted
- request context injected automatically
- domain layer does not log
- exception filter logs domain errors

Good event shape:

```text
company.created
contact.duplicateDetected
deal.stageChanged
meetingNote.generated
admin.sensitiveRawView.requested
ocr.callFailed
```

Context examples:

```text
companyId
contactId
dealId
userId
targetUserId
provider
attempt
durationMs
err
```

Do not manually write `when`, `who`, `where`, route, or timestamp if middleware already injects them.

## 8. Frontend Logging

Frontend logs go through a logger wrapper.

Channels:

- Sentry for errors/warnings
- analytics for meaningful product events when introduced
- debug logger only in development

Rules:

- no direct `console.log`
- no PII in logs
- short English event key
- context object
- normal 401/403 flows are not noisy errors
- do not catch and silently ignore errors

## 9. Admin Logging Boundary

Admin has two separate concepts:

- client logs: browser/UI errors and non-sensitive events
- audit logs: backend records of Admin actions

Rules:

- client does not write audit logs directly
- backend writes audit log in the same transaction as the protected mutation
- reason text goes to backend audit flow only
- PII and reason text do not go to Sentry/client logs

## 10. Sensitive Data Redaction

Sensitive data includes:

- personal memo
- meeting note body
- deal amount
- user-marked sensitive data
- phone
- email
- token
- password
- business card image URL when private

Logs should use IDs or masked values.

## 11. Review Checklist

Comment checklist:

- every function/method has one `// 기능 : ...` comment
- no WHAT-only comments
- no commented-out code
- TODO/FIXME has issue number or date
- naming could not remove the comment
- security/audit comments include reason

Logging checklist:

- no direct console calls
- no PII plain text
- event key is short and searchable
- context is structured
- backend domain layer does not log
- Admin reason text is not in client logs



