# Component Design Workflow

기준일은 `README.md`를 따른다.

이 문서는 외부 UI 레퍼런스를 참고해 특정 컴포넌트를 새로 만들거나 기존 컴포넌트 디자인을 변경할 때 사용하는 실행 절차다. `README.md`는 참고 사이트를 고르는 문서이고, `05_UI_DESIGN_MIGRATION_PLAYBOOK.md`는 레퍼런스를 프로젝트 UI로 변환하는 방향을 잡는다. 이 문서는 실제 산출물 기준, 작업 템플릿, acceptance criteria를 정의한다.

## 언제 사용하는가

| 작업 | 사용 여부 |
| --- | --- |
| Button, Card, Modal, Table, FilterBar, Drawer, Tabs, Skeleton 같은 단일 컴포넌트 생성 | 사용 |
| 기존 컴포넌트의 시각 스타일, 상태, 반응형, 접근성 개선 | 사용 |
| 랜딩/대시보드/학습 화면 안의 섹션 컴포넌트 재설계 | 사용 |
| 단순 사이트 목록 탐색 | `README.md` 우선 |
| 모션 강도만 판단 | `01_UI_ANIMATION_ADAPTATION_GUIDE.md` 우선 |
| 화면 전체 UX 흐름 판단 | `02_UX_UI_DECISION_GUIDE.md` 우선 |

## 작업 순서

```text
요구 확인
  -> 외부 레퍼런스 선택
  -> 레퍼런스 역할 분리
  -> 컴포넌트 brief 작성
  -> states/variants/accessibility 정의
  -> 토큰/코드 패턴 적용
  -> desktop/mobile 시각 검증
  -> acceptance criteria 확인
```

## Component Brief 템플릿

컴포넌트 변경 전 아래 항목을 짧게라도 채운다.

```md
## Component Brief

- 대상 컴포넌트:
- 파일 위치:
- 사용 화면:
- 사용자 목표:
- 기존 문제:
- 참고 레퍼런스:
- 레퍼런스 역할: 구조 / UX flow / 모션 / 시각 톤 / 접근성 / 코드 패턴
- 레퍼런스에서 가져올 것:
- 레퍼런스에서 버릴 것:
- variants:
- states:
- responsive:
- accessibility:
- motion:
- 데이터 의존성:
- 완료 기준:
```

## 컴포넌트 유형별 기준

| 유형 | 우선 확인 파일/문서 | 필수 states | 핵심 기준 |
| --- | --- | --- | --- |
| Button/IconButton | `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md` | default, hover, active, focus, disabled, loading | 모바일 터치 타깃 44px, 아이콘 단독이면 `aria-label` |
| Card | 외부 card 레퍼런스, `02` 정보 밀도 기준 | default, hover/selected, empty data | 카드 안 CTA 위치와 높이 균형, nested card 지양 |
| Modal/Dialog | 대상 프로젝트의 modal/dialog 패턴, Radix/Base UI contract | open, closing, loading, error, success | focus 이동, backdrop, ESC/닫기, overlay z-index |
| Drawer/Sheet | 대상 프로젝트의 detail panel 패턴, Radix/shadcn/MUI drawer 패턴 | open, closing, loading, error | 모바일 full-width, desktop side panel, 배경 스크롤 관리 |
| Table/Data list | 대상 프로젝트의 data table/list 패턴, MUI/Mantine/Preline 참고 | loading, error, empty, success, selected, sorted | 최소 컬럼 폭, 모바일 대체/스크롤, 정렬 상태 표시 |
| FilterBar/Search | 대상 프로젝트의 search/filter 패턴, Mobbin/Preline/shadcn 참고 | idle, active filter, no result, loading option | 활성 필터 수, reset CTA, URL/query sync 여부 |
| Tabs/Segmented control | 대상 프로젝트의 tab/segment 패턴, Radix/Base UI contract | default, active, disabled, focus | 같은 수준의 범주만 탭으로 처리 |
| Skeleton/Loading | 대상 UI와 같은 위치 | loading only | 실제 컴포넌트 크기와 유사해야 함 |
| Toast/Inline status | 대상 프로젝트의 status/toast 패턴, shadcn/Flowbite 참고 | success, error, warning, info | 자동 사라짐보다 회복 행동이 중요한지 먼저 판단 |
| KPI/Progress | Dashboard, result screen | loading, empty, success, stale | 숫자 의미, 기준값, 단위, 비교 대상 명시 |

## 레퍼런스 변환 규칙

