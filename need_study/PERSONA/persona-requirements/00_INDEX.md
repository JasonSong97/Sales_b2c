# persona-requirements 폴더 인덱스

> 최종 갱신: 2026-05-23
> 목적: 13개 영업 페르소나 피드백 기반 요구사항 정의·검증·결정 문서군

---

## 1. 폴더 구조

```
persona-requirements/
├── 00_INDEX.md                           ← 이 파일
├── 10_페르소나_요구사항_정의.md          (v5, current)   요구사항 정의서 — MVP/FR/NFR/업종별
├── 11_영업사원_문제점_페르소나_시뮬레이션.md (v2, current) 13명 페르소나 관점 문제 검증
├── 12_v2_매핑_결정.md                    (v2.1, current) 11번 v2 ↔ 10번 v5 매핑·결정·인터뷰 가이드
├── 13_서비스_기획서.md                   (v1, current ★) 마스터 서비스 기획서 — 10/11/12 통합본
├── 14_서비스_기획서_B2B요약.md           (v1, current)   13번 B2B 한정 5분 압축본 (B2C 5명 제외)
├── feedback/                             13개 페르소나 raw 피드백 (10번 v5 입력)
│   ├── sales-persona-automotive-feedback.md
│   ├── sales-persona-cosmetics-counselor-feedback.md
│   ├── sales-persona-cosmetics-retail-feedback.md
│   ├── sales-persona-cosmetics-salon-feedback.md
│   ├── sales-persona-defense-feedback.md
│   ├── sales-persona-industrial-feedback.md
│   ├── sales-persona-insurance-feedback.md
│   ├── sales-persona-mobile-retail-feedback.md
│   ├── sales-persona-pharma-feedback.md
│   ├── sales-persona-realestate-feedback.md
│   ├── sales-persona-saas-feedback.md
│   ├── sales-persona-semiconductor-feedback.md
│   └── sales-persona-wholesale-feedback.md
└── archive/                              과거 버전 보관 (이력 추적용)
    └── v1-reviews/                       10번 v1(PR-01~PR-14 구조) 시절의 5회 자체 검토
        ├── README.md                     아카이브 사유 + 흡수 상태표
        ├── 01_구조_완전성_검토.md
        ├── 02_요구사항_추적성_검토.md
        ├── 03_MVP_범위_충돌_검토.md
        ├── 04_검증_질문_강화_검토.md
        └── 05_최종_품질_검토.md
```

---

## 2. 문서 읽기 순서 (목적별)

### 2.1 "이 폴더 처음 봤다. 무엇을 만들고 있는지 알고 싶다"

→ **5분만 있으면**: [14_서비스_기획서_B2B요약](14_서비스_기획서_B2B요약.md) (B2B 8개 페르소나만)
→ **30분 있으면**: [13_서비스_기획서](13_서비스_기획서.md) (마스터 — 13개 페르소나 + User Journey + 로드맵)

세부 사항이 필요하면:
1. [10번 2장 제품 정의](10_페르소나_요구사항_정의.md) — 한 줄 정의 + 해결할 문제 + 안 할 일
2. [10번 4장 MVP 범위](10_페르소나_요구사항_정의.md) — MVP-01~MVP-10 (P0) + 제외 기능
3. [10번 13장 성공 기준](10_페르소나_요구사항_정의.md) — 정량·정성 지표

### 2.2 "어떤 페르소나의 어떤 페인을 다루나"

1. [11번 1장 시뮬레이션 결론](11_영업사원_문제점_페르소나_시뮬레이션.md) — 7축 공통 문제
2. [11번 6장 업종별 우선순위 매트릭스](11_영업사원_문제점_페르소나_시뮬레이션.md) — 13개 페르소나 × P0 7항목 ★ 강도
3. [10번 7장 업종별 요구사항](10_페르소나_요구사항_정의.md) — 13개 업종별 필수/제외

### 2.3 "왜 이런 결정을 했나"

1. [12번 1장 핵심 결정 요약](12_v2_매핑_결정.md) — D-401~D-408 8개 결정 한 표
2. [12번 2~3장 매핑·분류](12_v2_매핑_결정.md) — 11번 P0 7개 + F·G·H·I 4개 → 10번 매핑
3. [../04_의사결정_기록.md 5장](../04_의사결정_기록.md) — D-401~D-406 정식 결정 기록

