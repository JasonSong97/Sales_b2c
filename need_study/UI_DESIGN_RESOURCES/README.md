# UI Design Resources

문서 세트 기준일: `2026-05-15` (이 세트 전체의 단일 기준일. 다른 문서들은 이 날짜를 따른다.)

이 문서는 React/Tailwind 생태계의 컴포넌트 사이트와 UI/UX 레퍼런스 사이트를 중심으로 정리한다. 목적은 새 화면을 만들 때 참고처를 빠르게 고르고, 무분별한 시각 효과 복붙 대신 제품 맥락에 맞는 UI 패턴을 선택하는 것이다. React/Tailwind가 아닌 프로젝트에서는 코드 자체가 아니라 구조, UX 흐름, 상태 모델, 시각 위계를 추출한 뒤 대상 프로젝트의 컴포넌트 문법과 스타일 시스템으로 재구현한다.

## 빠른 선택 가이드

| 상황 | 우선 참고 |
| --- | --- |
| React + Tailwind 앱 화면을 빠르게 만든다 | shadcn/ui, Preline UI, Flowbite, HyperUI |
| 랜딩페이지나 마케팅 섹션을 만든다 | Aceternity UI, Magic UI, Tailwind Plus, Lapa Ninja |
| 애니메이션과 마이크로 인터랙션이 중요하다 | React Bits, Motion Primitives, Animate UI, Aceternity UI |
| 실제 서비스의 UX 흐름을 보고 싶다 | Mobbin, Page Flows |
| 학습자가 완료할 때마다 성취감을 느끼게 한다 | Mobbin, Page Flows, Motion Primitives, shadcn/ui |
| 비주얼 트렌드와 고감도 웹 디자인을 찾는다 | Awwwards, Land-book, Dribbble, Behance |
| 디자인 시스템 기반으로 오래 운영할 앱을 만든다 | shadcn/ui, Radix UI, Base UI, Mantine, MUI |

## 보조 문서

| 문서 | 용도 |
| --- | --- |
| `00_START_GUIDE.md` | 사용자 답변을 받아 대상 프로젝트, 작업 유형, 레퍼런스 의도, 산출물을 정리하는 시작 질문지 |
| `01_UI_ANIMATION_ADAPTATION_GUIDE.md` | 외부 UI/애니메이션 레퍼런스를 대상 프로젝트의 구현 기준으로 변환할 때 사용하는 적용 가이드 |
| `02_UX_UI_DECISION_GUIDE.md` | 외부 UI/UX 레퍼런스를 화면 구조, 정보 밀도, 상태 설계, 접근성 기준으로 평가할 때 사용하는 판단 가이드 |
| `03_COMPONENT_DESIGN_WORKFLOW.md` | 특정 컴포넌트를 새로 만들거나 변경할 때 사용하는 brief, 작업 절차, 완료 기준 |
| `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md` | 특정 프로젝트 경로를 기준으로 토큰, 스택 버전, 코드 패턴을 수집하는 템플릿 |
| `05_UI_DESIGN_MIGRATION_PLAYBOOK.md` | 외부 사이트 레퍼런스를 새 컴포넌트/UI 디자인으로 마이그레이션하는 절차와 판단 기준 |
| `06_AGENT_GENERATION_GUIDE.md` | 시작 질문지 답변을 바탕으로 UI/UX 마이그레이션 AGENT 프롬프트를 생성하는 규칙 |
| `07_AUTO_AGENT_COMMANDS.md` | 프로젝트 자동 분석 후 AGENT 생성/구현/리뷰까지 시작하는 명령어 템플릿 |
| `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md` | 학생/학습자가 완료 경험에서 성취감과 다음 학습 동기를 느끼게 하는 UX 기준 |

## 최소 경로 (한 컴포넌트만 만들 때)

대부분의 작은 작업은 아래 3개 문서만으로 끝난다.

```text
00_START_GUIDE.md   (intake — 무엇을 만들지)
  -> 06_AGENT_GENERATION_GUIDE.md   (mapping — 어떤 레퍼런스/문서를 쓸지)
  -> 03_COMPONENT_DESIGN_WORKFLOW.md   (brief — 컴포넌트 contract와 완료 기준)
```