| 레퍼런스에서 보이는 것 | 프로젝트로 가져올 것 | 프로젝트에서 다시 정할 것 |
| --- | --- | --- |
| 섹션 구조 | 정보 순서, CTA 위치, 그룹화 | 색상, radius, shadow, spacing |
| 애니메이션 | 상태 변화의 방향과 타이밍 감각 | duration, easing, reduced motion |
| 카드/테이블 밀도 | 어떤 정보를 한 줄에 묶는지 | 컬럼 폭, 줄바꿈, 모바일 순서 |
| 폼 패턴 | validation 위치, 도움말 방식 | 한국어 copy, error tone, disabled 처리 |
| 마케팅 블록 | 문제-해결-증거-CTA 흐름 | 브랜드 톤, 이미지, 카피, 라이선스 |

## Before/After 변환 예시

| 상황 | Before 레퍼런스 | After 적용 |
| --- | --- | --- |
| 운영형 필터바 개선 | Magic UI/Aceternity처럼 큰 배경과 모션이 있는 검색 영역 | 검색, 빠른 필터, 고급 필터를 한 카드 안에 묶고 모션은 collapse 200ms 안팎으로 제한 |
| 결과 카드 개선 | React Bits 텍스트 효과와 큰 숫자 애니메이션 | count-up은 점수/달성률에만 적용하고 설명 문구는 정적 텍스트 유지 |
| 랜딩 히어로 개선 | Aceternity UI의 강한 gradient/background effect | hero structure와 CTA rhythm만 가져오고 배경 효과는 브랜드 컬러와 reduced motion 기준으로 축소 |
| 데이터 테이블 개선 | MUI/Mantine의 dense table | 정렬, badge, row action 패턴만 가져오고 스타일은 대상 프로젝트 토큰과 운영형 정보 밀도에 맞춤 |

## 시각 자료 요구

실제 디자인 변경 PR이나 작업 메모에는 가능하면 아래 근거를 남긴다.

| 자료 | 기준 |
| --- | --- |
| Before screenshot | 기존 화면의 desktop 또는 mobile 중 문제가 잘 보이는 1장 |
| Reference screenshot/link | 참고 사이트 URL과 가져올 부분 설명 |
| After screenshot | 변경 후 desktop 1장, mobile 1장 |
| 상태 screenshot | loading/error/empty/success 중 변경한 상태 |
| 비교 메모 | 무엇을 가져왔고 무엇을 버렸는지 3줄 이하 |

이미지를 문서 저장소에 넣지 않는 경우에도 PR 설명이나 작업 로그에 위 항목을 남긴다.

## 시각 자료 작성 형식

스크린샷을 첨부할 수 없는 환경(이슈, 메모, 코드리뷰 본문 등)에서는 아래 두 가지로 대체한다.

### ASCII 와이어프레임 — Before / After 표기

| 자리 | 표기 |
| --- | --- |
| 컨테이너 | `+---+`, `\|   \|` |
| 텍스트 라인 | `===` (제목), `---` (본문) |
| 입력/버튼 | `[ ... ]`, `[ Save ]` |
| 영역 라벨 | 한글 1~2단어, 모서리 안쪽에 |
| 상태 표기 | `(loading)`, `(empty)`, `(error)` 같이 괄호 |

Before (관리자 필터바 — 검색/필터/CTA가 흩어져 있어 스캔 어려움):

```text
+-----------------------------------------------+
| [ 검색......................... ] [ 검색 ]    |
+-----------------------------------------------+
| [ 학년 v ][ 등급 v ][ 상태 v ][ 기간 v ]      |
+-----------------------------------------------+
| [ + 항목 추가 ]                  [ 내보내기 ] |
+-----------------------------------------------+
```

After (한 카드로 묶고 활성 필터 수 노출, 고급 필터는 collapse):

```text
+-----------------------------------------------+
|  항목 목록                                    |
|  -----------------------------------------    |
|  [ 검색....................... ] [ 검색 ]     |
|  [ 학년 v ][ 등급 v ][ 상태 v ] [+ 고급 ▾]    |
|  활성 필터 2개 · [ 초기화 ]                   |
+-----------------------------------------------+
|  (결과 영역으로 시각적 분리)                  |
```

비교 메모(3줄):
- 가져옴: Mobbin/Preline의 "검색 + quick filter + advanced collapse" 한 카드 구조
- 버림: 헤더 영역의 큰 그림자, 별도 CTA 라인
- 변환: 활성 필터 수 표기는 한국어 톤("활성 필터 2개")로 재작성

### 색상 칩 — 토큰 매핑

