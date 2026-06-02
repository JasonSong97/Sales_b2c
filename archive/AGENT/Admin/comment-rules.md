# Admin Web Comment Rules

> 주석은 "WHY"만. "WHAT"은 코드와 명명으로.
> User 웹 주석 규칙과 동일. Admin 특화 케이스만 추가.

---

## 1. 핵심 원칙 (User 웹과 동일)

- 기본은 주석 없음
- 좋은 컴포넌트명/Props명/훅명이 주석 대체
- WHY가 필요한 경우만 작성
- 코드 그대로 번역하는 주석 금지
- 주석 처리된 코드 금지
- 변경 이력은 Git이 함

상세는 [Frontend/comment-rules.md](../Frontend/comment-rules.md) 참고.

---

## 2. Admin 웹에서 주석이 필요한 경우

### 2.1 권한 관련 의사결정
```tsx
// 사용자 삭제는 soft delete만 (감사 로그/복구 위해)
// hard delete는 운영 정책상 DB 관리자만 수행
async function deactivateUser(userId: string) { ... }
```

### 2.2 위험한 액션 가드
```tsx
// 이중 확인: 다이얼로그 + 사유 입력
// 단순 confirm()으로는 실수 방지 부족 (실제로 잘못 누르는 사고 발생)
<AlertDialog>
  <Input placeholder="삭제 이유" />
  ...
</AlertDialog>
```

### 2.3 무거운 쿼리 캐싱 결정
```tsx
// 전체 사용자 통계: 1만 명 기준 200ms 걸림
// staleTime 5분으로 잡아서 새로고침 빈도 제한
useQuery({
  queryKey: adminMetricsKeys.userGrowth(),
  staleTime: 1000 * 60 * 5,
});
```

### 2.4 데이터 테이블 컬럼 결정
```tsx
// 전화번호는 마스킹 표시 (감사 기준)
// 클릭 시 전체 보기 + 감사 로그 기록
{
  accessorKey: 'phone',
  cell: ({ row }) => <MaskedPhoneCell value={row.original.phone} />,
}
```

### 2.5 차트 데이터 변환 로직
```tsx
// 시간대별 집계: UTC → KST(+9) 변환 후 그룹
// 백엔드는 UTC로 응답, 차트는 KST 표시
const grouped = groupByKstHour(data);
```

### 2.6 TODO/FIXME
```tsx
// TODO(#234): 권한 세분화 (super-admin 추가) - 관리자 늘어나면
// FIXME(#199): 사용자 1만 명 넘으면 클라이언트 정렬 느림 → 서버 정렬로
// HACK: TanStack Table column 동적 추가 시 re-render 이슈 - key prop으로 강제
// NOTE: 이 페이지는 ADMIN role만 접근 가능 (라우트 가드에서 보장)
// WARNING: 사용자 삭제는 영구 작업. 복구 불가능.
```

---

## 3. 절대 쓰지 말 것

### 3.1 ❌ 권한 체크를 주석으로 설명
```tsx
// ❌ 가드가 있어서 의미 없음
// 관리자만 볼 수 있는 페이지입니다
export default function UserListPage() { ... }
```

### 3.2 ❌ 데이터 테이블 구조 설명
```tsx
// ❌
// 사용자 테이블 - 이메일, 권한, 가입일 컬럼
const columns = [...];
```

### 3.3 ❌ Admin 페이지 설명 주석
```tsx
// ❌
// === 대시보드 ===
// 시스템 전체 현황을 표시
function DashboardPage() { }
```

---

## 4. JSDoc

User 웹과 동일하나, Admin 전용 훅/컴포넌트는 권한 요구사항을 명시:

```tsx
/**
 * 모든 사용자 목록을 조회합니다.
 *
 * @remarks
 * - 백엔드 /admin/api/users 호출
 * - ADMIN role 필요 (라우트 가드에서 보장)
 * - 1만 명 초과 시 서버 페이지네이션 필수
 */
export function useAllUsers(filter: UserFilter) { ... }
```

---

## 5. 감사 로그 관련 주석

감사 로그 관련 코드는 변경 시 주의 필요해서 한 줄 주석 가치 있음:

```tsx
// 이 액션은 audit_log 테이블에 기록됨 (백엔드에서 자동)
// 사유 입력란이 비면 백엔드가 거부함
const handleDeleteUser = (id: string, reason: string) => {
  deleteUser({ id, reason });
};
```

---

## 6. 구조화 로깅 표준 (빅테크 표준 + Admin 특화)

> 자세한 배경은 [04_의사결정_기록.md D-205](../../04_의사결정_기록.md). User 웹 표준 + Admin 특화 확장.
>
> **Admin 특화 요구**:
> - 모든 Admin 액션은 **감사 로그(audit log)**에도 기록됨 — 클라이언트 로그와 분리 인식
> - 관리자 행동은 클라이언트 Sentry로, 감사 로그는 백엔드 audit_log 테이블로
> - Admin은 PII에 접근할 수 있는 권한이 있지만 **로그에는 그대로 들어가면 안 됨**

### 6.1 로그 채널 구분 (Admin은 3개)

| 채널 | 어디서 발생 | 어디로 | 무엇 |
|------|----------|--------|------|
| **클라이언트 에러** | 브라우저 JS | Sentry | UI 버그, 네트워크 실패 등 |
| **감사 로그 (audit)** | 백엔드가 자동 기록 | DB `audit_log` 테이블 | 관리자가 수행한 모든 변경 액션 |
| **분석 이벤트** | 클라이언트 | 분석 도구 (도입 후) | Admin이 어떤 화면을 보는가 |

