# SaaS B2B AE 관점 피드백 — 영업 관리 프로그램 서비스 기획서

> **피드백 작성자**: 이도현 (6년차 B2B SaaS AE, Salesforce·HubSpot·Gong 유저)
> **작성일**: 2026-05-22
> **대상 문서**: `01_서비스_기획서.md`

---

## 1. 전체 평가

### 1.1 타겟 정체성 — B2C vs B2B 혼선

타겟이 **"영업사원 개인"**이라는 점에서 주의가 필요합니다.

Salesforce·HubSpot·Gong은 **회사가 도입**하고, 영업사원은 의무로 사용합니다.
개인이 따로 비용을 내고 쓰는 도구는 Notion·LinkedIn Sales Navigator 정도입니다.

이 앱이 "회사가 강제하지 않는 개인용"이라면:
- **B2C 영업사원**(보험·자동차·금융·부동산) 타겟 → 적합. 회사 CRM이 없거나 부실하기 때문.
- **B2B SaaS AE** → Salesforce를 빠질 수 없음. 매니저가 Pipeline Forecast를 확인하기 때문.

**결론**: B2C 영업 타겟은 명확함. B2B는 보조 도구로만 가능.

### 1.2 핵심 가치 — 공감되는 페인포인트

| 페인포인트 | 공감도 | 이유 |
|-----------|--------|------|
| 노트북→핸드폰 동기화 | ★★★★★ | 줌 미팅 노트를 모바일에서 다시 열어보는 상황 빈번 |
| 명함 스캔 OCR→자동 등록 | ★★★★☆ | B2C는 명함 실물이 핵심. B2B는 LinkedIn으로 대체 |
| Off-the-record 메모 | ★★★★★ | Salesforce에 못 적는 내용(정치적 이슈·개인 성향·비공식 루머) 관리 필수 |
| IndexedDB 오프라인 조회 | ★★★★☆ | 이동 중 데이터 확인 매력적 |

---

## 2. 기능별 실용성 평가 ("줌 미팅 직후 5분에 쓸까?")

### 2.1 영업 데이터 관리 (CRUD)

**실용성**: ★★★☆☆ (B2B 기준) / ★★★★★ (B2C 기준)

- 노트북→모바일 동기화: 줌 미팅 끝나면 노트북에 정리하고, 이동 중 모바일로 다시 확인하는 패턴에 부합
- **BUT**: Salesforce 입력 의무 때문에 이중 입력 문제 발생 (B2B 한정)

**줌 미팅 직후 5분에 쓸까?**
- B2B: **NO** — Salesforce에 먼저 입력해야 함
- B2C (Salesforce 없는 영업): **YES**

### 2.2 엑셀 Import/Export

**실용성**: ★★★★☆

- 엑셀 Import: 기존 데이터 마이그레이션 시 필수
- 엑셀 Export: 분기 Forecast 정리할 때 자주 사용
- PDF Export: 읽기 전용이라 수정 불가. 실제로는 엑셀 주고받는 경우가 더 많음

**줌 미팅 직후 5분에 쓸까?** → **NO**. 주말이나 분기말 배치 작업.

### 2.3 필터링 시스템

**실용성**: ★★★★★

- "이번 달 구매 가능성 높은 사람" 탭 = Salesforce의 "Closing This Quarter" 뷰와 동일 개념
- 지역별 탭 = 어카운트 분리 조회 시 필수
- 자주 쓰는 필터 탭 저장 = Salesforce List View 커스텀과 동일. 핵심 기능

**줌 미팅 직후 5분에 쓸까?** → **YES**. "이번 주 미팅 예정" 탭 열어서 다음 미팅 준비.

### 2.4 거래처 정보 관리 (명함 OCR)

**실용성**: ★★★★☆ (B2B) / ★★★★★ (B2C)

- 명함 스캔 OCR: B2C 영업 필수. B2B는 LinkedIn Sales Navigator로 대체
- Off-the-record 메모: Salesforce에 못 적는 "챔피언 성향·정치 이슈" 정리용으로 매우 유용
- 회사 정보 추가 입력: Company Insights 수준의 정보(매출·직원수·업종) 확인 시 유용

**줌 미팅 직후 5분에 쓸까?** → **YES** (Off-the-record 메모 한정). "이 바이어는 경쟁사 제품 쓰다가 불만" 같은 정보 즉시 기록.

### 2.5 인증

**실용성**: ★★★★★

- 사용자별 데이터 분리 없으면 사용 불가
- 단, 엔터프라이즈 고객사 정보 입력 시 보안 인증(SOC2·ISO27001) 없으면 제약

---

## 3. 영업 현장 페인포인트와 개선 제안

### 3.1 현재 기획서 vs 실제 페인포인트 매칭

| 실제 페인포인트 (B2B SaaS AE) | 기획서 해결 여부 | 비고 |
|-------------------------------|-----------------|------|
| 줌 미팅 직후 CRM 입력 30분 | ⚠️ 부분 | Salesforce 대체 불가. 보조만 가능 |
| 어카운트 내 의사결정자 매핑 (MEDDIC) | ❌ | `customers`에 "역할(Champion·EB·DM)" 구분 없음 |
| 챔피언 이직 시 어카운트 리셋 | ✅ | Off-the-record 메모에 "이전 챔피언" 기록 가능 |
| POC 진행 상태 추적 | ❌ | `deals` 테이블이 단순. POC 단계·액션 아이템·책임자 없음 |
| 분기 Quota 가시성 | ❌ | Pipeline 배수·Win rate·Forecast 대시보드 없음 |
| CSM 인계 시 컨텍스트 전달 | ⚠️ | 노트 있지만 타임라인·히스토리 뷰 없음 |
| 액션 아이템 추적 | ❌ | 미팅 후 다음 스텝 관리 기능 없음 |

