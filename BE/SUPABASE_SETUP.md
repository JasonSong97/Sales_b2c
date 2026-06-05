# Supabase Cloud 연결 준비

이 문서는 `/goal` 구현 전에 사용자가 직접 준비해야 하는 Supabase Cloud 연결 작업을 한 장으로 정리한다.

## 1. 사용하는 Supabase 범위

- PostgreSQL: Backend가 Prisma로 직접 연결한다.
- Auth: FE가 Supabase Auth로 로그인하고, Backend는 `/api/auth/exchange`에서 Supabase access token을 검증한다.
- Storage: Backend가 `StoragePort`를 통해 Supabase Storage에 파일을 저장한다.

FE는 Supabase PostgreSQL이나 Storage에 직접 쓰지 않는다.

## 2. 사용자가 먼저 할 일

1. Supabase Cloud에서 개발용 project를 만든다.
2. Project URL, anon key, service role key를 확인한다.
3. Supabase PostgreSQL connection string을 확인한다.
4. Storage bucket 3개를 만든다.
5. `BE/.env.example`을 기준으로 `BE/.env`를 만든다.
6. 아래 필수 환경 변수를 실제 값으로 채운다.
7. 검증 명령을 실행한다.

## 3. `BE/.env`에 채울 필수 값

```env
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_JWKS_URL="https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json"
SUPABASE_JWT_ISSUER="https://<project-ref>.supabase.co/auth/v1"
APP_JWT_SECRET=""
APP_REFRESH_TOKEN_SECRET=""
ENCRYPTION_MASTER_KEY=""
INITIAL_ADMIN_EMAILS=""
```

`SUPABASE_SERVICE_ROLE_KEY`는 Backend 환경 변수로만 관리하고 FE에 노출하지 않는다.

`APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`, `ENCRYPTION_MASTER_KEY`는 충분히 긴 랜덤 문자열을 사용한다.

`INITIAL_ADMIN_EMAILS`에는 최초 Admin으로 승격할 이메일을 넣는다. 여러 개가 필요하면 comma-separated 형식으로 둔다.

## 4. PostgreSQL 연결값

Supabase Cloud PostgreSQL 연결값은 Backend Prisma에 사용한다.

```env
DATABASE_URL=""
DIRECT_URL=""
```

local test와 reset이 필요한 integration/E2E는 Docker PostgreSQL의 `TEST_DATABASE_URL`을 계속 사용할 수 있다.

## 5. Storage bucket

Supabase Storage에서 아래 bucket을 만든다.

```env
SUPABASE_STORAGE_BUCKET_BUSINESS_CARDS="business-card-images"
SUPABASE_STORAGE_BUCKET_IMPORTS="imports"
SUPABASE_STORAGE_BUCKET_EXPORTS="exports"
```

DB에는 public URL이 아니라 `storageProvider`, `bucket`, `objectKey`, `contentType`, `sizeBytes`, `fileName` 같은 중립 metadata를 저장한다.

## 6. 검증 명령

값을 채운 뒤 다음 명령을 실행한다.

```bash
cd /Users/jaegeunsong/Desktop/workplace/Sales_b2c/BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run build
```

현재 Prisma schema에는 아직 도메인 모델이 없으므로 migration은 다음 단계에서 진행한다.

## 7. 현재 코드 연결 지점

- Auth 검증 port: `src/shared/application/ports/external-auth-verifier.port.ts`
- Storage port: `src/shared/application/ports/storage.port.ts`
- Supabase JWT adapter: `src/shared/infrastructure/supabase/supabase-jwt-verifier.adapter.ts`
- Supabase Storage adapter: `src/shared/infrastructure/supabase/supabase-storage.adapter.ts`

이 구조를 유지하면 나중에 Supabase Auth나 Storage를 다른 provider로 바꿀 때 application/domain 코드를 크게 바꾸지 않아도 된다.

## 8. 완료 기준

- `BE/.env`에 Supabase Cloud 실제 값이 들어 있다.
- `business-card-images`, `imports`, `exports` bucket이 생성되어 있다.
- `pnpm run prisma:validate`가 통과한다.
- `pnpm run typecheck`가 통과한다.
- `pnpm run build`가 통과한다.