확장 조건:

- 외부 사이트 코드/구조를 깊게 가져온다 -> `05_UI_DESIGN_MIGRATION_PLAYBOOK.md` 추가
- 프로젝트 토큰을 새로 수집해야 한다 -> `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md` 추가
- 모션이 들어간다 -> `01_UI_ANIMATION_ADAPTATION_GUIDE.md` 추가
- 화면 구조/UX 흐름까지 바뀐다 -> `02_UX_UI_DECISION_GUIDE.md` 추가
- 학습 완료 후 성취감/재방문 동기를 설계한다 -> `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md` 추가

리뷰만 하는 경우: `02` 체크리스트 + `03` PR 리뷰 체크리스트 두 곳만 본다.

## 전체 작업 흐름 (대규모 리디자인/신규 마이그레이션)

1. `00_START_GUIDE.md`의 질문에 답해 대상 프로젝트와 작업 목표를 정한다.
2. `06_AGENT_GENERATION_GUIDE.md`로 답변을 AGENT 프롬프트로 변환한다.
3. `README.md`에서 참고 사이트와 레퍼런스 성격을 고른다.
4. `05_UI_DESIGN_MIGRATION_PLAYBOOK.md`에서 레퍼런스에서 가져올 것과 버릴 것을 분리한다.
5. `03_COMPONENT_DESIGN_WORKFLOW.md`의 Component Brief를 채우고 states/variants/accessibility를 확정한다.
6. `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`를 대상 프로젝트에 맞게 채운 뒤 프로젝트 톤에 맞게 재스타일링한다.
7. 모션이 필요하면 `01_UI_ANIMATION_ADAPTATION_GUIDE.md`로 강도와 reduced motion 기준을 확인한다.
8. 화면 구조나 UX 흐름이 바뀌면 `02_UX_UI_DECISION_GUIDE.md`로 정보구조와 상태 설계를 검토한다.
9. 학생/학습자의 완료 경험을 다루면 `08_LEARNER_ACHIEVEMENT_UX_GUIDE.md`로 완료 메시지, 성장 근거, 다음 학습 CTA를 설계한다.

자동으로 시작하려면 `07_AUTO_AGENT_COMMANDS.md`의 `/ui-agent:auto` 또는 `/ui-agent:auto-discover` 명령어 템플릿을 사용한다.

## 대상 프로젝트 지정 방식

이 문서 세트는 특정 프로젝트에 고정하지 않는다. 작업을 시작할 때 대상 프로젝트를 먼저 지정하고, 그 프로젝트의 스택과 토큰을 기준으로 외부 레퍼런스를 변환한다.

```md
## Target Project

- project path:
- framework:
- styling:
- design convention docs:
- global CSS:
- component directory:
- target screen/component:
- reference sites:
```

예를 들어 React + Tailwind 프로젝트면 shadcn/ui, Preline UI, Flowbite의 구조를 참고할 수 있고, Vue/Nuxt나 다른 스택이면 같은 레퍼런스에서 구조와 UX 의도만 가져온 뒤 해당 프로젝트의 컴포넌트 문법과 스타일 시스템으로 재구현한다.

## 문서 세트의 역할과 한계

| 항목 | 평가 |
| --- | --- |
| 새 화면 컨셉 잡기 | 적합. 사이트 카탈로그와 평가축을 먼저 사용 |
| 컴포넌트 디자인 결정 | 적합. `03`, `04`, `05`를 함께 사용해야 함 |
| 실제 CSS/JSX 구현 | 보조 가능. 최종 구현은 실제 코드의 local pattern을 우선 |
| PR 리뷰 체크 | 적합. 체크리스트와 정량 기준 사용 |
| 디자인 일관성 보장 | 부분 적합. 토큰과 마이그레이션 기준은 스냅샷이므로 코드/브랜드 기준 변경 시 갱신 필요 |

