# Backend First 사용자 흐름 기준

## 1. 목적

이 문서는 Backend 우선 구현 시 반드시 보존해야 하는 사용자 흐름을 요약한다.

상세 흐름 정본은 `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`다. 이 문서는 Backend 구현자가 API와 DB 흐름을 잡을 때 우선순위를 빠르게 확인하기 위한 요약이다.

## 2. Backend 우선 핵심 흐름

### Flow 0. 로그인과 사용자 분리

- 사용자는 Supabase Auth provider로 로그인한다.
- Backend는 Supabase access token을 검증하고 local `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 동기화한다.
- business API는 Supabase token이 아니라 Backend App access token을 검증한다.
- 모든 사용자 데이터는 `userId`로 분리한다.

### Flow 1. 핵심 기준 데이터

- 사용자는 회사, 거래처(담당자), 제품을 등록한다.
- 회사/거래처/제품은 사용자별 CRUD, Log, Tag, Memo 기록, soft delete, restore를 지원한다.
- 거래처는 회사에 연결될 수 있지만 회사 없이도 예외 저장이 가능하다.

### Flow 2. 딜 중심 루프

- 사용자는 회사/거래처/제품을 연결해 딜을 만든다.
- 딜 금액은 필수다.
- 단계 변경은 `DealActivity`를 자동 생성한다.
- 다음 행동은 목록과 상세에서 1급 정보로 조회된다.

### Flow 3. 일정과 회의록

- 일정은 딜 없이도 저장 가능하다.
- 딜에서 만든 일정은 회사/거래처 정보를 기본 상속할 수 있다.
- 회의록은 딜 없이 저장 가능하고, 딜 연결 시 `DealActivity`를 자동 생성한다.

### Flow 4. 자동화와 파일

- 명함 OCR은 이미지 업로드 후 OCR 결과를 자동 저장하지 않고 사용자가 확정해야 회사/거래처로 저장한다.
- Import는 preview와 validation 후 사용자가 확정한다.
- Import 확정 실행은 all-or-nothing transaction이다.
- Export는 민감 데이터 기본 제외이며, 포함 시 명시적 경고 확인이 필요하다.

### Flow 5. Admin과 감사

- Admin API는 `/admin/api/*`만 사용한다.
- Admin 목록/상세는 민감 데이터를 기본 마스킹한다.
- 민감 원문 조회는 사유 입력과 `AuditLog` 생성을 같은 transaction으로 처리한다.

## 3. 완료 기준

Backend API는 위 흐름을 화면 없이도 검증할 수 있어야 한다.

- auth/session 테스트로 사용자 context가 생성된다.
- 도메인 API 테스트로 user ownership이 보장된다.
- stage change, meeting note link, import confirm, raw sensitive view는 transaction 테스트가 있다.

