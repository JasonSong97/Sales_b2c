# UI Design Migration Playbook

기준일은 `README.md`를 따른다.

이 문서는 `README.md`에 정리된 외부 UI 사이트를 기준으로, 새 컴포넌트나 UI 디자인을 현재 프로젝트에 마이그레이션할 때의 방향을 잡는 문서다. 목적은 현 프로젝트 기능을 분석하는 것이 아니라, 외부 레퍼런스에서 좋은 패턴을 골라 제품 톤, 기술 스택, 접근성 기준에 맞게 변환하는 것이다.

## 핵심 관점

외부 UI 사이트는 "그대로 가져올 코드"가 아니라 "마이그레이션할 디자인 의도"를 찾는 출발점이다.

| 구분 | 하지 않을 것 | 해야 할 것 |
| --- | --- | --- |
| 코드 | 외부 컴포넌트 전체 복붙 | 구조, 상태, interaction contract만 추출 |
| 스타일 | 원본 색상/그림자/gradient를 그대로 적용 | 프로젝트 토큰과 화면 밀도에 맞게 재조정 |
| 모션 | 화려한 효과를 그대로 이식 | 상태 변화가 이해되는 수준으로 축소 |
| UX | 레퍼런스 화면 구성을 그대로 모사 | 사용자 목표와 정보 우선순위에 맞게 재배열 |
| 라이브러리 | 새 UI 라이브러리 설치 | 대상 프로젝트의 기존 컴포넌트, 스타일, 모션 스택 기준으로 재구현 |

## 마이그레이션 절차

```text
외부 레퍼런스 선택
  -> 레퍼런스의 역할 분류
  -> 가져올 요소와 버릴 요소 분리
  -> 컴포넌트 contract 정의
  -> 프로젝트 토큰으로 재스타일링
  -> 상태/반응형/접근성 보강
  -> before/reference/after 검증
```

## 1. 레퍼런스 역할 분류

하나의 사이트에서 모든 것을 가져오려고 하지 않는다. 레퍼런스마다 역할을 분리한다. 사이트 정의/링크는 `README.md`가 단일 출처이고, 이 표는 "마이그레이션 시 그 사이트에서 무엇만 추출할지"만 정한다.

| 목적 | 사이트 그룹 (출처: README) | 가져올 것 |
| --- | --- | --- |
| 앱 컴포넌트 구조 | shadcn/ui, Radix UI, Base UI | variant, state, keyboard/focus contract |
| Tailwind 구현 감각 | Preline UI, Flowbite, HyperUI, daisyUI | class 구조, spacing, form/table/nav 패턴 |
| 모션/전환 | React Bits, Motion Primitives, Animate UI, Aceternity UI | 움직임의 이유, 방향, timing |
| 랜딩/마케팅 섹션 | Magic UI, Aceternity UI, Tailwind Plus, Lapa Ninja, Landingfolio | 섹션 순서, CTA 반복, proof 구조 |
| 실제 UX 흐름 | Mobbin, Page Flows | entry-action-feedback-exit 흐름 |
| 비주얼 톤 | Awwwards, Land-book, Dribbble, Behance | mood, hierarchy, composition |
| 엔터프라이즈/대시보드 | MUI, Mantine | 데이터 밀도, table/filter/form 배치 |
| 커뮤니티 실험 | 21st.dev, Uiverse, Kokonut UI | 작은 UI 아이디어, micro interaction |

> 사이트 추가/제거는 `README.md`에서 먼저 한다. 이 표의 "그룹"은 그곳을 따른다.

## 2. 가져올 것 / 버릴 것

