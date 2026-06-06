# Backend First Goal 작업 순서

## 1. 목적

이 문서는 Backend를 먼저 실제 API 서버로 완성하기 위한 `/goal` 실행 순서다.

기존 `MVP-STARTER_PLAN`은 FE/BE/Admin/E2E 전체를 포함한다. 이 계획은 Backend API 구현에 집중하기 위해 Backend 작업만 B00-B18로 재정렬한다.

## 2. 실행 원칙

- B00부터 B18까지 순서대로 진행한다.
- 한 번의 `/goal`에는 하나의 기반 작업 또는 하나의 도메인 vertical slice만 넣는다.
- DB 변경이 있는 goal은 Prisma migration과 validation을 포함한다.
- API가 있는 goal은 focused test를 포함한다.
- 외부 provider는 application port 뒤에 두고, 자동 테스트에서는 stub/mock adapter를 사용할 수 있게 한다.
- User API와 Admin API는 같은 controller에서 role branch로 처리하지 않는다.

## 3. 권장 `/goal` 문장 형식

```text
/goal BACKEND-FIRST_PLAN B04 Company Backend API를 구현한다.
범위는 Company domain/application/infrastructure/presentation, /api/companies CRUD, logs, soft delete/restore, 사용자 소유권 테스트까지다.
Contact/Product/Deal 구현은 제외한다.
```

## 4. B00. Backend 현 상태 기준선 확인

목적:

- 현재 Backend 골조가 AGENT 아키텍처와 어느 정도 맞는지 확인하고 B01 진입 기준을 고정한다.

포함 범위:

- `BE` typecheck
- `BE/prisma/schema.prisma` 현재 상태 확인
- `BE/.env.example` 확인
- Supabase setup 문서 확인
- 현재 구현된 module/shared 구조 확인

제외 범위:

- 코드 수정
- DB migration
- API 구현

완료 기준:

- 현재 Backend가 typecheck를 통과한다.
- B01에서 수정할 파일과 검증 명령이 명확하다.

## 5. B01. Prisma schema와 DB migration 기반

목적:

- `DB-SCHEMA.md`를 실제 Prisma schema로 반영하고, Backend가 도메인 DB를 사용할 수 있게 한다.

포함 범위:

- `BE/prisma/schema.prisma`에 MVP enum/model 반영
- Prisma relation/index/unique 제약 확인
- local Docker PostgreSQL 기준 migration 생성
- Prisma Client generate
- 기본 seed 준비: `DealActivityType` 시스템 타입
- `prisma validate`, `prisma generate`, typecheck

제외 범위:

- Auth/User API 구현
- 도메인 CRUD 구현
- Supabase Auth provider 설정

완료 기준:

- Prisma schema validation이 통과한다.
- local DB에 migration을 적용할 수 있다.
- generated Prisma Client로 typecheck가 통과한다.

## 6. B02. Backend 공통 기반 보강

목적:

- 도메인 API가 공통으로 사용할 transaction, error, guard, context, encryption/storage 기반을 만든다.

포함 범위:

- Prisma module/service 정리
- Prisma transaction manager adapter
- domain/application error base
- HTTP exception filter의 domain error mapping
- request context middleware 또는 current request context type
- current user decorator/context
- AuthGuard/AdminGuard 골격
- pagination DTO/type
- `EncryptionPort`와 test adapter
- `StoragePort` 현재 구현 점검과 file metadata helper
- structured logger wrapper 방향 정리

제외 범위:

- Supabase token exchange 실제 구현
- 도메인 CRUD
- 외부 OpenAI/Google/SMTP/WebPush 실제 adapter

완료 기준:

- application layer에서 transaction port를 주입받아 사용할 수 있다.
- controller는 current user context를 받을 수 있다.
- domain error가 표준 HTTP response로 변환된다.
- typecheck와 focused shared test가 통과한다.

## 7. B03. Auth/User Backend 기반

목적:

- Supabase Auth를 외부 provider로 사용하고 Backend App token/session 체계를 만든다.