값과 클래스를 한 줄로 표기한다(`▮`은 색상 자리 표시자다 — 실제 출력에선 IDE가 색상으로 렌더링하지 않더라도 hex 값으로 판단할 수 있다). 아래는 어디서나 통하는 일반 Tailwind 토큰만 사용한 형식 예시다 — 프로젝트별 custom brand/accent는 같은 자리(Secondary, Accent/Focus)에 그 프로젝트의 `tailwind.config.*` `theme.extend.colors` 값으로 치환한다.

```text
Primary CTA   ▮ #2563EB   bg-blue-600
Secondary     ▮ <#hex>    <프로젝트 brand secondary 클래스>
Accent/Focus  ▮ <#hex>    <프로젝트 brand accent 클래스>
Body text     ▮ #1F2937   text-gray-800
Muted text    ▮ #6B7280   text-gray-500
Surface       ▮ #FFFFFF   bg-white  (+ border-gray-100, shadow-sm)
Error inline  ▮ #FEF2F2   bg-red-50 text-red-700
Success inline▮ #F0FDF4   bg-green-50 text-green-700
```

PR 본문이나 변경 메모에 위 두 형식(와이어프레임 + 색상 칩)을 함께 남기면, 스크린샷 없이도 리뷰어가 "어디서 무엇이 바뀌었는지"를 판단할 수 있다.

## 정량 완료 기준

| 항목 | 기준 |
| --- | --- |
| Touch target | 모바일 주요 버튼/탭 최소 `44x44px` |
| Hover transition | `150-200ms` 범위 우선 |
| 내부 화면 entrance/layout motion | 일반적으로 `300ms` 이하, 복잡한 reveal은 `500ms` 이하 |
| 결과/성과 reveal | 최대 `800ms` 기준 |
| List stagger | item delay는 `Math.min(index * 0.04, 0.3)` 수준으로 cap |
| Table mobile | `min-w-*` + `overflow-x-auto` 또는 카드형 대체 뷰 |
| Long text | 제목/카드/셀은 `truncate`, `line-clamp`, wrapping 중 하나를 명시 |
| Focus | keyboard focus가 시각적으로 보임 |
| States | 데이터 컴포넌트는 loading/error/empty/success를 갖춤 |
| Dependency | 새 의존성 없음. 예외는 사용자 명시 요청 시만 |

## 구현 전 체크리스트

- 외부 레퍼런스의 역할을 명확히 분리했는가?
- 레퍼런스에서 가져올 것과 버릴 것을 적었는가?
- 참고 레퍼런스의 역할이 구조/모션/카피/컴포넌트 중 무엇인지 분리했는가?
- variants와 states가 명시됐는가?
- 모바일과 desktop에서 정보 순서가 명확한가?
- 접근성 contract가 정해졌는가?
- 사용할 토큰과 코드 패턴을 `04` 문서에서 확인했는가?
- 프로젝트 토큰으로 재스타일링할 요소가 명시됐는가?

## PR 리뷰 체크리스트

- 목적: 컴포넌트 변경 이유가 사용자 목표와 연결되는가?
- 일관성: 프로젝트 토큰과 대상 화면의 정보 밀도에 맞는가?
- 상태: loading/error/empty/success/disabled/focus가 빠지지 않았는가?
- 반응형: mobile, tablet, desktop에서 텍스트와 CTA가 겹치지 않는가?
- 접근성: keyboard, aria-label, focus, contrast가 유지되는가?
- 모션: 화면 성격에 맞는 강도인가?
- 코드: 새 의존성 없이 로컬 Tailwind/React 패턴으로 구현됐는가?
- 근거: reference link와 before/after 판단이 남아 있는가?

## README와 함께 쓰는 방법

1. `00_START_GUIDE.md`로 작업 범위를 정한다.
2. `06_AGENT_GENERATION_GUIDE.md`로 레퍼런스/문서 조합과 brief 골격을 만든다 (또는 `07_AUTO_AGENT_COMMANDS.md`로 자동 시작).
3. 이 문서의 Component Brief 템플릿과 컴포넌트 유형별 기준으로 contract를 채운다.
4. `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`의 토큰과 코드 패턴으로 재스타일링한다.
5. 모션이 들어가면 `01_UI_ANIMATION_ADAPTATION_GUIDE.md`, UX 구조가 바뀌면 `02_UX_UI_DECISION_GUIDE.md`로 보강한다.
6. 외부 사이트를 깊이 가져온다면 `05_UI_DESIGN_MIGRATION_PLAYBOOK.md`로 가져올 것/버릴 것을 분리한다.
7. 학습 완료·성취 컴포넌트(ResultCard, Badge, Streak, Next Step Card 등)라면 `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md`의 완료 구조·카피·모션 강도 기준을 추가로 본다.
8. PR/작업 메모에는 reference link와 before/after 근거를 남긴다.
