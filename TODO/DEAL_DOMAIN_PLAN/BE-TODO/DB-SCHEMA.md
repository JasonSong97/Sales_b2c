# Deal DB Schema

## 1. 목적

Deal 도메인의 Prisma 모델 추가 기준을 정의한다.

## 2. 모델

### 2.1 Deal

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `id` | uuid | 예 | primary key |
| `userId` | uuid | 예 | User FK |
| `dealName` | string | 예 | 딜 이름 |
| `dealCost` | integer | 예 | 딜 금액 |
| `companyId` | uuid | 예 | Company FK |
| `contactId` | uuid | 예 | Contact FK |
| `productId` | uuid | 예 | Product FK |
| `dealStatus` | string | 예 | 코드 enum 값 저장 |
| `expectedEndDate` | date | 예 | 마감일, API에서는 `YYYY-MM-DD` |
| `createdAt` | datetime | 예 | 생성일 |
| `updatedAt` | datetime | 예 | 최근수정일 |

### 2.2 DealFollowingActionLog

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `id` | uuid | 예 | primary key |
| `userId` | uuid | 예 | User FK |
| `dealId` | uuid | 예 | Deal FK |
| `followingAction` | string | 예 | 다음에 해야 할 행동 |
| `checkComplete` | boolean | 예 | 완료 여부, default false |
| `createdAt` | datetime | 예 | 생성일 |
| `updatedAt` | datetime | 예 | 최근수정일 |

### 2.3 DealMemoLog

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `id` | uuid | 예 | primary key |
| `userId` | uuid | 예 | User FK |
| `dealId` | uuid | 예 | Deal FK |
| `memoType` | string | 예 | 메모 타입 |
| `memo` | string | 예 | 메모 내용 |
| `createdAt` | datetime | 예 | 생성일 |
| `updatedAt` | datetime | 예 | 최근수정일 |

## 3. Prisma 초안

실제 구현 시 기존 relation 위치와 comment 스타일에 맞춰 넣는다.

```prisma
model Deal {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @db.Uuid
  dealName        String
  dealCost        Int
  companyId       String   @db.Uuid
  contactId       String   @db.Uuid
  productId       String   @db.Uuid
  dealStatus      String
  expectedEndDate DateTime @db.Date
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user                User                     @relation(fields: [userId], references: [id])
  company             Company                  @relation(fields: [companyId], references: [id])
  contact             Contact                  @relation(fields: [contactId], references: [id])
  product             Product                  @relation(fields: [productId], references: [id])
  followingActionLogs DealFollowingActionLog[]
  memoLogs            DealMemoLog[]

  @@index([userId, createdAt])
  @@index([userId, dealName])
  @@index([userId, dealStatus])
  @@index([userId, expectedEndDate])
  @@index([userId, dealCost])
  @@index([companyId])
  @@index([contactId])
  @@index([productId])
}

model DealFollowingActionLog {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @db.Uuid
  dealId          String   @db.Uuid
  followingAction String
  checkComplete   Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  deal Deal @relation(fields: [dealId], references: [id])

  @@index([dealId, createdAt])
  @@index([userId, dealId])
  @@index([userId, checkComplete])
}

model DealMemoLog {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  dealId    String   @db.Uuid
  memoType  String
  memo      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  deal Deal @relation(fields: [dealId], references: [id])

  @@index([dealId, createdAt])
  @@index([userId, dealId])
}
```

## 4. 기존 모델 relation 추가

`User`:

```prisma
deals                   Deal[]
dealFollowingActionLogs DealFollowingActionLog[]
dealMemoLogs            DealMemoLog[]
```

`Company`:

```prisma
deals Deal[]
```

`Contact`:

```prisma
deals Deal[]
```

`Product`:

```prisma
deals Deal[]
```

## 5. 상태 코드

DB에는 아래 string code만 저장한다.

| code | label |
|---|---|
| `INITIAL_CONTACT` | 초기 접촉 |
| `NEEDS_CHECK` | 니즈 확인 |
| `PROPOSAL_QUOTE` | 제안/견적 |
| `NEGOTIATION` | 협상 |
| `WON` | 성사 |
| `LOST` | 실패 |

## 6. Migration 주의사항

- DB enum을 만들지 않는다.
- 기존 데이터 migration은 없다.
- `expectedEndDate`는 Postgres `date`로 생성되는지 확인한다.
- 생성 후 Prisma Client를 갱신한다.