### 3.2 제안 1: `customers` 테이블에 "역할" 추가

**현재**:
```
customers: name, phone, email, position, region
```

**제안**:
```
customers 추가 필드:
  ├─ role (Champion / Economic Buyer / Decision Maker / User / Blocker)
  ├─ influence_level (High / Medium / Low)
  └─ relationship_status (Warm / Neutral / Cold)
```

**이유**: B2B 영업은 "누가 챔피언, 누가 예산 결정자"가 딜 성공률을 좌우함. MEDDIC 매핑은 기본.

### 3.3 제안 2: `deals` 테이블에 "액션 아이템" 추가

**현재**:
```
deals: title, status (lead/in_progress/won/lost), amount, probability, notes
```

**제안**:
```
deals 추가 필드:
  ├─ stage (Discovery / Demo / POC / Negotiation / Closed Won·Lost)
  ├─ next_action (다음 액션)
  ├─ next_action_owner (책임자)
  ├─ next_action_due_date (마감일)
  └─ last_activity_date (마지막 접촉일)
```

**이유**: 줌 미팅 후 "다음 주까지 고객사가 ○○ 검토, 우리는 ○○ 준비" 같은 액션 아이템 추적 없으면 팔로업 놓침.

### 3.4 제안 3: 어카운트별 타임라인 뷰 (Activity History)

**현재**: `notes` 테이블에 메모만 존재.

**제안**: 거래처별 시계열 타임라인
- 언제 미팅했고, 무슨 메모 남겼고, 딜 단계가 어떻게 바뀌었는지 한눈에 확인
- Salesforce "Activity Timeline"과 유사한 형태

**이유**: CSM 인계 시 히스토리 전달, 챔피언 이직 시 과거 접촉 이력 추적에 필수.

### 3.5 제안 4: 알림 기능 Phase 3으로 상향

**현재**: Phase 4 (후순위)

**제안**: Phase 3으로 이동

**이유**: "내일 미팅 있는 거래처" 모바일 푸시는 영업사원 필수. Salesforce도 Task Due Date 알림 제공.

---

## 4. 우선순위 제안

### Phase 1 (MVP) — 변경 없음 ✅

거래처 CRUD + 필터 + 엑셀 Export + 모바일 동기화
→ B2C 영업사원은 이것만으로 즉시 사용 가능.

### Phase 2 — 추가 제안

기존 항목 유지 + 아래 추가:
- `deals.next_action` + `next_action_due_date` 필드
- "이번 주 팔로업 필요한 딜" 탭

### Phase 3 — 추가 제안

기존 항목 유지 + 아래 추가:
- `customers.role` (Champion·EB·DM) 필드
- 어카운트별 타임라인 뷰
- **알림 기능** (Phase 4에서 상향)

### Phase 4 — 보류/제외 동의

- ❌ 견적서 생성 → 동의. 회사 양식 대응 불가
- ❌ 회의 녹음 → 동의. Gong 수준의 완성도 불가
- ⚠️ 캘린더 → 동의. 구글 캘린더로 충분

---

## 5. 이 앱을 쓸 사람 (타겟 적합도)

| 타겟 | 사용 여부 | 이유 |
|------|----------|------|
| B2C 영업 (보험·자동차·부동산) | ✅ 적합 | 회사 CRM 없거나 부실. 명함 OCR + 모바일 동기화 필수 |
| B2B SaaS AE | ⚠️ 보조만 | Salesforce 대체 불가. Off-the-record 메모 용도로 보조 도구 |
| 프리랜서 영업 | ✅ 적합 | 회사 없으니 개인용 필수 |

---

## 6. 핵심 요약 (TL;DR)

### 꼭 추가해야 할 기능

1. **`deals.next_action` + `next_action_due_date`** (Phase 2)
   → 미팅 후 "다음 팔로업" 추적 필수

2. **`customers.role` (Champion·EB·DM)** (Phase 3)
   → 의사결정자 매핑이 딜 성공률 좌우

3. **어카운트 타임라인 뷰** (Phase 3)
   → 히스토리 추적·인계 시 필수

4. **알림** (Phase 3으로 상향)
   → "내일 미팅" 모바일 푸시

### 줌 미팅 직후 5분에 쓸까? (최종 답)

- **B2C 영업사원**: ✅ YES — 명함 스캔 + Off-the-record 메모 즉시 입력
- **B2B SaaS AE**: ⚠️ 부분적 — Salesforce 입력 먼저, 비공식 메모만 이 앱에

### 이 앱이 성공하려면

1. **모바일에서 30초 안에 메모 입력** (빠른 입력 UX 필수)
2. **"다음 팔로업" 리마인더** (알림·캘린더 연동)
3. **Salesforce 연동** (B2B 시장 진입 시 — "Salesforce 보조 도구" 포지션)

현재 기획서는 **B2C 타겟으로 탄탄**합니다.
B2B 확장은 위 3가지 추가 후 검토하세요.

---

> **피드백 날짜**: 2026-05-22
> **작성자**: 이도현 (6년차 B2B SaaS AE)
