# Backend Comment Rules

> 주석은 "WHY"만 적는다. "WHAT"은 코드와 명명으로 표현한다.

---

## 1. 핵심 원칙

### 1.1 주석은 기본적으로 쓰지 않는다
- 잘 짠 코드는 주석 없이 읽힘
- 좋은 변수명/함수명/타입이 주석을 대체
- 주석은 코드가 바뀌면 거짓말이 됨 (관리 비용)

### 1.2 주석이 필요한 경우 (WHY)
- 코드만 보고는 알 수 없는 **이유/맥락**
- 비즈니스적 제약 (예: "법적으로 7년 보관")
- 외부 시스템의 특이 동작 회피 (예: "CLOVA OCR이 빈 응답 줄 때")
- 알고리즘 선택 이유 (예: "O(n^2)지만 데이터 50개 이하 보장됨")
- TODO/HACK/FIXME (반드시 이슈 번호 또는 날짜)

### 1.3 절대 쓰지 말 것
- ❌ 코드가 무엇을 하는지 그대로 적기
- ❌ 함수명을 한국어로 번역하기
- ❌ 변경 이력 (Git이 함)
- ❌ 누가 언제 작성했는지 (Git이 함)
- ❌ 주석 처리한 코드 (Git이 보관)

---

## 2. 좋은 주석 예시

### 2.1 비즈니스 제약
```typescript
// 영업사원이 같은 거래처에 연락 가능 여부 판단:
// 법적 영업 제한 시간(20시~9시)에는 자동 호출 불가
function canCallNow(customer: Customer): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 20;
}
```

### 2.2 외부 시스템 회피
```typescript
async parseBusinessCard(image: Buffer) {
  // CLOVA OCR이 흑백 명함에서 가끔 빈 confidence를 반환함 (2024-11 확인)
  // 빈 응답이면 grayscale 변환 후 재시도
  const result = await this.callClova(image);
  if (!result.confidence) {
    return this.callClova(await this.toGrayscale(image));
  }
  return result;
}
```

### 2.3 알고리즘 선택 이유
```typescript
// 거래처 수가 사용자당 최대 5,000개로 운영 정책상 제한됨
// O(n^2)이지만 5,000개에서 실측 50ms → 인덱스 추가하기보다 단순 유지
function findDuplicates(customers: Customer[]): Customer[] { ... }
```

### 2.4 TODO/FIXME (이슈 번호 또는 날짜)
```typescript
// TODO(#123): 페이지네이션 추가 - 현재 전체 조회로 응답 느림
// FIXME(2026-06-01): Prisma 5.x 업그레이드 후 deprecated API 교체
// HACK: Supabase RLS와 Nest 권한 체크 이중화 - 신뢰성 확보 후 RLS만 남기기
```

---

## 3. 나쁜 주석 예시 (절대 금지)

### 3.1 ❌ 코드 그대로 번역
```typescript
// ❌ 거래처를 ID로 찾는다
async findById(id: CustomerId): Promise<Customer | null> { }
```
→ 함수명이 이미 설명함

### 3.2 ❌ 변경 이력
```typescript
// ❌ 2024-11-01 김철수: phone validation 추가
// ❌ 2024-12-15 박영희: region 컬럼 추가
export class Customer { }
```
→ Git log가 함

### 3.3 ❌ 의미 없는 구분자
```typescript
// ❌
// ===================
// Customer Service
// ===================
```

### 3.4 ❌ 주석 처리된 코드
```typescript
// ❌
async create(cmd: CreateCustomerCommand) {
  // const old = this.legacyService.create(...);
  // if (old) return old;
  return this.repo.save(customer);
}
```
→ 지워라. Git이 보관함.

### 3.5 ❌ JSDoc으로 타입 중복
```typescript
// ❌ TypeScript 타입이 이미 있음
/**
 * @param {string} name - 거래처 이름
 * @param {string} phone - 전화번호
 * @returns {Customer} 생성된 거래처
 */
function create(name: string, phone: string): Customer { }
```

---

## 4. JSDoc 사용 정책

### 4.1 JSDoc은 다음 경우에만
- **public API**의 사용자 (다른 모듈/외부)가 봐야 하는 함수
- IDE 자동완성에 도움이 되는 정보
- **WHY가 들어가는 경우만** (단순 타입 중복 금지)

### 4.2 좋은 JSDoc
```typescript
/**
 * 거래처를 OCR 결과로 생성합니다.
 *
 * @remarks
 * 동일 사용자의 거래처 중 전화번호가 일치하면 새로 만들지 않고
 * 기존 거래처에 명함 이미지만 추가합니다. (병합 정책)
 */
async createFromOcr(cmd: CreateFromOcrCommand): Promise<Customer> { }
```

### 4.3 나쁜 JSDoc
```typescript
// ❌
/**
 * @param id 거래처 ID
 * @returns 거래처
 */
findById(id: CustomerId): Promise<Customer | null>
```

---

## 5. 주석 분류 태그