포함 범위:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/users/me/settings`
- `PATCH /api/users/me/settings`
- `DELETE /api/users/me`
- `GET /admin/api/me`
- App access token issuer/verifier
- refresh token httpOnly cookie와 hash 저장
- `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession` 동기화
- `INITIAL_ADMIN_EMAILS` 기반 Admin 승격
- AuthGuard/AdminGuard 실제 적용

제외 범위:

- 회사/거래처/제품/딜 CRUD
- User Web 로그인 UI

완료 기준:

- Supabase access token을 Backend App token으로 교환할 수 있다.
- App Bearer token으로 `/api/me`에 접근할 수 있다.
- Admin은 `/admin/api/me`에 접근할 수 있고 일반 사용자는 차단된다.
- device slot conflict와 replace flow가 API 수준에서 동작한다.
- Auth/User focused test가 통과한다.

## 8. B04. Company Backend API

목적:

- 회사 CRUD와 회사 로그를 첫 도메인 vertical slice로 구현한다.

포함 범위:

- Company domain entity/value/error
- Company repository port
- Prisma Company repository/mapper
- Company use cases
- `GET /api/companies`
- `POST /api/companies`
- `GET /api/companies/:companyId`
- `PATCH /api/companies/:companyId`
- `DELETE /api/companies/:companyId`
- `POST /api/companies/:companyId/restore`
- CompanyLog list/create/update/delete
- user ownership, soft delete, restore, 410/409 error policy

제외 범위:

- Contact/Product/Deal
- Admin company API
- Memo/Tag

완료 기준:

- 사용자별 회사 데이터가 분리된다.
- 삭제된 회사 상세 조회는 410, 삭제된 회사 수정은 409를 반환한다.
- focused integration test가 통과한다.

## 9. B05. Contact Backend API

목적:

- 거래처(담당자) CRUD와 ContactLog를 구현한다.

포함 범위:

- Contact domain/application/infrastructure/presentation
- 회사 연결 ownership 검증
- 회사 없이 저장 허용
- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/contacts/:contactId`
- `PATCH /api/contacts/:contactId`
- `DELETE /api/contacts/:contactId`
- `POST /api/contacts/:contactId/restore`
- ContactLog list/create/update/delete

제외 범위:

- 명함 OCR
- Admin contact API
- Memo/Tag

완료 기준:

- 거래처는 사용자별로 분리된다.
- 다른 사용자의 회사에 거래처를 연결할 수 없다.
- focused integration test가 통과한다.

## 10. B06. Product Backend API

목적:

- 제품 CRUD, 제품 로그, 제품 연결을 구현한다.

포함 범위:

- Product domain/application/infrastructure/presentation
- ProductLog list/create/update/delete
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:productId`
- `PATCH /api/products/:productId`
- `DELETE /api/products/:productId`
- `POST /api/products/:productId/restore`
- `POST /api/products/:productId/connections`
- `DELETE /api/products/:productId/connections/:connectionId`
- target ownership 검증

제외 범위:

- Deal 생성 시 제품 자동 연결
- Admin product API
- Memo/Tag

완료 기준:

- 제품은 회사/거래처/딜 target에 연결될 수 있다.
- targetType/targetId는 application layer에서 검증된다.
- focused integration test가 통과한다.

## 11. B07. Tag Backend API

목적:

- 주요 엔티티에 태그를 연결할 수 있게 하고 append-only TagLog 정책을 구현한다.

포함 범위:

- Tag CRUD
- TagAssignment create/delete
- TagLog append-only 기록
- `GET /api/tags`
- `POST /api/tags`
- `PATCH /api/tags/:tagId`
- `DELETE /api/tags/:tagId`
- `POST /api/tags/:tagId/assignments`
- `DELETE /api/tags/:tagId/assignments/:assignmentId`
- `GET /api/tags/logs`

제외 범위:

- FE tag UI
- Admin tag 관리

완료 기준:

- Tag/TagAssignment은 hard delete된다.
- 모든 변경은 TagLog에 snapshot과 함께 남는다.
- focused integration test가 통과한다.

## 12. B08. PersonalMemo Backend API

목적:

- 회사/거래처/제품/딜 Memo 기록을 암호화 저장하는 API를 구현한다.

포함 범위:

- `PersonalMemo` domain/application/infrastructure/presentation
- target ownership 검증
- `EncryptionPort` 적용
- `GET /api/memos`
- `POST /api/memos`
- `PATCH /api/memos/:memoId`
- `DELETE /api/memos/:memoId`
- soft delete/restore 정책 준비

제외 범위:

- Admin raw memo view
- FE Memo UI

완료 기준:

- DB에는 memo 원문 평문이 저장되지 않는다.
- 목록/상세 response는 필요한 경우 복호화된 값을 사용자 본인에게만 반환한다.
- 다른 사용자 target에 Memo를 만들 수 없다.

## 13. B09. Deal Backend API

목적:

- 딜 CRUD, 단계 변경, 다음 행동, 활동 로그를 구현해 핵심 영업 루프를 만든다.

포함 범위:

- Deal domain/application/infrastructure/presentation
- DealActivityType seed 사용
- DealActivity CRUD
- `GET /api/deals`
- `POST /api/deals`
- `GET /api/deals/:dealId`
- `PATCH /api/deals/:dealId`
- `PATCH /api/deals/:dealId/stage`
- `PATCH /api/deals/:dealId/next-action`
- `POST /api/deals/:dealId/next-action/complete`
- `POST /api/deals/:dealId/next-action/snooze`
- `DELETE /api/deals/:dealId`
- `POST /api/deals/:dealId/restore`
- `GET/POST/PATCH/DELETE /api/deals/:dealId/activities`
- stage change와 DealActivity 생성 transaction

제외 범위:

- Schedule/MeetingNote 연결
- Admin deal API

완료 기준:

- 딜 금액은 필수다.
- 단계 변경은 같은 transaction에서 자동 활동 로그를 생성한다.
- 다음 행동 상태가 목록과 상세에서 조회된다.
- focused integration test가 통과한다.

## 14. B10. Schedule Backend API

목적:

- 일정 CRUD, 알림, 월간/주간 조회, Google Calendar import 기반을 구현한다.

포함 범위:

- Schedule/ScheduleReminder domain/API
- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:scheduleId`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- `POST /api/schedules/:scheduleId/restore`
- `GET /api/schedules/week`
- `POST /api/schedules/week/export`
- Google Calendar port
- `POST /api/schedules/google/connect`
- `POST /api/schedules/google/import`

