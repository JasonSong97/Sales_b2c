# Backend First Goal Specs 참조

## 1. 원칙

이 계획의 goal 상세는 기존 `MVP-STARTER_PLAN/COMMON/GOAL-SPECS`를 기준으로 한다.

`BACKEND-FIRST_PLAN`은 FE 구현 goal을 건너뛰고 Backend 구현 순서를 재배열한다. 따라서 각 Backend goal은 기존 goal spec에서 Backend/API/DB/테스트 항목만 끌어와 실행한다.

## 2. 참조 매핑

| Backend First goal | 기존 goal spec |
|---|---|
| B01 | `P0-G00-G04-FOUNDATION.md`의 G04 |
| B02 | `P0-G00-G04-FOUNDATION.md`, Backend 공통 규칙 |
| B03 | `P1-G05-G11-CORE-DATA.md`의 G05 |
| B04-B07 | `P1-G05-G11-CORE-DATA.md`의 G06, G08, G10 |
| B08-B09 | `P2-G12-G16-DEAL-LOOP.md`의 G12 |
| B10-B11 | `P3-G17-G20-SCHEDULE-MEETING.md` |
| B12-B16 | `P4-G21-G29-AUTOMATION.md` |
| B17 | `P5-G30-G32-ADMIN-AUDIT.md` |
| B18 | `P6-G33-G36-TEST-RELEASE.md` |

## 3. 완료 기준

각 Backend First goal은 기존 goal spec의 Backend/API/DB 완료 기준을 만족해야 한다.

FE 화면 완료 기준은 이번 계획에서는 제외한다. 단, response shape와 error shape는 FE가 후속 구현에서 그대로 사용할 수 있어야 한다.