→ 셋이 섞이면 안 됨. 감사 로그는 백엔드 책임, 클라이언트는 Sentry만.

### 6.2 로거 래퍼 (User 웹과 동일)

```typescript
// shared/lib/logger.ts — User 웹과 동일 인터페이스
export const logger = {
  debug, info, warn, error,  // Sentry로
};
```

### 6.3 좋은 로깅 예시 (Admin)

```typescript
// ✅ 위험한 액션 시작 시 (백엔드가 감사 로그 자동 기록)
logger.info('admin.userDeactivation.requested', {
  targetUserId,
  // reason은 백엔드 audit_log에 들어감 — 클라이언트 로그엔 X
});

// ✅ 무거운 쿼리 시간 측정
logger.info('admin.metrics.userGrowth.loaded', {
  durationMs: end - start,
  rowCount: data.length,
});

// ✅ 권한 거부 (정상 흐름)
logger.warn('admin.access.forbidden', {
  attemptedRoute: location.pathname,
  userRole: user.role,
});

// ✅ 클라이언트 에러
logger.error(error, {
  feature: 'admin.userList',
  filter: searchParams.toString(),
});
```

### 6.4 클라이언트 로그 vs 감사 로그 — 무엇을 어디로

| 정보 | 클라이언트 로그 | 감사 로그 |
|------|--------------|--------|
| "Admin이 사용자 삭제 버튼을 눌렀다" (UI 액션) | ✅ logger.info | ❌ |
| "사용자가 실제로 삭제됨" (DB 변경) | ❌ | ✅ 백엔드가 자동 |
| "삭제 사유" (사용자 입력) | ❌ (PII 가능성) | ✅ 백엔드에만 |
| "차트 로딩 실패" | ✅ logger.error | ❌ |
| "Admin이 어떤 사용자 상세를 봤는가" | ⚠️ 분석 이벤트로 (Sentry 아님) | ❌ (조회는 감사 로그에 안 남김 — 정책에 따라) |

### 6.5 PII 처리 (Admin 특수)

Admin은 **모든 사용자의 PII에 접근 권한**이 있다. 그래서 더 주의:

```typescript
// ❌ Admin이 보는 화면이라고 로그에 PII 넣기
logger.info('admin.viewedUser', {
  email: user.email,
  phone: user.phone,
});

// ✅ ID만, 필요하면 백엔드가 ID로 PII 조회
logger.info('admin.viewedUser', {
  targetUserId: user.id,
});
```

### 6.6 위험한 액션 로깅 패턴

```tsx
async function handleDeactivateUser(userId: string, reason: string) {
  logger.info('admin.userDeactivation.requested', { targetUserId: userId });
  try {
    await api.deactivateUser({ id: userId, reason });
    // 성공 로그는 백엔드가 audit_log에 — 클라이언트는 안 적음
  } catch (err) {
    logger.error(err, { feature: 'admin.userDeactivation', targetUserId: userId });
    throw err;
  }
}
```

### 6.7 안티 패턴

| ❌ 안티 패턴 | ✅ 대안 |
|------------|--------|
| 클라이언트에서 감사 로그 직접 기록 시도 | 백엔드 책임 (`audit_log` 테이블) |
| Admin이 보는 PII를 그대로 logger에 | 사용자 ID만, PII는 백엔드 조회 |
| 위험한 액션을 try 없이 호출 | try/catch + logger.error |
| 삭제 사유를 클라이언트 로그에 | 백엔드 `audit_log`에만 |
| 차트 로딩 실패를 무시 | logger.error로 명시 |

---

## 7. 검토 체크리스트

PR 리뷰 시 주석:
- [ ] 권한 결정 주석에 WHY 있는가
- [ ] 위험한 액션에 가드 설명 주석 있는가 (단, 코드 자체로 명확하면 불필요)
- [ ] 무거운 쿼리 캐싱 결정에 사유 있는가
- [ ] TODO/FIXME에 이슈 번호 있는가
- [ ] User 웹/모바일과 무관한 Admin 특화 결정에 맥락 있는가

PR 리뷰 시 로깅:
- [ ] `console.log` 남아있지 않은가
- [ ] 클라이언트 로그와 감사 로그를 혼동하지 않는가
- [ ] PII(이메일/전화)가 클라이언트 로그에 들어가지 않는가
- [ ] 위험한 액션이 try/catch + logger.error로 보호되는가
- [ ] 삭제 사유 같은 입력값이 클라이언트 로그에 가지 않는가 (백엔드 audit_log로만)

---

## 8. AI에게 코드 생성 시킬 때 강조할 것

**주석**:
1. "주석은 기본적으로 쓰지 마라"
2. "권한/감사 관련 결정에는 WHY 한 줄"
3. "무거운 쿼리 캐싱 설정에는 측정 근거 한 줄"
4. "위험한 액션(삭제, 권한 변경)에 가드 사유 한 줄 OK"
5. "데이터 테이블 컬럼 정의 자체에는 주석 금지 (타입으로 충분)"

**로깅**:
6. "`console.log` 절대 금지. `logger` 래퍼만"
7. "감사 로그는 백엔드 책임 — 클라이언트에서 직접 audit_log 호출 금지"
8. "Admin이 PII에 접근 가능해도 클라이언트 로그에는 ID만 — PII 평문 금지"
9. "삭제 사유 같은 사용자 입력은 백엔드 audit_log로만, 클라이언트 logger에 X"
10. "위험한 액션은 반드시 try/catch + logger.error"