제외 범위:

- 실제 Export 파일 생성 세부 구현
- FE calendar UI

완료 기준:

- 기간 query가 없으면 이번 달 범위를 기본 적용한다.
- 일정은 딜 없이 저장 가능하다.
- Google Calendar adapter는 port 뒤에 있다.

## 15. B11. MeetingNote Backend API

목적:

- AI 회의록 생성, 저장, 딜 연결을 구현한다.

포함 범위:

- MeetingNote domain/API
- OpenAI meeting note port/adapter
- raw text encryption
- `GET /api/meeting-notes`
- `POST /api/meeting-notes/generate`
- `POST /api/meeting-notes`
- `GET /api/meeting-notes/:meetingNoteId`
- `PATCH /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes/:meetingNoteId/link-deal`
- `DELETE /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes/:meetingNoteId/restore`
- link-deal과 DealActivity 생성 transaction

제외 범위:

- MeetingNote Admin raw view
- FE meeting UI

완료 기준:

- 회의록은 딜 없이 저장 가능하다.
- raw input은 암호화 저장된다.
- 딜 연결 시 같은 transaction에서 활동 로그가 생성된다.

## 16. B12. BusinessCard Backend API

목적:

- 명함 이미지 업로드, OCR, 사용자 확정 저장을 구현한다.

포함 범위:

- BusinessCardScan domain/API
- file validation
- StoragePort 기반 이미지 저장
- OCR/OpenAI port/adapter
- `POST /api/business-cards/scan`
- `GET /api/business-cards/:scanId`
- `POST /api/business-cards/:scanId/confirm`
- confirm 시 Company/Contact 생성 transaction

제외 범위:

- FE 업로드 UI
- OCR 결과 자동 저장

완료 기준:

- OCR 결과는 자동으로 회사/거래처가 되지 않는다.
- 사용자가 confirm해야 도메인 데이터가 생성된다.
- 파일 public URL은 DB에 저장하지 않는다.

## 17. B13. Import Backend API

목적:

- Excel/CSV Import preview, AI mapping, validation, confirm transaction을 구현한다.

포함 범위:

- ImportJob/ImportJobRow domain/API
- file upload/storage
- parser port
- OpenAI import mapping port
- `POST /api/imports`
- `POST /api/imports/:importJobId/map`
- `PATCH /api/imports/:importJobId/mapping`
- `POST /api/imports/:importJobId/confirm`
- `GET /api/imports/:importJobId`
- all-or-nothing transaction

제외 범위:

- 일정/회의록 Import
- FE preview table

완료 기준:

- preview validation error가 있으면 confirm을 막는다.
- confirm 중 row 실패가 있으면 도메인 데이터 전체가 rollback된다.
- 실패 row number와 reason이 남는다.

## 18. B14. Export Backend API

목적:

- Export job 생성, 파일 생성, 다운로드를 구현한다.

포함 범위:

- ExportJob domain/API
- PDF/Excel generator port
- StoragePort 기반 생성 파일 저장
- `POST /api/exports`
- `GET /api/exports/:exportJobId`
- `GET /api/exports/:exportJobId/download`
- sensitive data include warning accepted 검증

제외 범위:

- 결제/구독 export
- FE download UI

완료 기준:

- 민감 데이터는 기본 제외다.
- 민감 데이터 포함 export는 경고 확인 없이는 실패한다.
- 다운로드는 Backend가 stream 또는 signed URL을 생성해 반환한다.

## 19. B15. Notification Backend API

목적:

- 인앱 알림, email, browser push 기반을 구현한다.

포함 범위:

- Notification domain/API
- EmailDeliveryPort와 SMTP adapter
- BrowserPushPort와 Web Push VAPID adapter
- BrowserPushSubscription encryption
- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `PATCH /api/notifications/settings`
- `GET /api/notifications/browser-push/public-key`
- `POST /api/notifications/browser-subscriptions`
- `DELETE /api/notifications/browser-subscriptions/:subscriptionId`

제외 범위:

- FE service worker 등록
- 운영용 job scheduler 고도화

완료 기준:

- email/browser push는 실제 adapter를 가진다.
- 자동 테스트에서는 stub adapter로 실행할 수 있다.
- push subscription secret은 암호화 저장된다.

## 20. B16. Trash와 Search Backend API

목적:

- soft deleted resource 복구와 통합검색을 구현한다.

포함 범위:

- `GET /api/trash`
- `POST /api/trash/:targetType/:targetId/restore`
- `DELETE /api/trash/:targetType/:targetId/permanent`
- permanent delete blocked response
- `GET /api/search`
- 삭제 데이터 제외
- 검색어 2자 이상
- type별 최대 5개
- 민감 원문 비노출

제외 범위:

- 시스템 자동 완전 삭제 worker 고도화
- full-text search/index 고도화

완료 기준:

- 휴지통 목록에서 soft delete 대상과 permanentDeleteAt을 볼 수 있다.
- 사용자 즉시 완전 삭제는 MVP 1차에서 차단된다.
- 통합검색은 사용자 소유 데이터만 반환한다.

## 21. B17. Admin/Audit Backend API

목적:

- Admin 전체 조회, masking, 민감 원문 조회, AuditLog를 구현한다.

포함 범위:

- `GET /admin/api/dashboard`
- `GET /admin/api/users`
- `GET /admin/api/users/:userId`
- `PATCH /admin/api/users/:userId/status`
- `GET /admin/api/companies`
- `GET /admin/api/contacts`
- `GET /admin/api/products`
- `GET /admin/api/deals`
- `GET /admin/api/users/:userId/companies`
- `GET /admin/api/users/:userId/contacts`
- `GET /admin/api/users/:userId/products`
- `GET /admin/api/users/:userId/deals`
- `POST /admin/api/sensitive/raw`
- `POST /admin/api/deals/:dealId/sensitive/raw`
- `POST /admin/api/meeting-notes/:meetingNoteId/sensitive/raw`
- `GET /admin/api/audit-logs`
- `GET /admin/api/audit-logs/:auditLogId`
- masking response mapper
- raw view reason validation
- raw view와 AuditLog 생성 transaction

제외 범위:

- Admin Web table UI
- 결제 Admin

완료 기준:

- Admin API는 AuthGuard와 AdminGuard를 모두 통과해야 한다.
- 기본 목록/상세는 민감 데이터를 마스킹한다.
- 원문 조회는 사유 없이는 실패한다.
- 원문 조회와 AuditLog 생성은 같은 transaction이다.

## 22. B18. Backend 위험 흐름 테스트와 릴리즈 준비

목적:

- Backend의 데이터 유출, 감사 누락, irreversible action 위험을 테스트로 잠근다.

포함 범위:

- user ownership isolation tests
- AdminGuard tests
- deal stage change activity transaction tests
- meeting note link activity transaction tests
- sensitive raw view audit transaction tests
- import confirm rollback tests
- trash restore tests
- provider stub wiring tests
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run build`

제외 범위:

- User Web/Admin Web Playwright E2E
- production deployment

완료 기준:

- Backend 핵심 위험 흐름 테스트가 통과한다.
- 외부 provider 없이 테스트가 안정적으로 실행된다.
- Backend build가 통과한다.

