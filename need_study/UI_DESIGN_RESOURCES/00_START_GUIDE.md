# UI/UX Design Agent Start Guide

기준일은 `README.md`를 따른다.

이 문서는 새 컴포넌트 생성, 기존 UI 디자인 변경, 외부 디자인 레퍼런스 마이그레이션을 시작하기 전에 사용자에게 받을 정보를 정리하는 시작 질문지다. 답변이 채워지면 `06_AGENT_GENERATION_GUIDE.md`를 기준으로 적절한 UI/UX 레퍼런스, 디자인 기준, 모션 강도, 컴포넌트 brief를 조합해 AGENT 프롬프트를 만들 수 있다.

## 빠른 시작

시간이 없으면 아래 필수 질문만 먼저 채운다.

```md
## UI/UX Agent Intake

- project path:
- target screen/component:
- work type: 신규 생성 / 리디자인 / 외부 레퍼런스 마이그레이션 / 리뷰 / 구현
- target user:
- user goal:
- UI type: 앱 화면 / 관리자 / B2B / SaaS / 대시보드 / 학습 / 학습 완료 / 성취 / 랜딩 / 결제 / 폼 / 테이블 / 카드 / 콘텐츠 탐색 / 모달 / 모션 중심 / 기타
- reference sites or URLs:
- desired tone:
- must keep:
- must avoid:
- output needed: 디자인 방향 / 컴포넌트 brief / 구현 코드 / PR 리뷰 체크리스트 / AGENT 프롬프트
```

## 전체 질문지

### 1. 대상 프로젝트

| 질문 | 답변 |
| --- | --- |
| 프로젝트 경로는 어디인가? |  |
| framework는 무엇인가? | React/Vite, Next.js, Vue/Nuxt, Svelte, 기타 |
| styling 방식은 무엇인가? | Tailwind, CSS Modules, styled-components, MUI, CSS, 기타 |
| 디자인 컨벤션 문서가 있는가? |  |
| 전역 CSS 또는 token 파일은 어디인가? |  |
| 컴포넌트 폴더는 어디인가? |  |

### 2. 작업 목표

| 질문 | 답변 |
| --- | --- |
| 만들거나 바꿀 대상은 무엇인가? | 화면 / 섹션 / 컴포넌트 / 상태 UI / 모션 |
| 작업 유형은 무엇인가? | 신규 생성 / 리디자인 / 외부 레퍼런스 마이그레이션 / 기존 UI 정리 / 리뷰 |
| 사용자가 이 UI에서 끝내야 하는 일은 무엇인가? |  |
| 현재 문제가 있다면 무엇인가? | 복잡함 / 촌스러움 / 정보 부족 / CTA 불명확 / 모바일 깨짐 / 접근성 부족 / 기타 |
| 가장 중요한 성공 기준은 무엇인가? | 전환 / 빠른 탐색 / 신뢰감 / 학습 집중 / 성취감 / 재방문 / 데이터 비교 / 브랜드 인상 / 기타 |

### 3. 화면/컴포넌트 유형

| 질문 | 답변 |
| --- | --- |
| UI 성격은 무엇인가? | 관리자 / B2B / SaaS / 학습 / 학습 완료 / 성취 / 콘텐츠 탐색 / 랜딩 / 결제 / 커머스 / 프로모션 |
| 컴포넌트 유형은 무엇인가? | Button / Card / Modal / Drawer / Table / FilterBar / Tabs / Form / KPI / Progress / Badge / ResultCard / Skeleton / Toast / Hero |
| 데이터 밀도는 어느 정도인가? | 낮음 / 중간 / 높음 |
| 모바일 우선인가? | 예 / 아니오 / 둘 다 중요 |
| 반복 사용되는 UI인가? | 예 / 아니오 |

### 4. 사용자와 UX 흐름

