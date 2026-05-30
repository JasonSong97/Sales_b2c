# UI/UX Agent Generation Guide

기준일은 `README.md`를 따른다.

이 문서는 `00_START_GUIDE.md`의 답변을 기반으로 UI/UX 디자인 마이그레이션 AGENT를 생성하는 규칙이다. 사용자의 답변에서 프로젝트, 화면 유형, 컴포넌트 유형, 레퍼런스 의도, 제약 조건을 뽑아 적절한 문서와 사이트를 연결하고 실행 가능한 AGENT 프롬프트로 변환한다.

## 생성 흐름

```text
사용자 답변 수집
  -> 작업 유형 분류
  -> 화면/컴포넌트 유형 분류
  -> 추천 레퍼런스 선택
  -> 대상 프로젝트 토큰 수집 계획 생성
  -> UX/UI 기준과 모션 강도 결정
  -> Component Migration Brief 생성
  -> AGENT 프롬프트 생성
```

## 1. 답변에서 추출할 필드

| 필드 | 용도 |
| --- | --- |
| `project path` | 대상 프로젝트 파일을 읽고 스택/토큰/컴포넌트 패턴 확인 |
| `target screen/component` | 작업 범위와 산출물 단위 결정 |
| `work type` | 신규 생성, 리디자인, 마이그레이션, 리뷰, 구현 중 무엇인지 결정 |
| `target user` | UX 우선순위와 카피 톤 결정 |
| `user goal` | 화면 구조와 CTA 우선순위 결정 |
| `UI type` | 추천 레퍼런스와 정보 밀도 결정 |
| `reference sites or URLs` | 사용자가 지정한 레퍼런스를 우선 반영 |
| `desired tone` | 시각 톤, 여백, 색상 강도, 모션 강도 결정 |
| `must keep` | 보존해야 할 API, layout, routing, brand, copy |
| `must avoid` | 제거하거나 약화할 패턴 |
| `output needed` | AGENT가 최종적으로 제공해야 할 산출물 |

## 2. 작업 유형별 AGENT 방향

| work type | AGENT 역할 | 우선 문서 |
| --- | --- | --- |
| 신규 생성 | 레퍼런스 기반으로 새 컴포넌트 contract와 UI 구현 방향 생성 | `03`, `04`, `05` |
| 리디자인 | 기존 목적은 유지하고 visual hierarchy, states, responsive 개선 | `02`, `03`, `04`, `05` |
| 외부 레퍼런스 마이그레이션 | 외부 디자인 의도를 프로젝트 토큰으로 재해석 | `04`, `05`, `03` |
| 리뷰 | 디자인 품질, 접근성, 상태 누락, 레퍼런스 적합성 점검 | `02`, `03`, `05` |
| 구현 | brief와 토큰 기준으로 코드 변경까지 수행 | `03`, `04`, `01` |

## 3. UI 유형별 추천 레퍼런스

사이트 정의는 `README.md`가 단일 출처다. 아래 표는 "UI 유형 → 어느 README 그룹의 어떤 사이트를 우선/보조로 쓸지"의 매핑만 담는다.

| UI type | 우선 레퍼런스 | 보조 레퍼런스 |
| --- | --- | --- |
| 관리자/B2B | Mobbin, MUI, Mantine | shadcn/ui, Preline UI, Flowbite |
| 대시보드 | Mobbin, MUI, Mantine | shadcn/ui, Preline UI |
| 테이블/데이터 목록 | MUI, Mantine, Preline UI, Flowbite | Mobbin, shadcn/ui |
| 필터/검색 | Mobbin, shadcn/ui, Preline UI | Flowbite, HyperUI |
| 폼/가입/설정 | Page Flows, Mobbin, shadcn/ui | Radix UI, Base UI, Flowbite |
| 모달/드로어 | Radix UI, Base UI, Animate UI | Motion Primitives, shadcn/ui |
| 카드/콘텐츠 탐색 | HyperUI, Kokonut UI, Magic UI | Mobbin, Dribbble |
| 학습/교육 | Mobbin, Page Flows | Motion Primitives, shadcn/ui |
| 학습 완료/성취 | Mobbin, Page Flows, Motion Primitives | shadcn/ui, Magic UI, React Bits |
| 결제/가격표 | Tailwind Plus, Landingfolio, Page Flows | Mobbin, Magic UI |
| 랜딩/마케팅 | Lapa Ninja, Landingfolio, Magic UI | Aceternity UI, Awwwards, Land-book |
| 브랜드/포트폴리오 | Awwwards, Land-book, Behance | Dribbble, React Bits |
| 모션 중심 | React Bits, Motion Primitives, Animate UI | Aceternity UI |

- 사용자가 직접 URL을 준 경우 그 URL을 우선하고 위 표는 보조로만 사용한다.
- 사이트 추가/제거/주의점 변경은 `README.md`에서만 한다. 이 표는 UI 유형 매핑만 갱신한다.

## 4. 정보 밀도와 모션 강도 매핑

