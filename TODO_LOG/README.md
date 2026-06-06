# TODO_LOG

## 1. 목적

`TODO_LOG`는 특정 `/goal` 또는 명시적인 작업 단위가 끝난 뒤, 검토를 통과한 작업 이력을 날짜별로 남기는 폴더다.

`TODO`가 앞으로 할 일을 정리한다면, `TODO_LOG`는 실제로 적용된 작업과 검증 결과를 추적한다.

## 2. 작성 조건

작업이 끝났다고 바로 기록하지 않는다.

1. AI 작업자가 사용자에게 `이번 작업에 대해 검토를 해드릴까요?`라고 질문한다.
2. 사용자가 검토를 요청하면 적용 범위와 검증 결과를 검토한다.
3. 검토가 `통과` 또는 사용자가 수용한 `조건부 통과`가 된 뒤에 기록한다.

## 3. 폴더 구조

```text
TODO_LOG/
  YYYY-MM-DD/
    <PLAN_OR_SCOPE>_<GOAL_OR_TASK>.md
```

예:

```text
TODO_LOG/2026-06-06/BACKEND-FIRST_B01_PRISMA_SCHEMA_DB_MIGRATION.md
```

## 4. 로그 문서 필수 항목

- 작업명
- 작업 일자
- 관련 계획과 goal
- 적용 범위
- 변경 파일
- 검증 결과
- 검토 결과
- 남은 리스크 또는 보류 사항
- 다음 권장 작업

## 5. 금지

- 검토 없이 기록하지 않는다.
- 실패한 작업을 통과한 작업처럼 기록하지 않는다.
- 비밀값, access token, service role key, 개인정보 원문을 기록하지 않는다.

## 6. 관련 문서

- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`

