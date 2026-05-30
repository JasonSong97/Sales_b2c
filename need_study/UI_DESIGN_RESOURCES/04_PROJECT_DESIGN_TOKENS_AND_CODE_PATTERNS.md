# Project Design Tokens And Code Patterns

기준일은 `README.md`를 따른다.

이 문서는 외부 UI 레퍼런스를 특정 프로젝트에 마이그레이션할 때, 해당 프로젝트의 목적지 토큰과 코드 패턴을 수집하고 적용하는 템플릿이다. 특정 프로젝트에 고정된 문서가 아니라, 사용자가 프로젝트 경로를 지정하면 그 프로젝트의 `package.json`, styling 설정, 전역 CSS, 디자인 컨벤션을 읽고 아래 항목을 채워 사용하는 방식이다.

## 사용 방식

```text
프로젝트 경로 지정
  -> 스택/버전 확인
  -> 디자인 토큰 위치 확인
  -> 색상/타이포/spacing/radius/shadow/motion 수집
  -> 컴포넌트 코드 패턴 작성
  -> 외부 레퍼런스를 프로젝트 토큰으로 재스타일링
```

## 프로젝트 지정 입력

작업을 시작할 때 아래 정보를 먼저 정한다.

```md
## Target Project

- project path:
- framework:
- styling:
- package manager:
- design convention docs:
- global CSS:
- component directory:
- target screen/component:
```

예시 (가상 프로젝트 형식 — 실제 프로젝트 경로로 교체):

```md
- project path: <대상 프로젝트 절대 경로>
- framework: 예) Vite + React, Next.js, Remix
- styling: 예) Tailwind CSS v4, CSS Modules, styled-components
- design convention docs: 예) DOCS/CONVENTIONS/UI_CONCEPT.md
- global CSS: 예) src/index.css, app/globals.css
- component directory: 예) src/components, src/pages/**/components
```

## 우선 확인할 파일

| 목적 | 확인 후보 |
| --- | --- |
| 패키지/버전 | `package.json`, lockfile |
| Framework | `vite.config.*`, `next.config.*`, `remix.config.*`, `astro.config.*` |
| Tailwind | `tailwind.config.*`, `postcss.config.*`, `src/index.css`, `app/globals.css` |
| CSS 변수 | `:root`, `@theme`, `@layer base`, `tokens.css`, `variables.css` |
| 디자인 문서 | `DOCS/CONVENTIONS/*`, `docs/design*`, `README.md`, Storybook docs |
| 컴포넌트 | `src/components`, feature `components` folders, `app/components` for app-router projects; this repo currently has no src/ui root |
| 아이콘 | `lucide-react`, `react-icons`, `@heroicons/*`, 자체 icon set |
| 모션 | `framer-motion`, CSS animation, Tailwind animation config |

## Stack Snapshot 템플릿

| 분류 | 값 | 확인 파일 |
| --- | --- | --- |
| Framework |  |  |
| React/Vue/Svelte 등 |  |  |
| TypeScript |  |  |
| Styling |  |  |
| Routing |  |  |
| Animation |  |  |
| Icons |  |  |
| Forms |  |  |
| Data fetching |  |  |
| Charts |  |  |
| UI library |  |  |

주의:

- Next.js 프로젝트일 때만 `use client` 필요 여부를 확인한다.
- Vite/SPA 프로젝트에서는 `use client`를 고려하지 않는다.
- 새 UI 라이브러리 설치는 기본 금지다. 명시 요청이 있거나 프로젝트 정책상 허용될 때만 검토한다.

## Token Collection 템플릿

### Color

| 역할 | 프로젝트 토큰/클래스 | 값 | 사용 기준 |
| --- | --- | --- | --- |
| Background |  |  |  |
| Surface/Card |  |  |  |
| Border/Divider |  |  |  |
| Body text |  |  |  |
| Muted text |  |  |  |
| Primary CTA |  |  |  |
| Secondary CTA |  |  |  |
| Accent |  |  |  |
| Success |  |  |  |
| Error |  |  |  |
| Warning |  |  |  |
| Info |  |  |  |

### Typography

| 역할 | 프로젝트 클래스/토큰 | 사용 기준 |
| --- | --- | --- |
| Primary font |  |  |
| Page title |  |  |
| Section title |  |  |
| Body |  |  |
| Meta |  |  |
| Label |  |  |
| Long text |  |  |

### Spacing / Radius / Shadow