### 2.4 "다음 단계 사용자 인터뷰는 어떻게"

1. [12번 6장 v3 인터뷰 가이드](12_v2_매핑_결정.md) — 30분 × 5명 + PMF-H1~H5
2. [12번 7장 다음 액션 체크리스트](12_v2_매핑_결정.md)
3. [10번 13장 성공 기준](10_페르소나_요구사항_정의.md) — 베타 지표

### 2.5 "원천 자료가 궁금하다"

- [feedback/](feedback/) — 13개 페르소나 raw 피드백 (10번 v5 작성 입력)
- [../.claude/agents/](../.claude/agents/) — 13개 페르소나 정의 파일 (인격·페인포인트·NO 리스트)
- [../.claude/agents/README.md](../.claude/agents/README.md) — 에이전트 운영 원칙 + 9-Stage 시나리오

### 2.6 "예전 검토는 어디 있나"

- [archive/v1-reviews/README.md](archive/v1-reviews/README.md) — 10번 v1 시절의 5회 자체 검토. 모든 인사이트는 현재 문서군(10/11/12)에 흡수됨.

---

## 3. 문서 간 관계 다이어그램

```
[.claude/agents/sales-persona-*.md] (13개 페르소나 정의)
                  ↓
            [feedback/]
        (13개 raw 피드백)
                  ↓
    [10_페르소나_요구사항_정의.md] (v5)
        제품 정의 + MVP 범위 + FR/NFR + 업종별
                  ↓
    [11_영업사원_문제점_페르소나_시뮬레이션.md] (v2)
        13개 페르소나 관점 문제 검증
        7축 공통 문제 + 추가 F·G·H·I
                  ↓
        [12_v2_매핑_결정.md] (v2.1)
        11번 ↔ 10번 매핑 + D-401~D-408 결정
        v3 인터뷰 가이드
                  ↓
   ┌────────────────────────────┐
   │ [13_서비스_기획서.md] (v1) │ ★ 마스터 통합본 (처음 읽는 사람용)
   │  10+11+12 통합               │  배경·타깃·MVP·User Journey·로드맵·리스크
   └────────────────────────────┘
                  ↓
        [../04_의사결정_기록.md]
        D-401~D-406 정식 편입
                  ↓
        [v3: 실제 사용자 인터뷰 5명]
                  ↓
        [09_PMF_검증.md] (PMF-H1~H5 결과 기록)
                  ↓
        [07_현재_확정된_기능.md] (F-38~ 편입)
```

---

## 4. 현재 상태 한 줄 요약

> **10번 v5 MVP 10개 + FR-11/FR-12 + NFR 5개는 v2 시뮬레이션·매핑·결정을 거쳐 안정 단계 → 13번 마스터 기획서로 통합 완료.**
> **다음 단계는 P-06 산업재 3명 + P-13 도매 2명 = 총 5명 사용자 인터뷰**로 PMF-H1~H5를 검증하는 것.

---

## 5. 외부 연결 문서

| 문서 | 위치 | 관계 |
|------|------|------|
| `04_의사결정_기록.md` | 프로젝트 루트 | D-401~D-406 정식 결정 기록 |
| `07_현재_확정된_기능.md` | 프로젝트 루트 | F-38 이후 편입 대상 (인터뷰 후) |
| `08_UserFlow.md` | 프로젝트 루트 | FR-11 카톡 검색·NFR-03 시니어 모드 화면 흐름 |
| `09_PMF_검증.md` | 프로젝트 루트 | PMF-H1~H5 가설 결과 기록 |
| `.claude/agents/README.md` | `.claude/agents/` | 에이전트 운영 가이드 + 9-Stage 시나리오 |
| `.claude/agents/sales-persona-*.md` | `.claude/agents/` | 13개 페르소나 인격 정의 |

---

## 6. 파일 명명·갱신 규칙

- 새 문서: `NN_제목.md` (NN은 두 자리 숫자, 10·11·12 이후 13·14...)
- 메이저 갱신: v2/v3 등 버전 표시 (파일 안에)
- 구조 변경 시: 구 버전을 `archive/v{N}-{이름}/`로 이동 + README 추가
- raw 입력: `feedback/` 또는 별도 명확한 이름 폴더
- 검토·회고 문서: `reviews-v{N}/` 형태로 분리 (현재 v1은 archive에)
