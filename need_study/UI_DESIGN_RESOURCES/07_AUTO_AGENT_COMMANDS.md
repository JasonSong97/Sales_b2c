# Auto Agent Commands

기준일은 `README.md`를 따른다.

이 문서는 프로젝트를 자동 분석한 뒤 UI/UX 마이그레이션 AGENT를 바로 생성하기 위한 입력 명령어 템플릿이다. 사용 흐름은 `06_AGENT_GENERATION_GUIDE.md` §9의 "방식 B (슬래시 커맨드)"에 해당한다. 사용자는 최소한 `project path`와 `target`만 제공하면 되고, AGENT는 프로젝트의 스택, 토큰, 전역 스타일, 디자인 문서, 컴포넌트 패턴을 먼저 읽은 뒤 적절한 레퍼런스와 실행 프롬프트를 생성한다.

## 최소 명령어

가장 짧은 형태다.

```text
/ui-agent:auto
project: <대상 프로젝트 절대 경로>
target: 만들거나 바꿀 화면/컴포넌트
goal: 사용자가 이 UI에서 달성해야 하는 일
```

예시 (경로는 OS에 맞게 입력 — Windows 절대 경로, macOS/Linux POSIX 경로 모두 허용):

```text
/ui-agent:auto
project: <대상 프로젝트 절대 경로>
target: 관리자 고객 목록 FilterBar + Table
goal: 운영자가 우선 처리할 고객을 빠르게 찾고 상세 상태를 확인한다
```

## 권장 명령어

정확도를 높이려면 아래 형식을 사용한다.

```text
/ui-agent:auto
project: <프로젝트 경로>
target: <화면/섹션/컴포넌트>
work_type: 신규 생성 | 리디자인 | 외부 레퍼런스 마이그레이션 | 리뷰 | 구현
ui_type: 관리자 | B2B | SaaS | 대시보드 | 학습 | 학습 완료 | 성취 | 랜딩 | 결제 | 폼 | 테이블 | 카드 | 콘텐츠 탐색 | 모달 | 모션 중심 | 기타
target_user: <주요 사용자>
goal: <사용자 목표>
references: auto | Mobbin, shadcn/ui, Magic UI, ...
tone: 차분함 | 전문적 | 고급스러움 | 친근함 | 실험적 | 교육적 | 커머스형
must_keep: <유지할 것>
must_avoid: <피할 것>
output: agent_prompt | design_brief | implementation_plan | code | review_checklist
```

예시:

```text
/ui-agent:auto
project: <대상 프로젝트 절대 경로>
target: 결제 플랜 카드와 결제 확인 모달
work_type: 외부 레퍼런스 마이그레이션
ui_type: 결제
target_user: 구독을 고민하는 관리자
goal: 플랜 차이를 빠르게 이해하고 안전하게 결제를 진행한다
references: Tailwind Plus, Landingfolio, Page Flows, Mobbin
tone: 전문적, 신뢰감
must_keep: 기존 결제 API, 기존 라우팅, 새 dependency 금지
must_avoid: 과한 gradient, 긴 애니메이션, 가격 정보 숨김
output: agent_prompt, design_brief, implementation_plan
```

## 완전 자동 명령어

사용자가 레퍼런스나 톤을 잘 모를 때 사용한다. AGENT가 프로젝트와 target을 보고 자동 추천한다.

```text
/ui-agent:auto-discover
project: <프로젝트 경로>
target: <화면/섹션/컴포넌트>
goal: <사용자 목표>
output: agent_prompt
```

AGENT는 다음을 자동으로 수행한다.

1. 프로젝트 경로에서 `package.json`, framework config, styling config, global CSS를 찾는다.
2. 디자인 컨벤션 문서와 README를 찾는다.
3. target 이름을 기준으로 관련 화면/컴포넌트 파일을 탐색한다.
4. `00_START_GUIDE.md`의 비어 있는 항목을 가능한 범위에서 추론한다.
5. `06_AGENT_GENERATION_GUIDE.md`의 매핑표로 레퍼런스를 추천한다.
6. `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`의 토큰 템플릿을 대상 프로젝트 기준으로 채운다.
7. 최종 UI/UX Migration Agent 프롬프트를 생성한다.

## 코드 구현까지 요청하는 명령어

AGENT 생성에서 멈추지 않고 실제 구현까지 원하는 경우 사용한다.

```text
/ui-agent:implement
project: <프로젝트 경로>
target: <화면/섹션/컴포넌트>
goal: <사용자 목표>
work_type: 신규 생성 | 리디자인 | 외부 레퍼런스 마이그레이션
references: auto | <사이트명/URL>
constraints: 새 dependency 금지, 기존 API 유지, 모바일 우선
verify: lint | build | screenshot | manual
```

주의:

- 이 명령은 코드 변경을 전제로 한다.
- AGENT는 먼저 분석 결과와 구현 계획을 짧게 정리한 뒤 파일을 수정한다.
- 새 dependency가 필요하면 구현하지 말고 사용자에게 승인 요청을 해야 한다.
- screenshot 검증이 필요한 경우 dev server와 Playwright 가능 여부를 확인한다.

## 리뷰 전용 명령어

기존 UI 변경안이나 PR을 검토할 때 사용한다.

```text
/ui-agent:review
project: <프로젝트 경로>
target: <화면/섹션/컴포넌트/PR>
goal: <검토 목적>
reference: auto | <비교할 사이트/패턴>
focus: UX | UI | accessibility | responsive | motion | consistency
```

리뷰 AGENT는 findings first 형식으로 답한다.

## 명령어 처리 규칙

AGENT는 명령어를 받으면 아래 순서로 움직인다.

