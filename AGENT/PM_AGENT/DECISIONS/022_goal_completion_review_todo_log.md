# Goal 완료 후 검토와 TODO_LOG 기록 결정

## 1. 결정

앞으로 특정 `/goal` 또는 명시적인 작업 단위가 끝나면 AI 작업자는 바로 다음 작업으로 넘어가기 전에 사용자에게 다음 질문을 한다.

```text
이번 작업에 대해 검토를 해드릴까요?
```

사용자가 검토를 요청하면 AI 작업자는 완료된 작업을 검토한다. 검토가 `통과` 또는 사용자가 수용한 `조건부 통과` 상태가 된 뒤에만 `TODO_LOG`에 작업 기록 문서를 작성한다.

## 2. 이유

작업이 끝난 직후 바로 다음 구현으로 넘어가면 다음 문제가 생긴다.

- 실제로 무엇이 적용됐는지 추적하기 어렵다.
- 검증 명령, 실패했던 명령, 남은 리스크가 대화 안에만 남고 문서화되지 않는다.
- 나중에 같은 작업을 이어받는 사람이 현재 상태와 다음 진입점을 다시 조사해야 한다.
- 완료 기준을 만족하지 못한 작업이 완료된 것처럼 축적될 수 있다.

따라서 작업 완료 후에는 검토 게이트를 두고, 검토를 통과한 작업만 `TODO_LOG`에 날짜별로 기록한다.

## 3. 적용 범위

이 규칙은 다음에 적용한다.

- `/goal`로 실행한 작업
- 사용자가 명시한 하나의 구현 작업
- 문서 계획 작성 작업
- Backend, User Web, Admin Web, DB, API, 테스트, 배포 준비 작업

단순 질문 답변, 코드 설명, 상태 확인만 수행한 경우에는 적용하지 않는다.

## 4. 검토 규칙

검토는 작업 성격에 맞게 수행한다.

공통 검토 항목:

- 사용자가 요청한 범위와 실제 변경 범위가 일치하는가?
- 관련 AGENT/TODO 정본 규칙을 지켰는가?
- 완료 기준을 만족했는가?
- 실행한 검증 명령과 결과가 명확한가?
- 실패하거나 보류한 항목이 있다면 이유와 다음 조치가 기록됐는가?
- 관련 없는 파일 변경이 섞이지 않았는가?

Backend 검토 항목:

- Prisma, NestJS, Clean Architecture, User/Admin API 분리 규칙을 지켰는가?
- domain/application/infrastructure/presentation 경계를 어기지 않았는가?
- DB migration, seed, typecheck, lint, build, test 등 필요한 검증을 수행했는가?

Frontend 검토 항목:

- User Web/Admin Web 분리와 API client 경계를 지켰는가?
- 화면 상태, loading/error/empty/success, 모바일/데스크톱 기준을 확인했는가?
- typecheck, lint, build, E2E 등 필요한 검증을 수행했는가?

## 5. TODO_LOG 작성 규칙

`TODO_LOG`는 구현 후 작업 이력을 남기는 폴더다.

위치:

```text
TODO_LOG/
  YYYY-MM-DD/
    <PLAN_OR_SCOPE>_<GOAL_OR_TASK>.md
```

예:

```text
TODO_LOG/2026-06-06/BACKEND-FIRST_B01_PRISMA_SCHEMA_DB_MIGRATION.md
```

날짜 폴더는 작업 완료일의 로컬 날짜를 `YYYY-MM-DD` 형식으로 쓴다.

각 로그 문서에는 다음을 포함한다.

- 작업명
- 작업 일자
- 관련 계획과 goal
- 적용 범위
- 변경 파일
- 검증 결과
- 검토 결과
- 남은 리스크 또는 보류 사항
- 다음 권장 작업

## 6. 금지

- 검토 없이 TODO_LOG를 먼저 작성하지 않는다.
- 실패한 작업을 통과한 작업처럼 기록하지 않는다.
- TODO_LOG에 비밀값, access token, service role key, 개인정보 원문을 기록하지 않는다.
- 적용 범위와 검증 결과를 생략하지 않는다.
- 다음 작업으로 넘어가면서 검토 질문을 생략하지 않는다.

## 7. 관련 문서

- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/PM_AGENT/DECISIONS/017_planning_review_gate.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `TODO/README.md`

