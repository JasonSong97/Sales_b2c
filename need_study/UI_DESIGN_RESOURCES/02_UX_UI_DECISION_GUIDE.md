# UX/UI Decision Guide

기준일은 `README.md`를 따른다.

이 문서는 `README.md`의 UI/UX 레퍼런스와 컴포넌트 사이트를 실제 화면 설계에 적용할 때 사용하는 UX/UI 판단 기준이다. 특정 프로젝트의 디자인 컨벤션, UI 프롬프트, 접근성 기준이 있다면 그것을 최종 기준으로 삼고, 외부 레퍼런스를 제품 화면으로 바꾸기 전에 검토해야 할 질문과 체크리스트를 정리한다.

## 문서 역할

| 문서 | 중심 질문 | 사용 시점 |
| --- | --- | --- |
| `README.md` | 어떤 UI/UX 사이트를 참고할 것인가? | 레퍼런스 탐색 시작 |
| `00_START_GUIDE.md` / `06_AGENT_GENERATION_GUIDE.md` / `07_AUTO_AGENT_COMMANDS.md` | 어떤 정보로 AGENT를 시작하고 생성할 것인가? | 작업 시작/자동 분석/프롬프트 생성 |
| `01_UI_ANIMATION_ADAPTATION_GUIDE.md` | 외부 애니메이션을 어떤 강도로 구현할 것인가? | 모션/전환/인터랙션 적용 전 |
| `02_UX_UI_DECISION_GUIDE.md` | 이 화면 구조가 사용자의 목표 달성에 맞는가? | 정보구조, 레이아웃, 상태, 접근성 설계 전 |
| `03_COMPONENT_DESIGN_WORKFLOW.md` / `05_UI_DESIGN_MIGRATION_PLAYBOOK.md` | 컴포넌트 contract와 외부 레퍼런스 변환 기준은 무엇인가? | 컴포넌트 생성/리디자인/마이그레이션 |
| `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md` | 대상 프로젝트의 토큰과 코드 패턴은 무엇인가? | 프로젝트 경로 지정 후 구현 기준 수집 |
| `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md` | 학생/학습자의 완료 경험을 어떻게 설계할 것인가? | 학습 완료/성취 화면을 만들기 전 |

## UX/UI 기본 원칙

1. 사용자의 목표를 먼저 정의한다.
   화면은 예쁜 단위가 아니라 사용자가 특정 일을 끝내는 경로다.

2. 정보는 중요도 순서로 배치한다.
   가장 먼저 판단해야 하는 정보, 다음 행동, 보조 설명을 분리한다.

3. 선택지를 줄이고 다음 행동을 명확히 한다.
   한 화면에서 너무 많은 CTA, 필터, 카드, 배너가 경쟁하지 않게 한다.

4. 모든 상호작용에는 피드백이 있어야 한다.
   클릭, 저장, 제출, 필터 변경, 실패, 빈 결과에 대한 상태를 보여준다.

5. 모바일을 기본으로 생각하고 데스크톱에서 확장한다.
   모바일에서 읽히지 않는 정보 구조는 데스크톱에서도 오래 유지되기 어렵다.

6. 접근성은 마지막 보정이 아니라 설계 조건이다.
   키보드 조작, 대비, focus, 터치 타깃, semantic HTML을 초기부터 고려한다.

## 레퍼런스 평가 기준

외부 사이트를 볼 때 다음 축을 분리해서 평가한다.