| 항목 | 프로젝트 기준 | 사용 기준 |
| --- | --- | --- |
| Page container |  |  |
| Section gap |  |  |
| Card padding |  |  |
| Form gap |  |  |
| Button height |  |  |
| Button radius |  |  |
| Card radius |  |  |
| Modal radius |  |  |
| Border |  |  |
| Soft shadow |  |  |
| Elevated shadow |  |  |

### Motion

| 역할 | 프로젝트 기준 | 코드 표현 |
| --- | --- | --- |
| Press feedback |  |  |
| Hover transition |  |  |
| Modal entrance |  |  |
| Collapse/accordion |  |  |
| Page/section reveal |  |  |
| Result/count-up |  |  |
| Reduced motion |  |  |

권장 기본값이 없으면 아래를 fallback으로 쓴다.

| 토큰 | 시간 | Tailwind 예 | framer-motion 예 |
| --- | --- | --- | --- |
| `instant` | 100ms | `duration-100` | `{ duration: 0.1 }` |
| `quick` | 200ms | `duration-200` | `{ duration: 0.2, ease: 'easeOut' }` |
| `base` | 300ms | `duration-300` | `{ duration: 0.3, ease: 'easeOut' }` |
| `smooth` | 500ms | `duration-500` | `{ duration: 0.5, ease: 'easeOut' }` |
| `slow` | 800ms | `duration-[800ms]` | `{ duration: 0.8, ease: 'easeOut' }` |

## Code Pattern 템플릿

프로젝트마다 아래 패턴을 실제 코드 기준으로 채운다. 외부 레퍼런스를 적용할 때는 이 패턴으로 변환한다.

### Card

```tsx
// Fill with target project classes.
<section className="">
  <h2 className="">Title</h2>
  <p className="">Description</p>
</section>
```

### Primary Button

```tsx
// Fill with target project classes.
<button type="button" className="">
  Action
</button>
```

### Icon Button

```tsx
// Fill with target project classes.
<button type="button" aria-label="Open filters" className="">
  <Icon className="" />
</button>
```

### Input

```tsx
// Fill with target project classes.
<input className="" placeholder="Search" />
```

### Modal Shell

```tsx
// Fill with target project classes.
<section className="">
  <article className="">
    Content
  </article>
</section>
```

### Table/List Shell

```tsx
// Fill with target project classes.
<div className="">
  <table className="">
    <thead />
    <tbody />
  </table>
</div>
```

### Skeleton

```tsx
// Fill with target project classes.
<div className="">
  <div className="" />
</div>
```

## Migration Mapping 템플릿

외부 레퍼런스를 프로젝트 토큰으로 바꿀 때 아래 표를 사용한다.

| 레퍼런스 요소 | 원본 특징 | 프로젝트 변환 |
| --- | --- | --- |
| Color |  |  |
| Radius |  |  |
| Shadow |  |  |
| Spacing |  |  |
| Typography |  |  |
| Motion |  |  |
| Icons |  |  |
| Copy |  |  |
| Responsive |  |  |
| Accessibility |  |  |

## 완성 예제 (형식 기준)

아래는 템플릿을 한 프로젝트에 끝까지 채웠을 때의 **형식과 밀도 기준**이다. 값은 어디서나 통하는 일반 Tailwind 조합으로만 작성했다 — **값을 복사하지 말고, 빈칸이 어디까지 사라져야 "사용 가능한 토큰 문서"가 되는지의 형식만 본다**. 프로젝트별 brand 색상, custom font, custom keyframe은 대상 프로젝트의 `tailwind.config.*`와 global CSS에서 수집해 같은 자리에 적어 넣는다.

가정한 가상 프로젝트 스택: **Vite + React 18 + Tailwind CSS v4 SPA**. Next.js/Remix/CSS-Modules 프로젝트는 같은 표를 그 스택의 어휘로 다시 쓴다.

### Target Project (채움 형식)

```md
- project path: <대상 프로젝트 절대 경로>
- framework: Vite + React 18
- styling: Tailwind CSS v4
- package manager: <npm | pnpm | yarn>
- design convention docs: <경로 또는 "없음 — global CSS가 사실상의 컨벤션">
- global CSS: src/index.css
- component directory: src/components, src/pages/**/components
- target screen/component: <화면/컴포넌트 이름>
```

### Stack Snapshot (채움 형식)

