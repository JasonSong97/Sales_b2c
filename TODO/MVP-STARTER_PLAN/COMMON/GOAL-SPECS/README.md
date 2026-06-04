# Goal 상세 명세 인덱스

## 1. 목적

이 폴더는 `MVP-STARTER_PLAN`의 각 `/goal`별 구현 직전 상세 명세를 관리한다.

`COMMON/GOAL-WORK-ORDER.md`가 작업 순서를 정한다면, 이 폴더는 각 goal을 실제로 구현할 때 필요한 화면 명세, API 연결, DB 연결, 상태, validation, 테스트 기준을 설명한다.

## 2. 문서 목록

| 우선순위 | 문서 | 포함 goal |
|---|---|---|
| P0 | `P0-G00-G04-FOUNDATION.md` | G00-G04 |
| P1 | `P1-G05-G11-CORE-DATA.md` | G05-G11 |
| P2 | `P2-G12-G16-DEAL-LOOP.md` | G12-G16 |
| P3 | `P3-G17-G20-SCHEDULE-MEETING.md` | G17-G20 |
| P4 | `P4-G21-G29-AUTOMATION.md` | G21-G29 |
| P5 | `P5-G30-G32-ADMIN-AUDIT.md` | G30-G32 |
| P6 | `P6-G33-G36-TEST-RELEASE.md` | G33-G36 |

## 3. 사용 방식

- `/goal`을 실행하기 전 해당 goal이 포함된 문서를 먼저 확인한다.
- 화면이 있는 goal은 `화면 명세`와 `상태/validation`을 구현 기준으로 삼는다.
- Backend API가 있는 goal은 `COMMON/API-SPEC`의 해당 문서를 함께 확인한다.
- DB 변경이 있는 goal은 `BE-TODO/DB-SCHEMA.md`의 연결 모델을 함께 확인한다.
- 완료 기준은 `GOAL-WORK-ORDER.md`와 이 폴더의 상세 명세를 모두 만족해야 한다.

## 4. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/README.md`