| 답변 신호 | 정보 밀도 | 모션 강도 | 주의점 |
| --- | --- | --- | --- |
| 관리자, 운영, B2B, 테이블 | 높음 | 낮음 | 장식보다 스캔 속도 |
| 학습, 읽기, 문제 풀이 | 중간 | 낮음~중간 | 집중 영역은 움직이지 않음 |
| 학습 완료, 성취, streak, badge | 중간 | 중간 | 완료 인지, 성장 근거, 다음 학습 CTA. 반복 축하 모션은 제한 |
| 결과, 성과, KPI | 중간 | 중간 | count-up/progress만 제한적으로 |
| 랜딩, 프로모션, 브랜드 | 낮음~중간 | 중간~높음 | reduced motion 필수 |
| 결제, 가입, 설정 | 중간 | 낮음 | 신뢰감과 오류 회복 우선 |

## 5. AGENT가 자동으로 생성해야 할 내용

| 산출물 | 포함 내용 |
| --- | --- |
| Reference Strategy | 어떤 사이트를 어떤 역할로 참고할지 |
| Migration Brief | 가져올 것, 버릴 것, 프로젝트 토큰으로 바꿀 것 |
| UX/UI Criteria | 사용자 목표, 정보 구조, states, responsive, accessibility |
| Motion Criteria | 허용 강도, duration, reduced motion |
| Achievement Criteria | 학습 완료 메시지, 성장 근거, 보상 강도, 다음 학습 CTA |
| Project Token Plan | 어떤 파일에서 토큰과 패턴을 확인할지 |
| Implementation Rules | 새 dependency 금지, local pattern 우선, 코드 출력 기준 |
| Validation Checklist | before/reference/after, mobile/desktop, states 확인 |

## 6. AGENT 프롬프트 템플릿

아래 템플릿에 `00_START_GUIDE.md`의 답변과 이 문서의 매핑 결과를 채워 AGENT를 만든다.

```md
# UI/UX Migration Agent

## Role

You are a UI/UX design migration agent for the target project.
Your job is to transform external UI references into project-fit components or screens without copying blindly.
You must preserve the target project's stack, design tokens, accessibility baseline, and product context.

## Target Project

- project path:
- framework:
- styling:
- design convention docs:
- global CSS:
- component directory:
- target screen/component:

## User Goal

- target user:
- user goal:
- entry point:
- primary action:
- expected feedback:
- next step:

## Work Type

- work type:
- output needed:
- code changes required: yes/no

## Reference Strategy

Use these references by role:

| role | reference | what to extract | what to avoid |
| --- | --- | --- | --- |
| UX flow |  |  |  |
| component structure |  |  |  |
| visual tone |  |  |  |
| motion |  |  |  |

Rules:
- Treat external sites as pattern inspiration, not source code.
- Extract structure, interaction contract, timing, hierarchy, and flow.
- Restyle everything using the target project's tokens and local patterns.

## Project Token Discovery

Before designing or coding:

1. Read `package.json` and identify framework/styling/motion/icon libraries.
2. Read styling config and global CSS.
3. Read design convention docs if present.
4. Fill `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md` for this project.
5. Do not add new dependencies unless explicitly approved.

## UX/UI Requirements

- information density:
- motion intensity:
- required states:
- responsive targets:
- accessibility requirements:
- Korean/English copy tone:
- must keep:
- must avoid:

## Achievement Criteria

Use this section when the target user is a student/learner or the UI handles learning completion.

- completion type:
- completed item:
- growth evidence:
- reward element:
- visual reward style:
- animation sequence:
- next recommended action:
- low-score/retry fallback:

## Component Migration Brief

- component:
- variants:
- states:
- props/data contract:
- responsive behavior:
- accessibility contract:
- motion behavior:
- token mapping:
- completion criteria:

## Implementation Rules

- Prefer existing stack and local component patterns.
- Use target project tokens for color, radius, spacing, typography, shadow, and motion.
- Provide loading/error/empty/success states when data-driven.
- Keep hover effects usable or replaceable on touch devices.
- Include reduced-motion fallback for entrance/scroll/repeated motion.
- Avoid decorative overload unless the target is landing/promo.

## Validation

Before final response, verify:

- before/reference/after reasoning is clear.
- desktop and mobile layouts are considered.
- text does not overflow or overlap.
- keyboard/focus/aria requirements are covered.
- learner completion screens show completion, growth evidence, and next action when relevant.
- no unapproved dependency is introduced.
- final output matches requested deliverable.
```

## 7. 생성된 AGENT 예시

```md
# UI/UX Migration Agent

## Role

You are a UI/UX design migration agent for a React + Tailwind admin screen.
Transform Mobbin/MUI/shadcn-style table and filter patterns into the target project's local Tailwind UI.

## Target Project

- project path: <대상 프로젝트 절대 경로>
- framework: React + Vite
- styling: Tailwind CSS
- target screen/component: Customer Status FilterBar + Table

## Reference Strategy

| role | reference | what to extract | what to avoid |
| --- | --- | --- | --- |
| UX flow | Mobbin | filter, scan, detail entry flow | mobile-only assumptions |
| component structure | MUI, shadcn/ui | dense table, sorting, focus states | installing MUI/shadcn |
| visual tone | Preline UI | quiet B2B spacing and form controls | template colors |
| motion | Motion Primitives | collapse timing | decorative reveal |

## UX/UI Requirements

- information density: high
- motion intensity: low
- required states: loading, error, empty, success, selected, sorted
- responsive targets: mobile and desktop
- must avoid: landing-style hero, strong gradient, long animation
```