| 분류 | 값 | 확인 파일 |
| --- | --- | --- |
| Framework | Vite + React 18 | `package.json`, `vite.config.*` |
| TypeScript | <버전 또는 "사용 안 함"> | `package.json` |
| Styling | Tailwind CSS v4 (+ 플러그인 목록) | `tailwind.config.*`, global CSS |
| Routing | <`react-router` / Next 내장 / 기타> | `package.json` |
| Animation | `framer-motion` <버전> + Tailwind keyframes | `package.json`, `tailwind.config.*` |
| Icons | <`lucide-react` 등 단일화 목록> | `package.json` |
| Forms | <`react-hook-form` + validator 등> | `package.json` |
| Data fetching | <`@tanstack/react-query` + HTTP 클라이언트> | `package.json` |
| Charts | <`recharts` 등 또는 "없음"> | `package.json` |
| UI library | <없음 / shadcn 등 — 신규 추가 금지> | — |

주의:

- Vite SPA이면 `use client` 지시문은 사용하지 않는다. Next.js이면 컴포넌트마다 검토.
- 같은 역할의 라이브러리가 둘 이상이면(예: `lucide-react` + `react-icons`) 신규 코드 기준을 명시한다.
- 새 UI 라이브러리 설치는 기본 금지. 패턴만 참고하고 자체 컴포넌트로 구현한다.

### Token Collection (채움 형식)

#### Color

| 역할 | 프로젝트 토큰/클래스 | 값 | 사용 기준 |
| --- | --- | --- | --- |
| Background | `bg-white`, `bg-gray-50` | `#ffffff`, `#F9FAFB` | 페이지/카드 배경 |
| Surface/Card | `bg-white` + `border-gray-100` + `shadow-sm` | — | 기본 카드 |
| Border/Divider | `border-gray-100`, `border-gray-200` | — | 카드/입력 |
| Body text | `text-gray-800` | `#1F2937` | 본문 |
| Muted text | `text-gray-500` | `#6B7280` | 보조 설명, meta |
| Primary CTA | `bg-blue-600 text-white` | `#2563EB` | 주요 버튼 |
| Secondary CTA | `<프로젝트 brand secondary>` | `<#hex>` | 보조 액션 |
| Accent / Focus | `<프로젝트 brand accent>` | `<#hex>` | focus ring, hint 강조 |
| Success | `bg-green-50 text-green-700` | — | toast/inline success |
| Error | `bg-red-50 text-red-700` | — | validation/error inline |
| Warning | `bg-yellow-50 text-yellow-700` | — | 주의 안내 |
| Info | `bg-blue-50 text-blue-700` | — | 정보 안내 |

> 색상 칩 표기 예: `bg-blue-600` ▮ `#2563EB` / `<custom brand>` ▮ `<#hex>` / `<custom accent>` ▮ `<#hex>`. 실제 프로젝트의 brand/accent 자리에 그 프로젝트 `tailwind.config.*` `theme.extend.colors`의 값을 적는다.

> **회색 계열 컨텍스트 분리 (cy_conversation 프로젝트 결정사항, 2026-05-18)**
> - **유저 영역** (`/mypage/*`, `/article/*`, `/article-home` 등 학습자 화면): **`gray-*` 통일**.
>   본문 `text-gray-800`, 메타 `text-gray-500`, 보더 `border-gray-100/200`. 페이지 배경은 `bg-white` 또는 `bg-gray-50`.
> - **매니저 영역** (`/mng/*`): **`slate-*` 통일**.
>   상담 리포트·sticky 컨텍스트 바·playbook 등 정보 밀도가 더 높은 운영 UI는 slate 계열을 유지해 정보 위계를 약간 더 강조한다.
> - **혼용 금지**: 같은 페이지/컴포넌트 안에서 `gray-*`와 `slate-*`를 함께 쓰지 않는다. 공용 컴포넌트(`src/components/*`)는 **유저 톤(`gray-*`)을 기본값**으로 만들고, 매니저 단에서 필요하면 별도 variant prop으로 받는다.
> - **마이그레이션 기록**: `DOCS/FEATURE_SPECS/User/Design/PLAN_MyClassPages_Unification.md`의 Phase 6 산출물.

#### Typography

| 역할 | 프로젝트 클래스/토큰 | 사용 기준 |
| --- | --- | --- |
| Primary font | `<프로젝트 font 클래스>` | 본문 기본 |
| Display 강조 | `<bold 변형>` | 페이지 타이틀, 강조 reveal |
| Page title | `text-2xl lg:text-3xl <bold>` | 페이지 헤더 |
| Section title | `text-lg <bold>` | 섹션 헤더 |
| Body | `text-base <primary> text-gray-800` | 본문 |
| Meta | `text-sm text-gray-500` | 날짜, 보조 정보 |
| Label | `text-sm <bold> text-gray-700` | 폼 label |
| Long text | `prose prose-sm max-w-none` (`@tailwindcss/typography` 사용 시) | 마크다운/긴 글 |

