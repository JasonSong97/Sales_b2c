# UI Animation Adaptation Guide

기준일은 `README.md`를 따른다.

이 문서는 `README.md`의 UI 디자인 리소스 목록을 실제 UI 작업에 적용할 때 참고하는 보조 문서다. 외부 사이트에서 본 컴포넌트와 애니메이션 패턴을 대상 프로젝트의 스택, 디자인 토큰, 접근성 기준에 맞게 줄이고 재구성하는 방법을 정리한다.

## 문서 역할 비교

| 항목 | `README.md` | 프로젝트별 모션/디자인 규칙 | 이 문서의 역할 |
| --- | --- | --- | --- |
| 목적 | 유명 UI 컴포넌트/레퍼런스 사이트 목록화 | 대상 프로젝트의 애니메이션 구현 규칙 정의 | 외부 레퍼런스를 실제 구현 기준으로 변환 |
| 중심 질문 | 어떤 사이트를 참고할 것인가? | 어떤 애니메이션을 허용하고 어떻게 구현할 것인가? | 이 레퍼런스를 지금 화면에 써도 되는가? |
| 범위 | React/Tailwind 컴포넌트, 디자인 시스템, UI/UX 영감 사이트 | 대상 프로젝트의 모션 구현 규칙, reduced motion, 화면별 강도 | 리소스별 사용 범위, 변환 규칙, 체크리스트 |
| 산출물 | 참고처 카탈로그 | 코드 구현 프롬프트 | 적용 판단표와 구현 전 점검 기준 |
| 위험 관리 | 라이선스, 템플릿 느낌, 품질 편차 | 새 의존성 금지, 과한 모션 금지, 접근성 | 복붙 방지, 제품 톤 유지, 모션 강도 제한 |

## 핵심 원칙

1. 외부 사이트는 소스 코드 저장소가 아니라 패턴 참고처로 본다.
2. 현재 프로젝트에 이미 있는 스택으로 재구현한다.
3. 애니메이션은 장식보다 상태 변화와 이해를 돕는 목적이 우선이다.
4. 학습 본문, 정책 문서, 공지 상세, 반복 업무 화면에는 강한 모션을 넣지 않는다.
5. 진입, 스크롤, 반복 모션에는 `prefers-reduced-motion` 대응을 포함한다.

## 외부 리소스 적용 기준

| 리소스 그룹 | 대표 사이트 | 적합한 사용 | 변환 기준 | 피해야 할 사용 |
| --- | --- | --- | --- | --- |
| 크리에이티브 모션 | React Bits, Aceternity UI, Magic UI | 프로모션, 랜딩, 히어로, 카드 스택, 짧은 텍스트 효과 | 아이디어만 가져오고 대상 프로젝트의 기존 모션 스택으로 단순화 | 학습 본문, 관리자 테이블, 긴 리스트에 장식 효과 적용 |
| 모션 프리미티브 | Motion Primitives, Animate UI | 모달, 탭 전환, 리스트 진입, hover lift, progress reveal | duration/easing을 프로젝트 토큰에 맞춤 | CLI 설치나 외부 패키지 추가 |
| 실무형 컴포넌트 | shadcn/ui, Preline UI, Flowbite, HyperUI, daisyUI | 폼, 테이블, 모달, 네비게이션, 카드 레이아웃 | 구조와 접근성 패턴을 참고하고 스타일은 로컬 토큰에 맞춤 | 라이브러리 스타일을 그대로 유지해 제품 톤을 깨는 것 |
| 상용 템플릿/블록 | Tailwind Plus | 완성도 높은 랜딩, 앱 shell, 이커머스 섹션 | 레이아웃 구조와 컴포넌트 분해 방식만 참고 | 라이선스 확인 없이 코드나 디자인을 재사용하는 것 |
| 디자인 시스템 기반 | Radix UI, Base UI, Mantine, MUI | 접근성, 상태 모델, 컴포넌트 API 설계 참고 | 구현 스택에 맞게 로컬 컴포넌트로 재해석 | 대형 UI 라이브러리 자체를 새 의존성으로 도입하는 것 |
| 커뮤니티 UI 조각 | Uiverse, 21st.dev, Kokonut UI | 버튼, 로더, empty state, 작은 상호작용 | 작은 단위로 분해해 필요한 효과만 가져옴 | 품질 검토 없이 전체 컴포넌트 복붙 |
| UX 플로우 레퍼런스 | Mobbin, Page Flows | 온보딩, 결제, 가입, 설정, 대시보드 흐름 분석 | 화면 구조와 단계 흐름을 추출 | 시각 스타일을 그대로 베끼는 것 |
| 비주얼 영감 | Awwwards, Dribbble, Behance, Land-book, Lapa Ninja, Landingfolio | 랜딩 구조, 브랜드 톤, 섹션 구성, 카피 흐름 | 정보 구조와 분위기만 참고 | 실험적 인터랙션을 제품 내부 화면에 직접 적용 |