| 평가 축 | 질문 | 참고 사이트 예시 |
| --- | --- | --- |
| Flow | 사용자가 어디서 들어와 무엇을 완료하고 어디로 나가는가? | Mobbin, Page Flows |
| IA | 정보가 어떤 그룹과 순서로 묶여 있는가? | Mobbin, Page Flows, Lapa Ninja |
| Visual Hierarchy | 무엇이 가장 먼저 보이고, 무엇이 보조 정보인가? | Land-book, Landingfolio, Awwwards |
| Component Fit | 이 컴포넌트가 현재 제품의 데이터와 상태를 담을 수 있는가? | shadcn/ui, Preline UI, Flowbite, HyperUI, daisyUI |
| System Fit | 접근성, 상태 모델, 장기 유지보수에 맞는 구조인가? | Radix UI, Base UI, Mantine, MUI |
| Brand Fit | 색상, 밀도, 모션, 카피 톤이 제품 성격과 맞는가? | Behance, Dribbble, Awwwards |
| Template Fit | 상용 템플릿의 완성도를 가져오되 라이선스와 제품 톤을 지킬 수 있는가? | Tailwind Plus |

## 화면 설계 순서

1. 사용자와 목표를 쓴다.
   예: 운영자가 우선 처리할 항목을 빠르게 찾고 후속 행동을 시작한다.

2. 진입점과 종료점을 정한다.
   예: 대시보드 카드에서 진입하고, 상세 확인 또는 처리 기록 작성으로 종료한다.

3. 핵심 판단 정보를 3개 이하로 고른다.
   예: 우선순위, 최근 변화, 마지막 처리일.

4. 화면 구조를 정한다.
   상단 요약, 필터, 목록, 상세 패널, CTA처럼 정보의 흐름을 먼저 잡는다.

5. 상태를 설계한다.
   loading, error, empty, success, restricted access를 빠뜨리지 않는다.

6. 컴포넌트를 고른다.
   레퍼런스에서 가져올 것은 모양이 아니라 역할이다. 카드, 테이블, 탭, 스텝, 모달 중 어떤 구조가 목표에 맞는지 결정한다.

7. 반응형과 접근성을 확인한다.
   모바일 순서, 터치 타깃, 키보드 이동, focus ring, 대비를 확인한다.

8. 마지막에 시각적 개성을 더한다.
   배경, 아이콘, 모션, 그림자는 핵심 구조가 안정된 뒤에 조정한다.

## UX 상태 설계 기준

모든 데이터 기반 화면은 네 가지 기본 상태를 갖는다.

| 상태 | 목적 | 포함 요소 |
| --- | --- | --- |
| Loading | 기다리는 이유와 영역을 예측 가능하게 만든다 | 실제 UI 크기와 비슷한 skeleton, 과한 spinner 지양 |
| Error | 실패를 이해하고 회복할 수 있게 한다 | 원인 요약, 재시도 CTA, 필요 시 이전 화면 이동 |
| Empty | 비어 있는 이유와 다음 행동을 알려준다 | 빈 상태 설명, 생성/검색 초기화/도움말 CTA |
| Success | 사용자가 핵심 정보를 빠르게 판단하게 한다 | 제목, 주요 지표, 상태 배지, 다음 행동 |

추가로 권한이 걸린 화면은 `restricted access` 상태를 별도로 둔다. 단순 error로 처리하면 사용자가 네트워크 문제와 권한 문제를 구분할 수 없다.

## 컴포넌트 선택 기준

| 사용 목적 | 우선 컴포넌트 | 판단 기준 |
| --- | --- | --- |
| 많은 데이터를 비교한다 | Table, Data Grid, Compact List | 정렬, 필터, 상태 배지가 필요한가? |
| 항목을 탐색하고 선택한다 | Card Grid, List Card | 썸네일/요약/CTA가 판단에 필요한가? |
| 단계를 완료한다 | Stepper, Wizard, Progress | 사용자가 현재 위치와 남은 단계를 알아야 하는가? |
| 빠른 설정을 바꾼다 | Toggle, Segmented Control, Select | 선택지가 짧고 반복 사용되는가? |
| 상세 정보를 임시로 본다 | Modal, Drawer, Popover | 현재 맥락을 유지한 채 확인하면 되는가? |
| 긴 설명을 읽는다 | Article Layout, Section Anchor | 읽기 흐름과 목차가 중요한가? |
| 성과를 요약한다 | KPI Card, Chart, Progress Ring | 숫자의 비교/추세/달성률 중 무엇이 중요한가? |
| 학습 완료를 보상한다 | Result Card, Progress, Badge, Next Step Card | 완료 사실, 성장 근거, 다음 학습 행동이 함께 보이는가? |