```text
1. project path 유효성 확인
2. package/framework/styling/design docs 탐색
3. target 관련 파일 탐색
4. 프로젝트 토큰과 코드 패턴 요약
5. UI type과 work type 추론
6. reference strategy 생성
7. Component Migration Brief 생성
8. AGENT 프롬프트 또는 구현 계획 출력
9. output이 code면 구현 및 검증 진행
```

## 자동 분석 시 확인할 파일 패턴

확인 대상 파일은 `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md` "우선 확인할 파일" 표가 단일 출처다. 이 문서는 그 표에 라우팅 추론용 패턴만 추가한다.

| 목적 | 파일 패턴 | 출처 |
| --- | --- | --- |
| 패키지, Framework, Styling, CSS 변수, 디자인 문서, 컴포넌트, 아이콘, 모션 | (04의 "우선 확인할 파일" 표 참고) | `04` |
| 라우팅 (자동 추론용) | `src/routes/**`, `app/**/page.*`, `pages/**`, `src/App.*` | 07 (이 문서) |

> 추가/변경은 04에서 먼저 한다. 라우팅 패턴만 자동 분석 단계에서 별도로 필요해 여기 둔다.

## 자동 추천 규칙 (키워드 → UI type 매핑)

이 표는 `target` 문자열에서 UI type을 추론하기 위한 **키워드 매칭 단계**만 담는다. UI type → 사이트 매핑은 `06_AGENT_GENERATION_GUIDE.md` §3이 단일 출처이고, 사이트 정의(링크/성격/주의점)는 `README.md`가 단일 출처다.

| target 키워드 | 추론할 UI type | 사이트 매핑 출처 |
| --- | --- | --- |
| `admin`, `management`, `dashboard`, `table`, `관리자`, `운영`, `대시보드`, `테이블` | 관리자/B2B 또는 대시보드 또는 테이블/데이터 목록 | `06_AGENT_GENERATION_GUIDE.md` §3의 해당 UI type 행 |
| `filter`, `search`, `list`, `필터`, `검색`, `목록` | 필터/검색 | `06_AGENT_GENERATION_GUIDE.md` §3의 `필터/검색` 행 |
| `modal`, `dialog`, `drawer`, `sheet`, `모달`, `다이얼로그`, `드로어`, `시트` | 모달/드로어 | `06_AGENT_GENERATION_GUIDE.md` §3의 `모달/드로어` 행 |
| `landing`, `hero`, `marketing`, `promo`, `랜딩`, `히어로`, `마케팅`, `프로모션` | 랜딩/마케팅 | `06_AGENT_GENERATION_GUIDE.md` §3의 `랜딩/마케팅` 행 |
| `payment`, `pricing`, `checkout`, `결제`, `가격`, `가격표`, `체크아웃` | 결제/가격표 | `06_AGENT_GENERATION_GUIDE.md` §3의 `결제/가격표` 행 |
| `card`, `content`, `gallery`, `카드`, `콘텐츠`, `갤러리`, `탐색` | 카드/콘텐츠 탐색 | `06_AGENT_GENERATION_GUIDE.md` §3의 `카드/콘텐츠 탐색` 행 |
| `motion`, `animation`, `transition`, `모션`, `애니메이션`, `전환`, `인터랙션` | 모션 중심 | `06_AGENT_GENERATION_GUIDE.md` §3의 `모션 중심` 행 |
| `form`, `signup`, `settings`, `폼`, `가입`, `설정`, `입력` | 폼/가입/설정 | `06_AGENT_GENERATION_GUIDE.md` §3의 `폼/가입/설정` 행 |
| `learning`, `learn`, `course`, `quiz`, `lesson`, `학습`, `교육`, `강의`, `문제`, `수업` | 학습/교육 | `06_AGENT_GENERATION_GUIDE.md` §3의 `학습/교육` 행 |
| `complete`, `completion`, `achievement`, `reward`, `badge`, `streak`, `완료`, `성취`, `보상`, `배지`, `뱃지`, `연속`, `결과` | 학습 완료/성취 | `06_AGENT_GENERATION_GUIDE.md` §3의 `학습 완료/성취` 행 |
| `brand`, `portfolio`, `about`, `case-study`, `브랜드`, `포트폴리오`, `소개`, `케이스` | 브랜드/포트폴리오 | `06_AGENT_GENERATION_GUIDE.md` §3의 `브랜드/포트폴리오` 행 |

> 사이트 추가/제거는 `README.md`에서 한다. UI type 정의 변경은 `06` §3에서 한다. 이 표는 키워드만 갱신한다.

## 출력 형식

`output: agent_prompt`일 때:

```md
# UI/UX Migration Agent

## Auto Analysis Summary
- project:
- detected stack:
- styling:
- design docs:
- target:
- inferred UI type:

## Reference Strategy
...

## Component Migration Brief
...

## Project Token Plan
...

## Implementation / Review Rules
...
```

`output: implementation_plan`일 때:

```md
## Implementation Plan

1. Files to inspect
2. Tokens to use
3. Components to create/update
4. States to implement
5. Responsive/accessibility checks
6. Verification commands
```

## 부족한 정보가 있을 때

필수 정보가 부족하면 AGENT는 최대 3개만 질문한다.

| 부족한 정보 | 질문 |
| --- | --- |
| project 없음 | 대상 프로젝트 경로를 알려주세요. |
| target 없음 | 만들거나 바꿀 화면/컴포넌트 이름을 알려주세요. |
| goal 없음 | 사용자가 이 UI에서 완료해야 하는 일을 한 문장으로 알려주세요. |

그 외 정보는 자동 추론하고, 추론한 내용은 `Assumptions`에 명시한다.
