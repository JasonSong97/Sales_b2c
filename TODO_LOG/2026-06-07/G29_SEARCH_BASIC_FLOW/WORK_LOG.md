# G29 통합검색 기본 흐름

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`

## 요구사항 체크
- `GET /api/search`를 구현한다.
- Company, Contact, Product, Deal, Schedule, MeetingNote를 검색한다.
- 검색어는 trim 후 2자 이상부터 실행한다.
- type별 최대 5개를 기본 반환한다.
- 삭제 데이터는 기본 검색에서 제외한다.
- entity type별 group 결과를 반환한다.
- 진행 중 딜과 최근 항목을 우선 표시한다.
- Memo 원문, `MeetingNote.rawText`, Admin 민감 원문을 title/subtitle에 노출하지 않는다.
- User Web 상단 통합검색 UI와 모바일 전체 화면 검색 시트를 구현한다.
- 결과 선택 시 상세 화면으로 이동한다.

## 제외 범위
- 전문 검색 엔진
- 검색 랭킹 고도화

## 작업 로그
- G29 기준 문서와 Search endpoint 계약을 확인했다.
- 기존 통합검색 모듈이 없음을 확인했다.
- Schedule은 현재 상세 라우트가 없으므로 검색 결과 선택 시 `/schedules`로 이동하도록 처리한다.
- Backend `SearchModule`을 추가하고 `AppModule`에 연결했다.
- `GET /api/search?q=&types=&limit=` endpoint를 구현했다.
- Company, Contact, Product, Deal, Schedule, MeetingNote 검색 repository를 추가했다.
- 검색어 trim 후 2자 미만은 `SearchQueryRequired`로 차단하고 400으로 매핑했다.
- `types` 필터와 type별 기본 limit 5개를 지원했다.
- 딜 검색은 진행 중 단계(`INITIAL_CONTACT`, `IN_DISCUSSION`)를 성사/실패 딜보다 우선 반환하도록 분리 조회했다.
- 삭제된 데이터는 모든 검색 대상에서 제외했다.
- MeetingNote 검색/응답은 `rawTextCiphertext`를 조회하지 않고, title/subtitle에는 회사명/거래처명/제품명/단계/일자만 사용했다.
- User Web `features/search`를 추가하고 AppShell 상단에 통합검색을 연결했다.
- 데스크톱 드롭다운 검색 결과와 모바일 전체 화면 검색 시트를 구현했다.
- 검색 결과 선택 시 `targetPath`로 이동하도록 연결했다.

## 검토
- 검색 결과 응답은 title, subtitle, targetId, targetPath만 포함하며 Memo 원문과 MeetingNote raw text를 노출하지 않는다.
- Schedule 상세 라우트가 아직 없어 일정 결과는 `/schedules`로 이동한다.
- 모바일 시트가 상단 sticky bar 안에 갇히는 문제가 있어 AppShell의 `backdrop-blur`를 제거하고 불투명 상단 바로 조정했다.
- 모바일 입력 중 숨겨진 데스크톱 드롭다운 DOM이 중복 생성되는 문제가 있어 데스크톱/모바일 입력 상태 처리를 분리했다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm run build`
- `cd BE && pnpm run test -- search`
- `cd BE && pnpm run test`
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- Playwright mock smoke: desktop dropdown 검색, 모바일 전체 화면 시트 검색, 결과 선택 이동 확인
- 스크린샷: `/tmp/g29-search-desktop.png`, `/tmp/g29-search-mobile.png`