## 사이트별 UX/UI 판단 포인트

사이트 목록과 "성격/적합한 용도/주의점"의 정의는 **`README.md` 카탈로그(`React/Tailwind 컴포넌트 중심`, `디자인 시스템 / 대형 UI 라이브러리`, `UI/UX 레퍼런스와 영감 사이트` 섹션)가 단일 출처**다. 이 문서에서는 그 사이트들을 "UX/UI 판단" 관점에서 어떤 축으로 볼지만 묶는다.

| 사이트 그룹 | 이 문서에서 보는 축 | README 카테고리 |
| --- | --- | --- |
| shadcn/ui | Component Fit (variant, state, composable app UI) | React/Tailwind 컴포넌트 |
| Radix UI, Base UI | System Fit (focus, aria, keyboard, primitive contract) | 디자인 시스템 / 대형 UI 라이브러리 |
| Preline UI, Flowbite, HyperUI, daisyUI, Tailwind Plus | Component Fit (Tailwind 폼/테이블/네비) + Template Fit | React/Tailwind 컴포넌트 |
| Mantine, MUI | System Fit (데이터 밀도, 엔터프라이즈 패턴) | 디자인 시스템 / 대형 UI 라이브러리 |
| Aceternity UI, Magic UI, React Bits, Motion Primitives, Animate UI, Kokonut UI, 21st.dev, Uiverse | Visual Hierarchy + 모션 강도 (`01` 문서와 함께) | React/Tailwind 컴포넌트 |
| Mobbin, Page Flows | Flow + IA (entry → action → feedback → exit) | UI/UX 레퍼런스 |
| Awwwards, Dribbble, Behance | Brand Fit (mood, hierarchy, composition) | UI/UX 레퍼런스 |
| Lapa Ninja, Land-book, Landingfolio | IA + Visual Hierarchy (랜딩 섹션 리듬) | UI/UX 레퍼런스 |

> README의 사이트 메타데이터(링크/성격/주의점)를 바꿀 때는 `README.md`만 수정한다. 이 표는 "판단 축"만 다루므로 사이트가 추가/제거돼도 그룹 분류만 갱신하면 된다.

## 정보 밀도 기준

| 화면 유형 | 권장 밀도 | 설계 기준 |
| --- | --- | --- |
| 관리자/운영 화면 | 높음 | 한눈에 비교 가능해야 하며 장식보다 스캔 속도 우선 |
| 학습 화면 | 중간 | 현재 할 일과 피드백을 명확히 보여주고 방해 요소를 줄임 |
| 랜딩/프로모션 | 낮음~중간 | 설득 흐름, 카피, 시각적 임팩트 우선 |
| 정책/공지/도움말 | 낮음 | 긴 글 가독성, 목차, 날짜, 출처 우선 |
| 대시보드 | 중간~높음 | 핵심 지표를 먼저 보여주고 상세는 접거나 이동 |

밀도가 높은 화면일수록 카드 그림자, 큰 이미지, 큰 radius, 과한 여백을 줄인다. 밀도가 낮은 화면은 메시지와 시각적 흐름을 더 크게 잡아도 된다.

## 레이아웃 기준

| 레이아웃 | 적합한 상황 | 주의점 |
| --- | --- | --- |
| 단일 컬럼 | 모바일, 폼, 긴 글, 집중 화면 | CTA 위치가 너무 아래로 밀리지 않게 함 |
| 2컬럼 | 목록 + 상세, 설명 + 입력, 요약 + 본문 | 모바일에서는 우선순위에 따라 순서 재배치 |
| 카드 그리드 | 탐색, 추천, 콘텐츠 목록 | 카드 높이 차이와 CTA 위치 불균형 관리 |
| 테이블 | 관리, 비교, 상태 확인 | 모바일 대체 뷰 또는 가로 스크롤 기준 필요 |
| 탭 | 같은 수준의 범주 전환 | 탭이 너무 많으면 필터나 사이드 내비게이션 고려 |
| 사이드바 | 반복 탐색, 관리 기능 묶음 | 모바일에서는 drawer 또는 하단 우선순위 필요 |