> custom font가 있으면 (예: Pretendard, Inter 등) `<프로젝트 font 클래스>` 자리에 그 프로젝트의 `font-*` 클래스를 적는다. 없으면 시스템 font stack을 그대로 둔다.

#### Spacing / Radius / Shadow

| 항목 | 프로젝트 기준 | 사용 기준 |
| --- | --- | --- |
| Page container | `mx-auto w-full max-w-screen-lg px-4 lg:px-6` | 모든 페이지 |
| Section gap | `gap-4 lg:gap-6` | 섹션 간 |
| Card padding | `p-4` | 기본 카드 |
| Form gap | `flex flex-col gap-3` | 입력 그룹 |
| Button height | `min-h-[44px]` | 모바일 터치 타깃 (전역 규칙) |
| Button radius | `rounded-lg` | 기본 버튼 |
| Card radius | `rounded-2xl` | 기본 카드 |
| Modal radius | `rounded-2xl` | 모달 컨테이너 |
| Border | `border border-gray-100` (카드), `border border-gray-200` (입력) | — |
| Soft shadow | `shadow-sm` | 기본 카드 |
| Elevated shadow | `shadow-md` 또는 프로젝트 custom shadow | 강조 카드, 모달 |

#### Motion

| 역할 | 프로젝트 기준 | 코드 표현 |
| --- | --- | --- |
| Press feedback | `active:scale-95 duration-100` | 모든 버튼 |
| Hover transition | `transition-colors duration-200` | hover/focus 색상 |
| Modal entrance | `<프로젝트 entrance animation>` (0.2s ease-out) | 하단 시트/센터 모달 |
| Collapse/accordion | `<프로젝트 collapse animation>` (0.3~0.5s) | FAQ, 보조 정보 |
| Page/section reveal | `<프로젝트 reveal animation>` (0.5s ease-out) | 진입 시 1회 |
| Result/count-up | `<프로젝트 score animation>` (0.6~0.8s `cubic-bezier(...)`) | 결과/성과 화면 only |
| Reduced motion | `motion-reduce:animate-none motion-reduce:transition-none` | reveal/repeat/장식 모션에 부착 |

> 프로젝트의 `tailwind.config.*` `theme.extend.animation`에 들어 있는 custom keyframe은 **사용 범위(허용 화면)를 같이 명시**한다. 예: "축하/perfect 효과는 결과 화면 한정, 일반 리스트/폼/모달 금지". 범위를 적지 않으면 장식 keyframe이 업무 화면으로 새어 나간다.

### Code Pattern (채움 형식)

#### Card

```tsx
<section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
  <h2 className="text-lg font-bold text-gray-800">Title</h2>
  <p className="mt-2 text-sm text-gray-500">Description</p>
</section>
```

#### Primary Button

```tsx
<button
  type="button"
  className="min-h-[44px] rounded-lg bg-blue-600 px-4 text-white font-bold transition-colors duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 motion-reduce:active:scale-100"
>
  Action
</button>
```

#### Icon Button

```tsx
<button
  type="button"
  aria-label="Open filters"
  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-colors duration-200 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
>
  <Filter className="h-5 w-5" />
</button>
```

#### Input

```tsx
<input
  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
  placeholder="Search"
/>
```

#### Modal Shell

```tsx
<section className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6 motion-reduce:bg-black/60">
  <article className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-md sm:rounded-2xl motion-reduce:animate-none">
    Content
  </article>
</section>
```

#### Table/List Shell

```tsx
<div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
  <table className="min-w-[640px] w-full text-left text-sm">
    <thead className="bg-gray-50 text-gray-500">
      {/* th: px-4 py-3 font-bold */}
    </thead>
    <tbody className="divide-y divide-gray-100">
      {/* td: px-4 py-3 text-gray-800 */}
    </tbody>
  </table>
</div>
```

#### Skeleton

```tsx
<div className="space-y-3" aria-hidden="true">
  <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse motion-reduce:animate-none" />
  <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse motion-reduce:animate-none" />
</div>
```

> 프로젝트에 custom font 클래스(예: `font-<프로젝트 display 클래스>`)나 custom shadow(예: `shadow-<프로젝트 elevated 클래스>`)가 있으면 위 스니펫의 `font-bold` / `shadow-md` 자리를 그것으로 치환한다. 클래스 이름은 프로젝트별로 다르지만 **자리(역할)와 수치(44px 터치, 200ms hover 등)는 동일**해야 한다.

### Migration Mapping (채움 형식 — 일반 hero → 결과 카드 변환 예시)