### 5.1 표준 태그 (반드시 컨텍스트 동반)
| 태그 | 의미 | 형식 |
|------|------|------|
| `TODO` | 나중에 해야 할 일 | `TODO(#123):` 또는 `TODO(2026-06-01):` |
| `FIXME` | 버그가 있지만 임시 회피 | `FIXME(#456):` |
| `HACK` | 의도적 우회 | `HACK: 사유` |
| `NOTE` | 중요한 맥락 정보 | `NOTE: 사유` |
| `WARNING` | 잘못 건들면 위험 | `WARNING: 사유` |

### 5.2 예시
```typescript
// TODO(#234): 알림 발송 후 결과 webhook 처리 추가
// FIXME(#199): pagination cursor가 정렬 컬럼 동일 값일 때 누락 가능 - sub-sort 필요
// HACK: Prisma transaction에서 raw query 사용 - $transaction([])에서 raw 안 됨 이슈
// NOTE: 이 메서드는 명함 OCR 콜백에서만 호출됨. 직접 호출 금지.
// WARNING: 이 마이그레이션은 5분 이상 걸림. 배포 시 maintenance mode 필요.
```

---

## 6. 도메인 용어 주석

도메인 용어가 일반적이지 않을 때 한 줄 설명:
```typescript
// "딜(Deal)" = 영업 건. 한 거래처에 대한 하나의 영업 시도.
export class Deal {
  // "확률(probability)" = 영업사원이 주관적으로 입력한 성사 가능성 (0~100)
  private _probability: number;
}
```

용어 자체가 모호하지 않다면 `AGENT/domain-glossary.md`에 정리, 코드에는 안 씀.

---

## 7. 자동 생성 코드

### 7.1 Prisma generate 결과물
- 주석 X (어차피 자동 생성)

### 7.2 OpenAPI/Swagger 데코레이터
```typescript
@ApiOperation({ summary: '거래처 생성' })  // ✅ Swagger UI에 표시됨
@ApiResponse({ status: 201, type: CustomerResponseDto })
@Post()
async create() { ... }
```
- `@ApiOperation`은 문서화 목적이므로 OK

---

## 8. 구조화 로깅 표준 (빅테크 표준)

> 로그는 사람이 읽는 게 아니라 **기계가 파싱**한다. 인라인 ASCII 박스 / 다단 구분선 / 수동 정렬 텍스트는 모두 금지.
> Sentry/Datadog/CloudWatch가 집계·필터·알람할 수 있는 형식으로만.

### 8.1 핵심 원칙

1. **모든 로그는 구조화 JSON** (pino, winston 등의 structured logging)
2. **메시지는 짧은 영문 키워드** (검색·집계 가능). 상세 정보는 객체 필드로
3. **로그 안에서 PII 마스킹** (이메일/전화/이름 그대로 찍기 금지)
4. **`when` / `who` / `where`는 자동 주입** — 사람이 손으로 안 적음
5. **레벨을 정확히** — error는 알람, warn은 조사 대상, info는 비즈니스 이벤트

### 8.2 표준 로그 컨텍스트 (자동 주입)

NestJS 인터셉터/미들웨어에서 자동으로 채움:

```typescript
// shared/infrastructure/logging/logger.module.ts
{
  traceId: string;       // 요청 trace ID (gateway에서 생성)
  spanId: string;        // 메서드/모듈 span
  userId?: string;       // 인증된 사용자 (없으면 anonymous)
  route: string;         // /api/customers/:id
  method: string;        // GET, POST
  timestamp: string;     // ISO 8601 (pino 자동)
  service: string;       // sales-backend
  env: string;           // production / staging
}
```

→ 코드에서는 이 값들을 **다시 적지 않는다**. 자동 주입.

### 8.3 좋은 로깅 예시

```typescript
// ✅ 구조화 + 짧은 키 + 컨텍스트 객체
logger.warn('customer.notFound', {
  customerId: id,
  reason: 'NOT_EXIST',
});

logger.error('ocr.callFailed', {
  provider: 'clova',
  customerId,
  attempt: 2,
  err: error,  // pino가 stack/message 자동 직렬화
});

logger.info('customer.created', {
  customerId: customer.id.toString(),
  source: 'manual',  // manual | ocr | excel
});
```

### 8.4 나쁜 로깅 예시 (절대 금지)

```typescript
// ❌ ASCII 박스 / 다단 구분선
logger.warn(`
========================== ERROR ACCESS DETECTED ==========================
[WHEN: ${now}]
[LOCATION: UserService.getById]
[WHO: ${userId}]
[REASON: User not found]
============================================================================
`);

// ❌ 문장형 메시지에 정보 박기 (검색·집계 불가)
logger.warn(`User ${userId} not found in UserService.getById at ${now}`);

// ❌ PII 그대로
logger.info('user logged in', { email: 'user@example.com', phone: '010-1234-5678' });

// ❌ console.log
console.log('user created', customer);
```

### 8.5 도메인 에러는 throw, 로그는 상위에서

도메인 코드 안에서 직접 로그 찍지 않는다. **DomainError를 throw하면 ExceptionFilter가 표준 로그를 생성**:

```typescript
// ❌ Domain에서 직접 로그
async findById(id: CustomerId) {
  const customer = await this.repo.findById(id);
  if (!customer) {
    logger.warn('customer.notFound', { customerId: id.toString() });
    throw new CustomerNotFoundError(id.toString());
  }
}

// ✅ throw만 — 로그는 Exception Filter가 처리
async findById(id: CustomerId) {
  const customer = await this.repo.findById(id);
  if (!customer) {
    throw new CustomerNotFoundError(id.toString());
  }
  return customer;
}
```

```typescript
// shared/presentation/filters/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp().getRequest<RequestWithContext>();

    logger.warn(error.code, {        // 'CUSTOMER_NOT_FOUND' 같은 코드
      errCode: error.code,
      err: error,
      // traceId/userId/route는 컨텍스트에서 자동
    });

    // ... HTTP 응답 변환
  }
}
```

### 8.6 로그 레벨 가이드

| 레벨 | 언제 | 알람 |
|------|------|------|
| `fatal` | 프로세스 중단 직전 | 즉시 호출 |
| `error` | 예상 못 한 실패 (외부 API 5xx, DB 연결 끊김) | 알람 |
| `warn` | 도메인 규칙 위반, 4xx 응답 (인증 실패 등) | 빈도 모니터링 |
| `info` | 비즈니스 이벤트 (가입, 거래처 생성, OCR 완료) | 분석용 |
| `debug` | 개발 시점 디테일 | production 비활성 |

**금지**: `info`에 매 요청 찍기 (액세스 로그는 미들웨어가 별도 처리)

### 8.7 PII / 민감 정보 마스킹

```typescript
// shared/lib/logging/redact.ts
export function redactPhone(phone: string): string {
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
}
export function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}
```

pino의 `redact` 옵션으로 전역 자동화:
```typescript
const logger = pino({
  redact: {
    paths: ['*.email', '*.phone', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
});
```

### 8.8 안티 패턴

| ❌ 안티 패턴 | ✅ 대안 |
|------------|--------|
| ASCII 박스 / 구분선 / 다단 정렬 | 구조화 JSON |
| `WHEN/LOCATION/WHO/REASON` 직접 작성 | 자동 컨텍스트 주입 |
| 문장형 메시지에 변수 박기 (`"User ${id} failed"`) | 짧은 키 + 컨텍스트 객체 |
| 같은 정보 여러 줄에 중복 | 한 번에 객체로 |
| `console.log` / `console.error` | logger만 사용 |
| 도메인 코드에서 직접 로그 | throw → Exception Filter가 로그 |
| PII 평문 로그 | redact 함수 또는 pino redact 옵션 |
| 매 요청마다 info 로그 | access log는 별도 (미들웨어) |

---

## 9. 검토 체크리스트

PR 리뷰 시 주석 관련 체크:
- [ ] 코드 그대로 번역한 주석 없는가
- [ ] 주석 처리된 코드 없는가
- [ ] TODO/FIXME에 이슈 번호 또는 날짜 있는가
- [ ] WHY가 아닌 WHAT을 설명한 주석 없는가
- [ ] 변수명/함수명 개선으로 주석을 없앨 수 있는가
- [ ] 변경 이력이 주석에 있지 않은가

PR 리뷰 시 로깅 관련 체크:
- [ ] ASCII 박스/구분선 로그 없는가
- [ ] 문장형 메시지에 변수 박은 로그 없는가 (구조화 JSON으로)
- [ ] `console.log` 남아있지 않은가
- [ ] PII(이메일/전화/이름)가 평문으로 로그에 들어가지 않는가
- [ ] 도메인 코드에서 직접 logger 호출 없는가 (throw → Filter)
- [ ] 로그 레벨이 적절한가 (warn/error/info 구분)

---

## 10. AI에게 코드 생성 시킬 때 강조할 것

**주석**:
1. "주석은 기본적으로 쓰지 마라. WHY가 필요한 경우만 한 줄."
2. "JSDoc은 public API만, 타입 중복은 금지"
3. "TODO/FIXME에는 반드시 이슈 번호나 날짜를 붙여라"
4. "코드를 한국어로 번역하는 주석은 절대 쓰지 마라"
5. "주석 처리된 코드는 남기지 말고 삭제하라 (Git이 보관함)"
6. "함수 본문에 `// 1. ... // 2. ...` 같은 단계 주석 금지 — 함수를 더 작게 쪼개라"

**로깅**:
7. "로그는 구조화 JSON. 짧은 영문 키 + 컨텍스트 객체"
8. "ASCII 박스 / 구분선 / 다단 정렬 로그는 절대 금지"
9. "WHEN/WHO/WHERE 같은 메타는 자동 주입 — 코드에서 다시 적지 마라"
10. "도메인 코드 안에서 logger 호출 금지. DomainError를 throw → Exception Filter가 로깅"
11. "PII는 redact 함수 거치거나 pino redact 옵션으로 자동 마스킹"
12. "console.log 절대 쓰지 말 것. logger만"