## Form UX 기준

| 항목 | 기준 |
| --- | --- |
| Label | placeholder만으로 입력 의미를 설명하지 않는다 |
| Validation | 제출 후 한 번에 몰아서 보여주기보다 blur 또는 입력 완료 시점에 안내 |
| Error Copy | 무엇이 문제이고 어떻게 고치면 되는지 한국어로 짧게 안내 |
| Required | 필수 항목을 명확히 표시하고 선택 항목은 optional로 구분 |
| Submit | 저장 중, 성공, 실패 상태를 버튼과 주변 영역에 표시 |
| Long Form | 섹션 분리, 진행률, 임시저장, 이탈 경고를 고려 |

## 접근성 기준

- 텍스트와 배경 대비는 WCAG AA 수준을 목표로 한다.
- 버튼, 링크, 입력, 탭, 모달은 키보드로 접근 가능해야 한다.
- focus 상태는 숨기지 않는다.
- 모바일 터치 타깃은 최소 44x44px을 기준으로 본다.
- 아이콘 단독 버튼은 `aria-label` 또는 보이는 텍스트가 필요하다.
- 색상만으로 성공/오류/경고 상태를 전달하지 않는다.
- 모달은 열릴 때 focus 이동, 닫힐 때 이전 focus 복귀를 고려한다.
- 긴 리스트나 차트는 스크린리더용 요약 텍스트를 검토한다.

## 한국어 UX Copy 기준

| 상황 | 권장 톤 | 예시 |
| --- | --- | --- |
| Empty | 이유 + 다음 행동 | 아직 등록된 항목이 없습니다. 새 항목을 추가해 관리를 시작하세요. |
| Error | 문제 + 회복 | 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요. |
| Validation | 수정 방법 | 이메일 형식으로 입력해 주세요. |
| Success | 완료 사실 + 다음 행동 | 저장되었습니다. 목록에서 변경 내용을 확인할 수 있습니다. |
| Restricted | 권한 설명 + 문의/이동 | 이 화면을 볼 권한이 없습니다. 관리자에게 권한을 요청해 주세요. |

문구는 짧고 직접적으로 쓴다. 아이콘만으로 의미를 전달하지 말고, 주요 행동은 명확한 동사로 표현한다.

## 페이지 유형별 체크 기준

| 페이지 유형 | UX 기준 | UI 기준 |
| --- | --- | --- |
| Auth | 입력 수 최소화, 오류 즉시 안내, 소셜 액션 노출 | 중앙 카드, 명확한 CTA, 보조 링크 분리 |
| Dashboard | 핵심 지표 우선, 위험/변화 신호 강조 | 카드와 차트 밀도 조절, 상태 배지 일관성 |
| List/Search | 필터, 정렬, 빈 결과 회복 경로 | 검색/필터 영역과 결과 영역 시각 분리 |
| Detail | 핵심 요약 후 세부 정보 | 상단 요약, 섹션 anchor, CTA 고정 여부 검토 |
| Form/Create | 단계, 저장, 검증, 이탈 처리 | 입력 그룹화, 오류 위치, 버튼 상태 |
| Learning | 집중 유지, 진행률, 즉시 피드백 | 본문 가독성, 방해 요소 최소화 |
| Payment | 가격, 단계, 보안감, 실패 복구 | stepper, 요약 박스, CTA 대비 |
| Policy/Notice | 읽기, 날짜, 출처, 공유/복귀 | 긴 글 폭 제한, 제목 계층, 메타 정보 |
| Promo/Landing | 문제-해결-증거-CTA 흐름 | 히어로, 섹션 리듬, proof, CTA 반복 |

## 레퍼런스 사용 예시