| 레퍼런스 요소 | 가져올 수 있음 | 버려야 하는 경우 |
| --- | --- | --- |
| Layout | 정보 그룹, CTA 위치, section rhythm | 현재 화면 목표와 맞지 않거나 정보 순서가 꼬일 때 |
| Component shape | card/table/modal/filter 구조 | 데이터 양, 상태, 접근성 처리가 부족할 때 |
| Visual style | spacing 감각, hierarchy | 원본 브랜드 색상, 과한 gradient, 템플릿 느낌이 강할 때 |
| Motion | entrance, collapse, hover, count-up 방향 | 업무형 화면에서 집중을 방해하거나 800ms를 넘을 때 |
| Copy flow | 문제-해결-증거-CTA 구조 | 한국어 UX 톤과 제품 맥락에 맞지 않을 때 |
| Interaction | keyboard/focus/selected/disabled 모델 | hover-only, mobile fallback 없음, ARIA 부재 |

## 3. Component Migration Brief

외부 레퍼런스를 보고 컴포넌트를 만들기 전 아래 brief를 작성한다.

```md
## Component Migration Brief

- 만들거나 바꿀 컴포넌트:
- 사용될 화면/맥락:
- 사용자 목표:
- 참고 레퍼런스 URL:
- 레퍼런스 역할: 구조 / UX flow / 모션 / 시각 톤 / 접근성 / 코드 패턴
- 가져올 요소:
- 버릴 요소:
- 프로젝트 토큰으로 바꿀 요소:
- variants:
- states:
- responsive:
- accessibility:
- motion:
- 데이터/props contract:
- 완료 기준:
```

## 4. 컴포넌트별 마이그레이션 기준

| 컴포넌트 | 추천 레퍼런스 | 변환 기준 |
| --- | --- | --- |
| Button/IconButton | shadcn/ui, Radix UI, HyperUI | variant와 focus contract를 참고하고 색상은 프로젝트 CTA 기준으로 변경 |
| Card | HyperUI, Kokonut UI, Magic UI | card hierarchy와 CTA 배치만 가져오고 shadow/radius는 정보 밀도에 맞게 축소 |
| Modal/Dialog | Radix UI, Base UI, Animate UI, Motion Primitives | focus, close, overlay, transition contract를 우선 |
| Drawer/Sheet | Radix UI, shadcn/ui, MUI | desktop side panel과 mobile full-width 전환 기준 정의 |
| Table/Data List | MUI, Mantine, Preline UI, Flowbite, Mobbin | 정렬, 필터, row action, empty/error 상태를 우선 |
| Filter/Search Bar | Mobbin, Preline UI, Flowbite, shadcn/ui | active filter count, reset, advanced collapse, URL sync 여부 결정 |
| Tabs/Segmented Control | Radix UI, Base UI, shadcn/ui | 같은 수준의 범주만 탭으로 처리하고 keyboard 이동 보장 |
| Skeleton/Loading | Flowbite, Kokonut UI, Uiverse | 실제 컴포넌트 크기에 맞는 skeleton으로 변환 |
| Toast/Inline Status | shadcn/ui, Kokonut UI, Flowbite | 자동 알림보다 회복 행동과 inline feedback 우선 |
| KPI/Progress | Mantine, MUI, Motion Primitives, Mobbin | 숫자 의미, 기준값, 비교 대상, reveal 강도 정의 |
| Learner Completion | Mobbin, Page Flows, Motion Primitives, shadcn/ui | 완료 메시지, 성장 근거, progress/count-up/badge reveal, 다음 학습 CTA를 우선 |
| Landing Hero | Magic UI, Aceternity UI, Tailwind Plus, Lapa Ninja | hero structure와 CTA/proof 흐름만 가져오고 장식은 축소 |
| Pricing/Checkout | Tailwind Plus, Landingfolio, Page Flows, Mobbin | 가격 비교, 단계, 실패 복구, 결제 신뢰감 우선 |

## 5. 디자인 마이그레이션 결정 트리