| 레퍼런스 요소 | 원본 특징 | 프로젝트 변환 |
| --- | --- | --- |
| Color | 강한 violet/teal gradient | `bg-white` + 프로젝트 brand 포인트 1개로 축소 |
| Radius | `rounded-3xl` | `rounded-2xl` |
| Shadow | 큰 blur shadow | `shadow-md` 또는 프로젝트 custom shadow |
| Spacing | 큰 hero padding (`py-32`) | `p-4 sm:p-6` |
| Typography | 대형 display font | `text-2xl lg:text-3xl <bold 변형>` |
| Motion | 카드 stack + cursor effect + 1.5s reveal | 결과 한정 reveal(0.6~0.8s) only, `motion-reduce:animate-none` fallback |
| Icons | 자체 SVG | 프로젝트 표준 icon 라이브러리 (예: `lucide-react`) |
| Copy | 영어 마케팅 카피 | 한국어 제품 톤 (사용자 행동을 명사가 아닌 동사로) |
| Responsive | desktop 우선 | mobile 우선, `sm:` / `lg:` 단계 확장 |
| Accessibility | hover-only emphasis | `focus-visible` 추가, 상태 reveal에 `aria-live="polite"` |

> 새 프로젝트는 위 8개 섹션(Target / Stack / Color / Typo / Spacing+Radius+Shadow / Motion / Code Pattern / Migration Mapping)을 **자기 프로젝트 값으로 모두 채워야** 04 문서를 "사용 가능" 상태로 본다. 비어 있는 칸이 있으면 그 토큰은 합의된 게 아니라는 신호다.

## Reduced Motion 구현 패턴

`prefers-reduced-motion` 대응은 강조만 반복되고 코드 예시가 비어 있던 지점이다. 아래 세 가지 중 하나를 사용한다.

### A) Tailwind `motion-reduce:` variant (기본 권장)

가장 가볍다. Tailwind 클래스 옆에 `motion-reduce:` prefix로 fallback을 부착한다. 아래 `animate-<프로젝트 reveal>` 자리는 대상 프로젝트의 `tailwind.config.*` `theme.extend.animation`에 등록된 reveal 클래스 이름으로 치환한다 (Tailwind 기본에는 reveal animation이 없다).

```tsx
<article
  className="
    rounded-2xl bg-white p-4 shadow-sm
    animate-<프로젝트 reveal> transition-transform duration-300
    hover:-translate-y-0.5
    motion-reduce:animate-none
    motion-reduce:transition-none
    motion-reduce:hover:translate-y-0
  "
>
  Card
</article>
```

### B) framer-motion `useReducedMotion` 훅

`framer-motion`을 쓰는 reveal/count-up/layout 모션은 훅으로 분기한다.

```tsx
import { motion, useReducedMotion } from 'framer-motion';

export function ScoreReveal({ value }: { value: number }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.span
      role="status"
      aria-live="polite"
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
      }
      className="text-3xl font-bold text-blue-600"
    >
      {value}
    </motion.span>
  );
}
```

### C) 전역 CSS fallback (장식 keyframe 일괄 차단)

`tailwind.config.*`에 등록된 무한 루프 장식 keyframe(예: 컨페티/글로우/링/반짝임 같은 축하/강조 효과)은 한 곳에서 일괄 차단한다. 대상 프로젝트의 global CSS(`src/index.css`, `app/globals.css` 등)에 추가:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

부착 기준:

| 모션 유형 | fallback 방식 |
| --- | --- |
| hover/색상 (`duration-200`) | A (Tailwind variant). 굳이 끄지 않아도 됨 |
| 진입 reveal (프로젝트 custom reveal/slide-in animation) | A 필수 |
| 점수/성과 reveal (count-up, score pop 류 custom keyframe) | B (훅으로 분기) |
| 무한 루프 장식 (축하/글로우/shimmer 류 custom keyframe) | A 또는 C로 반드시 차단 |
| 모달 entrance | A로 즉시 표시 (`motion-reduce:animate-none`) |

> hover/focus 시각 신호 자체는 끄지 않는다. 끄는 건 *움직임*이지 *상태 표시*가 아니다.

## 적용 우선순위

1. 외부 레퍼런스에서 가져올 디자인 의도와 interaction contract
2. 대상 프로젝트에서 수집한 토큰과 코드 패턴
3. 대상 프로젝트의 디자인 컨벤션과 접근성 기준
4. 필요한 경우 기존 local pattern과 충돌 여부 확인
5. 새 abstraction

새 abstraction은 중복이 반복되고, 책임이 명확하며, 여러 화면에서 재사용 가능성이 확인될 때만 만든다.