| 목표 | 참고 순서 | 적용 방식 |
| --- | --- | --- |
| 관리자 목록/테이블 개선 | Mobbin -> shadcn/ui -> Preline UI | 실제 리스트/필터 패턴을 보고 로컬 테이블과 카드로 재구성 |
| 랜딩페이지 설계 | Lapa Ninja -> Landingfolio -> Aceternity UI | 섹션 흐름과 CTA 위치를 잡고 시각 효과는 필요한 만큼만 적용 |
| 가입 플로우 개선 | Page Flows -> Mobbin -> HyperUI | 단계 수, validation, error recovery를 먼저 보고 폼 UI 구현 |
| 학습 완료/결과 화면 | Mobbin -> Page Flows -> Motion Primitives -> `08` | 완료 인지, 성장 근거, 다음 학습 CTA를 중심으로 구성 |
| 공지/정책 화면 | Mobbin -> Land-book | 긴 글 가독성과 목록/상세 구조를 우선하고 장식은 최소화 |
| 디자인 시스템 점검 | Radix UI -> Base UI -> shadcn/ui | keyboard, focus, aria, variant 구조를 로컬 컴포넌트 기준으로 정리 |
| 빠른 MVP 화면 | HyperUI -> daisyUI -> Flowbite | 구현 속도를 우선하되 운영 전 제품 톤과 접근성을 다시 정리 |
| B2B 대시보드 | MUI -> Mantine -> Mobbin | 데이터 밀도, 필터, 표/차트 배치를 보고 로컬 Tailwind UI로 재구성 |

## 구현 전 UX/UI 체크리스트

- 사용자가 이 화면에서 완료해야 할 일이 한 문장으로 설명되는가?
- 진입점과 다음 행동이 명확한가?
- 가장 중요한 정보가 첫 화면에서 보이는가?
- CTA가 서로 경쟁하지 않는가?
- loading/error/empty/success/restricted 상태가 있는가?
- 모바일에서 정보 순서가 자연스러운가?
- 텍스트가 버튼, 카드, 테이블 셀 안에서 넘치지 않는가?
- 키보드와 터치 조작이 가능한가?
- 아이콘 단독 UI에 설명이 있는가?
- 외부 레퍼런스의 시각 스타일을 그대로 베끼지 않고 제품 톤으로 변환했는가?
- 애니메이션이나 장식이 정보 탐색을 늦추지 않는가?
- 같은 기능을 하는 컴포넌트가 화면마다 다르게 보이지 않는가?

## README와 함께 쓰는 방법

1. `README.md`에서 참고 사이트를 고른다.
2. `05_UI_DESIGN_MIGRATION_PLAYBOOK.md`에서 외부 레퍼런스를 어떤 방식으로 변환할지 정한다.
3. 이 문서에서 화면 유형, 정보 밀도, 컴포넌트 선택 기준을 확인한다.
4. 특정 컴포넌트를 만들거나 바꾸는 작업이면 `03_COMPONENT_DESIGN_WORKFLOW.md`의 brief를 사용한다.
5. 모션이 필요하면 `01_UI_ANIMATION_ADAPTATION_GUIDE.md`로 강도와 구현 기준을 확인한다.
6. 프로젝트별 컨벤션 문서가 있으면 그 문서를 최종 기준으로 삼는다.
7. 레퍼런스 링크, 가져온 패턴, 버린 요소를 작업 메모나 PR에 남긴다.

리뷰 전용으로 들어왔다면(`07_AUTO_AGENT_COMMANDS.md`의 `/ui-agent:review`), 이 문서의 "구현 전 UX/UI 체크리스트"와 `03_COMPONENT_DESIGN_WORKFLOW.md`의 "PR 리뷰 체크리스트" 두 곳이 검토 기준이 된다.

학습자 완료/성취 화면(퀴즈 결과, 챕터 완료, 일일 목표 달성 등)을 다룬다면 이 문서의 일반 기준 위에 `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md`의 완료 메시지·성장 근거·다음 학습 CTA 기준을 추가로 적용한다.