이 문서 세트는 디자인 판단과 구현 기준을 돕지만, 실제 UI 품질은 before/reference/after 확인, mobile/desktop 검증, 상태별 UI 확인까지 완료해야 판단할 수 있다.

## React / Tailwind 컴포넌트 중심

| 사이트 | 링크 | 성격 | 적합한 용도 | 주의점 |
| --- | --- | --- | --- | --- |
| React Bits | https://reactbits.dev/ | 애니메이션 React 컴포넌트 모음 | 텍스트 효과, 커서 효과, 인터랙션, 크리에이티브 섹션 | 시각 효과가 강하므로 업무형 화면에는 제한적으로 사용 |
| Aceternity UI | https://ui.aceternity.com/ | Tailwind CSS, Framer Motion 기반 컴포넌트와 블록 | SaaS 랜딩, 히어로, 카드, 배경 효과, 포트폴리오 | 모션과 장식 요소를 제품 톤에 맞게 줄여야 할 수 있음 |
| Magic UI | https://magicui.design/docs | 복사해서 쓰는 React 컴포넌트, 블록, 템플릿 | 랜딩페이지, 마케팅 페이지, 소셜 proof, 가격표 | 앱 내부 운영 화면보다는 외부 노출 페이지에 더 적합 |
| shadcn/ui | https://ui.shadcn.com/ | 오픈 코드 방식의 React 컴포넌트 기반 | 커스터마이즈 가능한 앱 UI, 디자인 시스템, 내부 관리도구 | 설치형 라이브러리가 아니라 코드 소유 방식이므로 업데이트 관리 필요 |
| Motion Primitives | https://motion-primitives.com/ | 모션 중심 UI 컴포넌트와 패턴 | 세련된 애니메이션, 전환, 인터랙션 실험 | 접근성, reduced motion 대응을 확인해야 함 |
| Animate UI | https://animate-ui.com/docs | Tailwind CSS, Motion 기반 애니메이션 컴포넌트 배포 | shadcn 스타일 프로젝트에 모션 추가 | 기본 컴포넌트보다 애니메이션 레이어가 늘어남 |
| Kokonut UI | https://kokonutui.com/ | Tailwind CSS, shadcn/ui, Motion 기반 컴포넌트 | 모던한 앱/웹 컴포넌트, 빠른 UI 프로토타입 | pro 컴포넌트와 무료 컴포넌트 구분 필요 |
| 21st.dev | https://21st.dev/ | 커뮤니티 기반 React/Tailwind 컴포넌트와 AI UI 빌더 | 최신 커뮤니티 UI 탐색, AI 에이전트용 참고 컴포넌트 | 품질 편차가 있을 수 있어 코드 검토 필요 |
| Uiverse | https://uiverse.io/ | 커뮤니티 오픈소스 UI 요소 | 버튼, 로더, 카드, CSS 효과, 작은 UI 조각 | 제품 일관성보다 개별 효과 중심인 경우가 많음 |
| HyperUI | https://www.hyperui.dev/ | 무료 Tailwind CSS 컴포넌트 | 마케팅, 이커머스, 관리자 화면의 기본 섹션 | 복잡한 상호작용 컴포넌트는 별도 구현 필요 |
| Preline UI | https://www.preline.co/ | Tailwind CSS 컴포넌트, 블록, 플러그인, 템플릿 | 대규모 Tailwind 프로젝트, 폼, 테이블, 네비게이션 | JS 플러그인 도입 범위를 명확히 해야 함 |
| Flowbite | https://flowbite.com/docs/getting-started/introduction/ | Tailwind CSS 기반 UI 라이브러리 | 폼, 모달, 드롭다운, datepicker, 대시보드 | Flowbite 스타일이 강하게 남지 않도록 테마 조정 필요 |
| daisyUI | https://daisyui.com/ | Tailwind CSS 컴포넌트 클래스 플러그인 | 빠른 프로토타입, 테마 기반 UI, 간단한 앱 | 커스텀 디자인 시스템과 충돌하지 않도록 클래스 정책 필요 |
| Tailwind Plus | https://tailwindcss.com/plus | Tailwind Labs 공식 유료 컴포넌트와 템플릿 | 상용 품질 랜딩, 앱 UI, 이커머스 섹션 | 라이선스와 재배포 제한 확인 필요 |