## 8. 운영 규칙

- 답변이 부족하면 빠른 질문 3개만 추가로 묻는다.
- 사용자가 레퍼런스를 지정하지 않으면 UI type 기준 추천 레퍼런스를 자동 선택한다.
- 프로젝트 경로가 없으면 AGENT는 코드 구현 대신 일반 디자인 brief까지만 생성한다.
- 프로젝트 파일을 읽을 수 있으면 `04` 템플릿을 먼저 채운 뒤 구현 방향을 낸다.
- 외부 사이트 링크는 출처 역할만 하며, 코드는 대상 프로젝트 기준으로 작성한다.

## 9. 실행 메커니즘 (누가 무엇을 변환하는가)

`00의 답변 → 6의 AGENT 프롬프트` 변환은 자동이 아니다. 아래 세 가지 방식 중 하나로 명시적으로 실행한다.

### 방식 A — Claude Code에서 1턴 변환 (권장, 기본 경로)

가장 가볍고 매번 쓰는 방식. 사용자가 채운 `## UI/UX Agent Intake` 블록을 그대로 Claude Code에 붙이고 다음 문장을 함께 보낸다.

```text
다음 Intake 답변을 06_AGENT_GENERATION_GUIDE.md의 §6 템플릿으로 변환해 AGENT 프롬프트를 출력해줘.
- 출력 형식: §6 코드 블록(`# UI/UX Migration Agent ...`) 그대로
- §2~§4 매핑 표를 적용해 work type/UI type/모션 강도를 채워줘
- project path가 있으면 04를 먼저 채우고, 없으면 디자인 brief까지만
- 미답 항목은 §8 운영 규칙에 따라 추가 질문 3개로 묻고 멈춰
```

Claude Code는 이 한 턴에서:
1. Intake 답변을 §1 필드로 파싱
2. work type → §2, UI type → §3, 신호 → §4 매핑
3. project path가 있으면 `package.json`/`tailwind.config.*`/global CSS를 Read해서 04를 채움
4. §6 템플릿을 채워 출력
5. 누락이 있으면 §8에 따라 3개 이내 추가 질문

이 변환의 산출물은 그 자체로 다음 단계 작업의 시스템 프롬프트로 쓰일 수 있다.

### 방식 B — 슬래시 커맨드 (반복 사용 시)

같은 작업을 자주 한다면 슬래시 커맨드를 만들어 둔다. 입력 형식과 처리 규칙은 **`07_AUTO_AGENT_COMMANDS.md`가 정의한다** — `/ui-agent:auto`, `/ui-agent:auto-discover`, `/ui-agent:implement`, `/ui-agent:review` 네 가지 진입점과 각각의 인자/출력이 그 문서에 있다.

실제 `.claude/commands/*.md` 파일은 이 문서 세트에서 직접 만들지 않는다(설정 변경이므로). 만들 때는 별도로 `update-config` 흐름을 따르고, 커맨드 본문에 07의 명령어 템플릿 + 처리 규칙을 그대로 옮긴다. 사용자는 Intake 답변만 인자로 넘기면 된다.

### 방식 C — 사람 손 (Intake가 짧을 때)

Intake가 한두 줄이고 work type이 명확하면 §6 템플릿을 직접 복사해 채워도 된다. 이 경우에도 §4의 정보 밀도/모션 강도 매핑은 표를 보고 사람이 직접 정한다.

### 방식 선택 기준

| 상황 | 권장 방식 |
| --- | --- |
| 일회성, project path 있음, 04 자동 수집 필요 | A |
| 같은 프로젝트에서 매주 반복 | B |
| 매우 작은 컴포넌트 1개, intake 1~2줄 | C |
| Intake가 비어 있거나 work type 불명확 | A로 시작해 §8 추가 질문에 답하기 |

### 변환 시 Claude Code가 실제로 읽어야 하는 파일

`project path`가 채워진 경우 AGENT 프롬프트를 출력하기 전에 아래 파일들을 Read한다(없으면 그 칸은 비워둔다).

1. `package.json` — framework, styling, motion, icon, form, data fetching 라이브러리
2. `tailwind.config.*` 또는 `app/globals.css` — `theme.extend`, custom colors/animations
3. `src/index.css` / `app/globals.css` — `@layer base`, custom utility, font-face
4. `DOCS/CONVENTIONS/*` 또는 `docs/design*` — 있으면 우선
5. 대상 컴포넌트의 형제 컴포넌트 1~2개 — 실제 local pattern 확인

읽은 결과는 §6 템플릿의 `## Target Project`와 `## Project Token Discovery` 섹션에 반영된다. 04 문서의 "완성 예제 (형식 기준)"이 채움 밀도의 기준이다 — 값은 그대로 쓰지 말고, 어디까지 채워야 하는지의 형식만 본다.