```text
레퍼런스가 마음에 든다
  |
  |-- 이 UI가 현재 사용자 목표를 더 빠르게 달성하게 하는가?
  |     |-- 아니오: moodboard/reference로만 남긴다
  |     |-- 예:
  |
  |-- 새 라이브러리 없이 구현 가능한가?
  |     |-- 아니오: 구조만 참고하고 로컬 구현으로 단순화
  |     |-- 예:
  |
  |-- 현재 화면의 정보 밀도와 맞는가?
  |     |-- 아니오: spacing, shadow, motion, image 비중을 줄인다
  |     |-- 예:
  |
  |-- mobile/focus/reduced motion 대응이 가능한가?
  |     |-- 아니오: interaction contract를 다시 설계
  |     |-- 예:
  |
  |-- 프로젝트 토큰으로 재스타일링한다
```

## 6. Before / Reference / After 기록 방식

디자인 마이그레이션 작업에는 가능한 한 세 가지를 남긴다.

| 항목 | 내용 |
| --- | --- |
| Before | 기존 컴포넌트나 현재 상태. 없으면 "신규"로 표시 |
| Reference | URL, 참고한 컴포넌트/섹션, 가져올 요소 |
| After | 적용 후 screenshot 또는 구현 설명 |
| Delta | 원본 대비 줄인 것: 색상, 그림자, 모션, spacing, copy |
| Reason | 왜 이 변환이 사용자 목표에 맞는지 |

예시:

```md
Reference: Aceternity UI hero card stack
가져온 것: 카드가 단계적으로 겹쳐 보이는 구조와 CTA 위치
버린 것: 강한 background gradient, cursor effect, 긴 entrance motion
After: 프로젝트 CTA 색상과 300ms opacity/y transition으로 축소
Reason: 랜딩에서는 시각적 관심을 만들되 학습/관리 화면의 정보 밀도 기준을 해치지 않기 위해
```

## 7. 마이그레이션 완료 기준

| 항목 | 기준 |
| --- | --- |
| Reference trace | 어떤 사이트에서 무엇을 참고했는지 남김 |
| Token fit | 색상, radius, spacing, shadow가 프로젝트 기준으로 변환됨 |
| State coverage | default, hover/focus, disabled, loading/error/empty/success 중 필요한 상태 정의 |
| Responsive | mobile-first, desktop 확장 기준 명확 |
| Accessibility | keyboard, focus, aria-label, contrast 확인 |
| Motion | 화면 성격에 맞는 강도, reduced motion 대응 |
| Dependency | 새 dependency 없음 |
| Copy | 한국어 UX 톤으로 재작성 |
| Visual QA | desktop/mobile에서 텍스트 겹침과 overflow 없음 |

## 8. 문서 사용 순서

수동 경로:

1. `README.md`에서 레퍼런스 사이트를 고른다.
2. 이 문서에서 레퍼런스 역할과 마이그레이션 기준을 정한다.
3. `03_COMPONENT_DESIGN_WORKFLOW.md`의 brief로 컴포넌트 contract를 구체화한다.
4. `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`로 프로젝트 토큰과 코드 패턴에 맞춘다.
5. 모션이 있으면 `01_UI_ANIMATION_ADAPTATION_GUIDE.md`로 강도와 fallback을 확인한다.
6. 화면 구조까지 바뀌면 `02_UX_UI_DECISION_GUIDE.md`로 UX 흐름을 점검한다.

자동 경로(슬래시 커맨드): `07_AUTO_AGENT_COMMANDS.md`의 `/ui-agent:auto` 또는 `/ui-agent:auto-discover`로 시작하면 1~4단계가 자동 분석으로 압축된다. 결과 brief의 모션·UX 항목은 여전히 5~6단계 기준으로 검토한다.

학습 완료/성취 화면(퀴즈 결과, 챕터 완료, 일일 목표 등)을 마이그레이션한다면 위 절차 위에 `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md`의 완료 구조·성장 근거·다음 학습 CTA 기준을 함께 적용한다. 외부 레퍼런스에서 "큰 confetti·full-screen modal"을 가져왔다면 08의 완료 크기별 UX 강도 표로 축소 여부를 판단한다.