| 질문 | 답변 |
| --- | --- |
| 주요 사용자는 누구인가? | 학생 / 관리자 / 일반 사용자 / 구매자 / 내부 운영자 / 기타 |
| 진입점은 어디인가? |  |
| 사용자가 하는 주요 action은 무엇인가? |  |
| action 후 어떤 feedback이 필요한가? | loading / success / achievement / error / empty / restricted / progress |
| 다음 행동은 무엇이어야 하는가? | 저장 / 검색 / 상세 보기 / 결제 / 학습 시작 / 문의 / 나가기 |

### 5. 레퍼런스

| 질문 | 답변 |
| --- | --- |
| 참고하고 싶은 사이트가 있는가? | README의 사이트명 또는 URL |
| 레퍼런스에서 마음에 드는 부분은 무엇인가? | 구조 / 모션 / 카드 스타일 / 폼 UX / 컬러 / 섹션 흐름 / 카피 |
| 그대로 가져오면 안 되는 부분은 무엇인가? | 과한 gradient / 강한 모션 / 브랜드 컬러 / 복잡한 layout / 기타 |
| 원하는 분위기는 무엇인가? | 차분함 / 전문적 / 고급스러움 / 친근함 / 실험적 / 교육적 / 커머스형 |

### 6. 제약 조건

| 질문 | 답변 |
| --- | --- |
| 새 dependency 추가가 가능한가? | 기본값: 불가 |
| 반드시 유지해야 하는 브랜드 색상이나 로고가 있는가? |  |
| 접근성 기준이 있는가? | WCAG AA / keyboard / screen reader / 기타 |
| 지원해야 하는 viewport는 무엇인가? | mobile / tablet / desktop / wide |
| 피해야 할 디자인은 무엇인가? | 카드 과다 / 랜딩 느낌 / 과한 애니메이션 / 저밀도 layout / 기타 |

### 7. 산출물

| 질문 | 답변 |
| --- | --- |
| 필요한 산출물은 무엇인가? | AGENT 프롬프트 / 디자인 brief / 구현 코드 / 리뷰 체크리스트 / before-after 기준 |
| 코드 변경까지 원하는가? | 예 / 아니오 |
| 스크린샷 검증이 필요한가? | 예 / 아니오 |
| 문서만 필요한가? | 예 / 아니오 |

## 답변 예시

```md
## UI/UX Agent Intake

- project path: <대상 프로젝트 절대 경로>
- target screen/component: 관리자 고객 목록의 FilterBar + Table
- work type: 외부 레퍼런스 마이그레이션
- target user: 운영 관리자
- user goal: 우선 처리할 고객을 빠르게 찾고 상세 상태를 확인
- UI type: 관리자 / 테이블 / 필터 / 대시보드
- reference sites or URLs: Mobbin, MUI, shadcn/ui, Preline UI
- desired tone: 차분하고 밀도 높은 B2B 운영 화면
- must keep: 기존 API와 routing, Tailwind 사용
- must avoid: 랜딩페이지처럼 큰 hero, 과한 gradient, 긴 모션
- output needed: AGENT 프롬프트 + 컴포넌트 brief + 구현 체크리스트
```

## 다음 단계

수동 경로:

1. 이 질문지에 답한다.
2. `06_AGENT_GENERATION_GUIDE.md`의 매핑 규칙으로 레퍼런스와 문서 조합을 고른다.
3. `04_PROJECT_DESIGN_TOKENS_AND_CODE_PATTERNS.md`를 대상 프로젝트 기준으로 채운다.
4. 생성된 AGENT 프롬프트로 디자인/구현 작업을 시작한다.

자동 경로(슬래시 커맨드 사용): `project path`와 `target`만 정해진 경우 `07_AUTO_AGENT_COMMANDS.md`의 `/ui-agent:auto-discover`로 시작하면 위 1~3단계가 자동 분석으로 압축된다. 결과의 `Assumptions` 항목은 사람이 다시 한 번 확인한다.
