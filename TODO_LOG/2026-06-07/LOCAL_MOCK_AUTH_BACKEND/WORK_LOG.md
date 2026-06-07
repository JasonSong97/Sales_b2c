# Local Mock Auth Backend 보강 작업 로그

## 상태

- 완료

## 작업 일자

- 2026-06-07

## 관련 계획과 작업

- 로컬 사이트 확인 중 Backend API 인증 오류 해결
- MVP starter local mock login과 Backend 인증 연결 보강

## 관련 AGENT/TODO 문서

- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `README.md`

## 예정 범위

- User Web/Admin Web mock login token이 local Backend API에서만 통과되도록 한다.
- local demo user/admin과 auth session을 seed한다.
- production/test에서 mock token이 허용되지 않도록 제한한다.
- 로컬 서버에서 health와 주요 인증 API를 확인한다.

## 진행 기록

- User Web/Admin Web은 이미 Vite dev server로 실행 중임을 확인했다.
- Backend API가 `mock-user-web-access-token`을 JWT로 검증하며 401을 반환하는 원인을 확인했다.
- `NODE_ENV=local`일 때만 mock token을 App token payload로 해석하는 분기를 추가했다.
- Prisma seed에 local user/admin, auth device, auth session을 추가했다.
- README local mock login 설명에 Backend local mock token 조건을 추가했다.

## 적용 범위 또는 변경 파일

- `BE/src/modules/auth/infrastructure/security/jose-app-token-issuer.adapter.ts`
- `BE/prisma/seed.ts`
- `README.md`
- `TODO_LOG/2026-06-07/LOCAL_MOCK_AUTH_BACKEND/WORK_LOG.md`

## 검증 결과

- `NODE_ENV=local ... pnpm run prisma:seed` 통과
- Backend watch 재컴파일 통과
- `curl -H 'Authorization: Bearer mock-user-web-access-token' http://localhost:3000/api/me` 통과
- `curl -H 'Authorization: Bearer mock-user-web-access-token' http://localhost:3000/api/companies` 통과
- `curl -H 'Authorization: Bearer mock-admin-web-access-token' http://localhost:3000/admin/api/me` 통과
- `curl -H 'Authorization: Bearer mock-admin-web-access-token' http://localhost:3000/admin/api/dashboard` 통과
- `curl -H 'Authorization: Bearer mock-non-admin-web-access-token' http://localhost:3000/admin/api/dashboard` 403 통과
- `cd BE && pnpm run typecheck` 통과
- `cd BE && pnpm run lint` 통과
- `cd BE && pnpm test -- resolve-current-user jose-app-token-issuer app.module` 통과
- `cd BE && pnpm test` 통과
- `cd BE && pnpm run build` 통과
- Backend/User Web/Admin Web 포트 응답 확인 통과

## 검토 결과

- mock token 허용은 `NODE_ENV=local` 조건으로 제한했다.
- local demo user/admin은 seed로 생성되며 production seed 실행에서는 건너뛴다.
- Admin mock token은 ADMIN 사용자로, non-admin mock token은 USER 사용자로 분리했다.
- README에 local mock login의 Backend 조건을 명시했다.

## 남은 리스크 또는 보류 사항

- 현재 실행 셸은 Node.js v22.21.1이라 `pnpm`이 Node 24 engine warning을 출력했다. 명령은 모두 통과했지만 README 기준 권장은 Node.js 24 LTS다.
- 실제 Supabase provider login과 refresh cookie E2E는 다음 단계 작업으로 남아 있다.
- OpenAI/OCR, Google Calendar, SMTP, Web Push, Supabase Storage 실 Provider smoke는 아직 local mock 범위 밖이다.

## 다음 권장 작업

- 브라우저에서 User Web/Admin Web을 새로고침하고 mock login으로 주요 화면을 확인한다.
- 다음 단계 계획에서 Supabase Auth provider callback과 token exchange E2E를 구현한다.
