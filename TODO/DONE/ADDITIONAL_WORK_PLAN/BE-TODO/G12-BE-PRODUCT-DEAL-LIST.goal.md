# /goal G12 BE Product Deal List

## /goal 입력문

아래 문서를 먼저 읽고, 제품 단건 상세 페이지에서 사용할 제품 연결 딜 전체 목록 API를 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_DEAL_LIST_API.md`

## 목표

`GET /api/products/:productId/deals` API를 추가해 해당 제품이 포함된 딜 전체 목록을 반환한다.

## 구현 범위

- `BE/src/modules/product/presentation/http/product.controller.ts`
- `BE/src/modules/product/application/ports/product.repository.ts`
- `BE/src/modules/product/application/services/product-application.service.ts`
- `BE/src/modules/product/infrastructure/persistence/prisma-product.repository.ts`
- 필요 시 Product 응답 타입 또는 mapper
- controller/application 테스트
- 관련 API 계약 문서 상태 갱신

## API 계약

- Method: `GET`
- Path: `/api/products/:productId/deals`
- 인증: Backend App access token
- 권한: 본인 제품에 연결된 딜만 조회
- 페이지네이션: 없음
- 정렬: `createdAt DESC`, `id DESC`

응답:

```json
{
  "items": [
    {
      "id": "deal-id",
      "dealName": "딜 이름",
      "dealCost": 1000000,
      "dealStatus": "PROPOSAL_QUOTE",
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```

## 비즈니스 규칙

- `productId`가 현재 사용자 소유 제품인지 먼저 확인한다.
- 딜 조회는 `DealProduct.productId`와 현재 사용자 `userId` 기준으로 수행한다.
- 연결된 `Deal`도 현재 사용자 소유여야 한다.
- 응답에는 `id`, `dealName`, `dealCost`, `dealStatus`, `createdAt`만 포함한다.
- 연결된 딜이 없으면 `items: []`를 반환한다.

## 구현 제한

- 기존 `GET /api/products/:productId` 응답은 변경하지 않는다.
- 기존 Deal 목록 API는 변경하지 않는다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- 페이지네이션, 검색, 필터를 추가하지 않는다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- 본인 제품에 연결된 딜 목록만 반환한다.
- 연결된 딜이 없으면 빈 배열을 반환한다.
- 다른 사용자 제품 ID는 `ProductNotFound`로 처리한다.
- 정렬은 `Deal.createdAt DESC`, `Deal.id DESC` 기준이다.

## 완료 보고

- 변경한 파일
- 추가한 API와 응답 shape
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