## 디자인 시스템 / 대형 UI 라이브러리

이 그룹은 그대로 설치하거나 스타일을 복붙하기보다 접근성 contract, 상태 모델, 데이터 밀도, 엔터프라이즈 화면 패턴을 추출하는 기준으로 사용한다. 대상 프로젝트가 React/Tailwind가 아니어도 구조와 상호작용 규칙은 참고할 수 있다.

| 사이트 | 링크 | 성격 | 적합한 용도 | 주의점 |
| --- | --- | --- | --- | --- |
| Radix UI | https://www.radix-ui.com/primitives/docs/overview/introduction | 무스타일 접근성 프리미티브 | Dialog, Popover, Tabs, Select처럼 keyboard/focus/aria contract가 중요한 컴포넌트 | 새 의존성 도입보다 상태·접근성 모델 참고를 우선 |
| Base UI | https://base-ui.com/ | 무스타일 접근성 React 컴포넌트 | 자체 디자인 시스템을 만들 때 컴포넌트 상태와 interaction contract 참고 | 스타일과 구현은 대상 프로젝트 방식으로 재작성 |
| Mantine | https://mantine.dev/ | React 컴포넌트와 hooks 라이브러리 | 제품형 웹앱, 대시보드, 폼, 설정 화면의 UX 패턴 참고 | Tailwind 프로젝트에 그대로 섞으면 스타일 정책이 분산될 수 있음 |
| MUI | https://mui.com/ | Material Design 기반 React 컴포넌트 | B2B/admin/data-heavy UI, table/filter/form 밀도와 엔터프라이즈 패턴 참고 | Material look을 그대로 가져오면 브랜드 톤과 충돌할 수 있음 |

## UI/UX 레퍼런스와 영감 사이트

| 사이트 | 링크 | 성격 | 적합한 용도 | 주의점 |
| --- | --- | --- | --- | --- |
| Mobbin | https://mobbin.com/ | 실제 모바일/웹 앱 화면과 패턴 라이브러리 | 온보딩, 검색, 결제, 설정, 대시보드 패턴 분석 | 유료 기능 비중이 높을 수 있음 |
| Page Flows | https://pageflows.com/ | 실제 서비스의 사용자 플로우 녹화와 스크린 | 가입, 업그레이드, 결제, 취소, 알림 흐름 분석 | 단일 화면보다 전체 플로우 분석용으로 사용 |
| Awwwards | https://www.awwwards.com/ | 수상작 중심 웹 디자인 갤러리 | 고감도 웹, 인터랙션, 브랜딩, 포트폴리오 참고 | 실험적 사이트가 많아 실무 UX에 그대로 적용하지 않기 |
| Dribbble | https://dribbble.com/ | 디자이너 샷과 콘셉트 UI 쇼케이스 | 비주얼 방향, 카드, 앱 UI, 아이콘 스타일 탐색 | 실제 제품 제약이 빠진 콘셉트가 많음 |
| Behance | https://www.behance.net/ | 포트폴리오, 브랜딩, 케이스스터디 플랫폼 | 브랜드 시스템, 제품 디자인 과정, 비주얼 정리 참고 | 긴 케이스스터디에서 실제 UI 근거를 분리해서 봐야 함 |
| Lapa Ninja | https://www.lapa.ninja/ | 랜딩페이지 디자인 모음 | SaaS, AI, 스타트업 랜딩 구조와 섹션 구성 | 최신 트렌드 위주라 제품 카피는 별도 검증 필요 |
| Land-book | https://land-book.com/ | 웹사이트 디자인 갤러리 | 브랜드 사이트, 포트폴리오, 랜딩 참고 | 화면 단위 참고에 가깝고 UX 흐름 분석은 제한적 |
| Landingfolio | https://www.landingfolio.com/ | 랜딩페이지, 템플릿, 컴포넌트 영감 | 히어로, 가격표, CTA, 소셜 proof 구성 | 템플릿 느낌이 강해질 수 있으므로 차별화 필요 |