## 모션 강도 기준

| 화면 성격 | 허용 강도 | 권장 패턴 | 주의점 |
| --- | --- | --- | --- |
| 관리자/운영 화면 | 낮음 | row fade-in, modal spring, tab transition, skeleton | 정보 밀도와 반복 작업 속도를 해치지 않기 |
| 학습/읽기 화면 | 낮음 | 단계 전환, 정답/오답 피드백, 진행률 표시 | 본문 텍스트와 집중 영역은 움직이지 않기 |
| 결과/성과 화면 | 중간 | score count-up, progress bar/ring, badge reveal | 성취감은 주되 과한 축하 효과는 피하기. 학생 완료 경험은 `08` 기준 우선 |
| 커리큘럼/로드맵 | 중간 | 카드 진입, 단계 progress, hover lift | 긴 리스트에서 stagger delay를 제한하기 |
| 프로모션/랜딩 | 높음 | hero reveal, scroll reveal, card stack, headline effect | 성능과 reduced motion 대응 필수 |
| 정책/공지/리포트 | 매우 낮음 | 최소한의 진입 전환, static fallback | 인쇄/공유/읽기 안정성 우선 |

## 패턴 변환 절차

1. 참고 사이트에서 시각 효과가 아니라 상태 변화를 먼저 찾는다.
   예: 카드가 떠오르는 효과는 "선택 가능함", 숫자 증가 효과는 "성과가 계산됨"을 전달하는지 확인한다.

2. 현재 화면의 강도 등급을 정한다.
   관리자 화면이면 낮음, 랜딩이면 높음처럼 화면 성격을 먼저 고정한다.

3. 구현 스택을 고정한다.
   기본은 대상 프로젝트의 가장 가벼운 transition 수단이다. mount/unmount, layout, count-up, scroll reveal처럼 상태 기반 모션이 필요할 때만 프로젝트에 이미 있는 motion 라이브러리를 쓴다.

4. 외부 코드를 직접 붙이지 않는다.
   구조, 타이밍, 움직임 방향만 추출하고 클래스명, 색상, radius, shadow, spacing은 프로젝트 기준으로 다시 작성한다.

5. reduced motion과 모바일을 먼저 검토한다.
   hover-only 효과는 모바일에서 의미가 없을 수 있다. 터치 피드백이나 명확한 selected 상태가 필요하다.

6. 마지막으로 정보 밀도를 확인한다.
   모션이 화면을 멋있게 만들더라도 핵심 정보 탐색이 느려지면 제거한다.

## 권장 모션 토큰

| 토큰 | 시간 | 용도 |
| --- | --- | --- |
| `instant` | 100ms | 버튼 press, 아이콘 교체 |
| `quick` | 200ms | hover, 색상, opacity |
| `base` | 300ms | 모달, 패널, 카드 확장 |
| `smooth` | 500ms | 레이아웃 전환, 섹션 진입 |
| `slow` | 800ms | 점수 count-up, progress ring, hero reveal |

권장 easing:

| 용도 | 값 |
| --- | --- |
| 기본 진입 | `easeOut` |
| 종료 | `easeIn` |
| 모달/패널 | `{ stiffness: 320, damping: 30 }` |
| 제한적 성취 효과 | `{ stiffness: 260, damping: 18 }` |
| 부드러운 layout | `[0.22, 1, 0.36, 1]` |

## 리소스별 적용 예시

| 만들려는 UI | 먼저 볼 사이트 | 실제 구현 방향 |
| --- | --- | --- |
| 랜딩 히어로 | Magic UI, Aceternity UI, Lapa Ninja | 구조는 참고하되 배경 효과를 줄이고 headline/CTA 진입만 구현 |
| 성과 카드 | Motion Primitives, React Bits, Mobbin | count-up, progress bar, badge reveal 중심으로 구성 |
| 관리자 필터/테이블 | Mobbin, shadcn/ui, Preline UI | 레이아웃과 접근성 패턴을 참고하고 모션은 row 진입/상태 변경만 사용 |
| 모달/시트 | Animate UI, Motion Primitives, Radix UI | overlay fade + panel spring으로 단순화 |
| empty/loading state | Kokonut UI, Uiverse, Flowbite | 실제 컴포넌트 크기에 맞춘 skeleton과 짧은 opacity 전환 |
| 카드형 목록 | HyperUI, Kokonut UI, Aceternity UI | hover lift는 2px 안팎으로 제한하고 모바일 selected 상태를 별도 제공 |
| 앱 shell/상용 섹션 | Tailwind Plus, Preline UI, Flowbite | 레이아웃과 상태 구성을 참고하되 라이선스와 제품 톤을 확인 |
| 접근성 높은 프리미티브 | Radix UI, Base UI, shadcn/ui | focus, keyboard, aria 패턴을 참고하고 로컬 컴포넌트로 구현 |

## 구현 전 체크리스트

- 참고한 사이트의 역할이 명확한가? 예: 구조 참고, 모션 참고, UX 흐름 참고
- 새 라이브러리 설치 없이 구현 가능한가?
- 외부 컴포넌트 코드를 그대로 붙이지 않았는가?
- 현재 화면의 모션 강도 기준을 넘지 않는가?
- 학습 본문, 긴 설명문, 반복 업무 테이블을 움직이지 않는가?
- duration이 내부 화면 기준 800ms를 넘지 않는가?
- hover 효과가 모바일에서 무의미해지지 않는가?
- `prefers-reduced-motion` 대응이 필요한 패턴에 fallback이 있는가?
- 색상, radius, spacing, shadow가 기존 제품 톤과 맞는가?
- 애니메이션 제거 후에도 기능과 정보 전달이 유지되는가?

## README와 함께 쓰는 방법

1. `README.md`에서 목적에 맞는 리소스 그룹을 고른다.
2. 이 문서의 "외부 리소스 적용 기준"에서 해당 그룹의 허용 범위를 확인한다.
3. 화면 성격에 맞춰 모션 강도를 정한다.
4. 패턴 변환 절차와 체크리스트로 구현 가능 여부를 판단한다.
5. 코드에 적용할 때는 `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`의 motion token과 snippet을 기준으로 삼는다.
6. 프로젝트별 에이전트 프롬프트가 있다면 그 문서의 스택 제약과 화면별 규칙을 최종 기준으로 삼는다.

자동 경로로 시작했다면(`07_AUTO_AGENT_COMMANDS.md`), 결과 brief에 들어 있는 모션 항목을 위 1~4단계 기준으로 다시 검토한다. 자동 분석은 강도 등급까지 강제하지 않는다.

학습 완료/성취 화면의 모션(progress fill, score count-up, badge reveal, celebration overlay 등)은 이 문서의 "모션 강도 기준" 위에 `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md`의 "모션 기준" 표를 함께 본다. 매 문제마다 confetti를 띄우지 않는 등 완료 단위별 강도 규칙이 그 문서에 있다.