## 실무 사용 절차

1. 화면 목적을 먼저 정한다.
   예: 관리자가 반복적으로 보는 대시보드인지, 외부 사용자를 설득하는 랜딩페이지인지, 가입 전환을 높이는 온보딩인지 구분한다.

2. 레퍼런스는 최소 3개만 고른다.
   한 화면에 너무 많은 사이트의 스타일을 섞으면 제품 정체성이 흐려진다. 같은 목적의 레퍼런스 2개와 반대 사례 1개 정도가 적당하다.

3. 컴포넌트 출처와 역할을 분리한다.
   예: 기본 폼과 테이블은 shadcn/ui 또는 Preline UI, 히어로 애니메이션은 Aceternity UI, 실제 UX 흐름 검증은 Mobbin 또는 Page Flows처럼 나눈다.

4. 복붙 후에는 제품 기준으로 줄인다.
   장식, 애니메이션, 그림자, 배경 효과는 먼저 제거하거나 약하게 만든 뒤 필요한 부분만 다시 추가한다.

5. 접근성과 반응형을 마지막이 아니라 초기에 확인한다.
   키보드 조작, focus 상태, reduced motion, 모바일 텍스트 줄바꿈, 터치 타깃 크기, 대비를 구현 중에 같이 확인한다.

## 추천 조합

| 프로젝트 유형 | 추천 조합 |
| --- | --- |
| SaaS 랜딩페이지 | Lapa Ninja 또는 Landingfolio로 구조 확인, Magic UI 또는 Aceternity UI로 섹션 구현, Awwwards로 비주얼 톤 참고 |
| 관리자 대시보드 | Mobbin으로 실제 앱 패턴 확인, shadcn/ui 또는 Preline UI로 구현, Radix UI로 접근성 보강 |
| AI 제품 웹앱 | 21st.dev와 Aceternity UI로 최신 패턴 확인, shadcn/ui로 기본 UI 구성, Motion Primitives로 필요한 모션만 추가 |
| 빠른 MVP | HyperUI 또는 daisyUI로 프로토타입, 이후 shadcn/ui 또는 Mantine으로 운영 가능한 구조 정리 |
| 브랜드/포트폴리오 사이트 | Land-book, Awwwards, Behance로 톤 탐색, React Bits와 Motion Primitives로 포인트 인터랙션 구현 |

## 코드 적용 체크리스트

- 라이선스와 유료/무료 범위를 확인했는가?
- 외부 컴포넌트 코드가 대상 프로젝트의 React/Vue/Svelte, framework, styling 버전과 맞는가?
- Next.js 프로젝트에 적용하는 경우에만 `use client` 필요 여부를 확인했는가?
- 모션 컴포넌트에 reduced motion 대응이 있는가?
- keyboard navigation, focus ring, aria 속성이 유지되는가?
- 색상, radius, spacing, shadow가 기존 디자인 토큰과 맞는가?
- 모바일에서 텍스트와 버튼이 겹치지 않는가?
- 컴포넌트가 한 화면의 정보 밀도를 해치지 않는가?

## 유지보수 메모

- 이 목록은 UI 트렌드와 라이브러리 운영 상태에 따라 바뀐다.
- 새 프로젝트에 적용하기 전에는 공식 문서의 최신 설치 방식과 라이선스를 다시 확인한다.
- 특정 컴포넌트를 도입할 때는 원본 링크를 이슈나 PR 설명에 남긴다.
- 디자인 레퍼런스는 그대로 베끼는 용도가 아니라 구조, 밀도, 상호작용, 카피 흐름을 판단하는 기준으로 사용한다.
- 외부 사이트 목록은 최소 반기 1회, 프로젝트 토큰 문서는 `package.json`, `tailwind.config.*`, 브랜드 기준이 바뀔 때 갱신한다.
- `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`는 대상 프로젝트별로 채우는 템플릿이므로 오래된 내용이 의심되면 실제 프로젝트 파일을 우선한다.
