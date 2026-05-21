# Backend Architecture Rules

> NestJS 백엔드의 소프트웨어 아키텍처 규칙
> **Modular Monolith + DDD + Clean Architecture**

---

## 1. 핵심 원칙

### 1.1 3대 원칙
1. **Modular Monolith**: 단일 배포 단위 안에서 Bounded Context별 모듈 분리
2. **DDD (Domain-Driven Design)**: 도메인 모델 중심 설계
3. **Clean Architecture**: 의존성은 바깥에서 안쪽으로만 (Domain ← Application ← Infrastructure)

### 1.2 절대 규칙 (위반 시 PR 거부)
- ❌ **Domain Layer가 외부 라이브러리에 의존하면 안 됨** (Prisma, NestJS 데코레이터 등)
- ❌ **Application Service에서 DB 모델(Prisma 객체)을 그대로 다루면 안 됨** — 반드시 Domain Entity/VO로 변환
- ❌ **Controller에 비즈니스 로직을 넣으면 안 됨** — Application Service에 위임
- ❌ **모듈 간 직접 import 금지** — Public Interface(Application Service)로만 통신
- ❌ **Repository를 Application 외부에서 직접 호출 금지** — 반드시 Application Service 경유

---

## 2. 디렉토리 구조

### 2.1 전체 구조

**핵심**: 각 도메인 모듈은 자체 4계층(domain/application/infrastructure/presentation)을 가짐.

```
src/
├── modules/                        # Bounded Context (도메인)별 모듈
│   │                               # 각 모듈은 자체 4계층 구조
│   ├── user/                       # User 도메인 (자체 4계층)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── auth/                       # 인증 도메인
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── customer/                   # 거래처 도메인
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── deal/                       # 영업건 도메인
│   │   ├── domain/ application/ infrastructure/ presentation/
│   │
│   ├── company/                    # 회사 도메인
│   ├── note/                       # off-the-record 메모
│   ├── business-card/              # 명함 스캔
│   │
│   └── admin/                      # ★ Admin 전용 도메인 (분리 대비)
│       ├── domain/
│       ├── application/            # 관리자 유스케이스 (사용자 관리, 통계 등)
│       ├── infrastructure/
│       └── presentation/           # /admin/api/* 라우트
│
├── shared/                         # 공통 (Shared Kernel)
│   ├── domain/                     # 공통 도메인 (Money, Address 등)
│   ├── application/                # 공통 유스케이스 인터페이스
│   ├── infrastructure/             # Prisma, Logger, Sentry 등
│   └── presentation/               # 공통 미들웨어, 가드, 필터
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── admin.guard.ts      # Role === 'ADMIN' 체크
│       └── decorators/
│           └── current-user.decorator.ts
│
├── config/                         # 환경설정
├── main.ts
└── app.module.ts
```

### 2.2 모듈 내부 구조 (4-Layer Clean Architecture)

```
modules/customer/
│
├── domain/                         # ★ 핵심 비즈니스 (외부 의존 X)
│   ├── entities/
│   │   └── customer.entity.ts     # Customer aggregate root
│   ├── value-objects/
│   │   ├── phone-number.vo.ts
│   │   ├── region.vo.ts
│   │   └── customer-id.vo.ts
│   ├── events/
│   │   └── customer-created.event.ts
│   ├── repositories/
│   │   └── customer.repository.ts # 인터페이스만 (추상)
│   ├── services/                   # Domain Service (Entity로 안 끝나는 도메인 로직)
│   │   └── customer-merge.service.ts
│   └── errors/
│       └── customer.errors.ts      # CustomerNotFoundError 등
│
├── application/                    # 유스케이스 (오케스트레이션)
│   ├── commands/                   # 쓰기 작업
│   │   ├── create-customer.command.ts
│   │   ├── update-customer.command.ts
│   │   └── delete-customer.command.ts
│   ├── queries/                    # 읽기 작업
│   │   ├── find-customer.query.ts
│   │   └── list-customers.query.ts
│   ├── handlers/                   # CQRS handler
│   │   ├── create-customer.handler.ts
│   │   └── ...
│   ├── ports/                      # 외부 시스템 인터페이스
│   │   ├── ocr.port.ts
│   │   └── storage.port.ts
│   └── services/                   # Application Service (옵션)
│       └── customer.service.ts
│
├── infrastructure/                 # 외부 시스템 어댑터
│   ├── persistence/
│   │   ├── prisma-customer.repository.ts   # CustomerRepository 구현체
│   │   └── mappers/
│   │       └── customer.mapper.ts          # Prisma ↔ Domain 변환
│   ├── http/
│   │   └── clova-ocr.adapter.ts           # OcrPort 구현
│   ├── messaging/
│   │   └── customer-event.publisher.ts
│   └── customer.module.ts                  # NestJS Module 정의
│
└── presentation/                   # API Controller (Thin)
    ├── controllers/
    │   └── customer.controller.ts
    ├── dto/
    │   ├── create-customer.dto.ts
    │   └── customer.response.dto.ts
    └── mappers/
        └── customer-response.mapper.ts     # Domain → DTO 변환
```

---

## 3. 4 Layer 상세 규칙

### 3.1 Domain Layer (가장 안쪽, 가장 중요)

**역할**: 비즈니스 규칙, 불변식, 도메인 개념의 표현

**허용**:
- TypeScript 표준 라이브러리
- 다른 도메인 Entity/VO import (같은 모듈 내)
- `shared/domain` import

**금지**:
- ❌ NestJS 데코레이터 (`@Injectable`, `@Module` 등) - 순수 클래스만
- ❌ Prisma import
- ❌ HTTP/Axios/fetch
- ❌ Logger (도메인은 부수 효과 X, 예외만 throw)

**Entity 예시**:
```typescript
// modules/customer/domain/entities/customer.entity.ts
export class Customer {
  private constructor(
    private readonly _id: CustomerId,
    private _name: string,
    private _phone: PhoneNumber | null,
    private _region: Region | null,
    private readonly _userId: UserId,
    private _createdAt: Date,
  ) {}

  static create(props: CreateCustomerProps): Customer {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidCustomerNameError();
    }
    return new Customer(
      CustomerId.generate(),
      props.name.trim(),
      props.phone ? PhoneNumber.from(props.phone) : null,
      props.region ? Region.from(props.region) : null,
      props.userId,
      new Date(),
    );
  }

  static reconstitute(props: CustomerReconstituteProps): Customer {
    // DB에서 복원할 때 (검증 없이)
    return new Customer(...);
  }

  changeRegion(region: Region): void {
    this._region = region;
  }

  get id(): CustomerId { return this._id; }
  get name(): string { return this._name; }
  // ...
}
```

**Value Object 예시**:
```typescript
// modules/customer/domain/value-objects/phone-number.vo.ts
export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static from(input: string): PhoneNumber {
    const normalized = input.replace(/[^0-9]/g, '');
    if (!/^01[0-9]{8,9}$/.test(normalized)) {
      throw new InvalidPhoneNumberError(input);
    }
    return new PhoneNumber(normalized);
  }

  toString(): string { return this.value; }
  equals(other: PhoneNumber): boolean { return this.value === other.value; }
}
```

**Repository 인터페이스 예시**:
```typescript
// modules/customer/domain/repositories/customer.repository.ts
export interface CustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
  findByUserAndPhone(userId: UserId, phone: PhoneNumber): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
  delete(id: CustomerId): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
```

---

### 3.2 Application Layer (유스케이스)

**역할**: 유스케이스 조율, 트랜잭션 경계, 권한 체크

**허용**:
- Domain Layer import
- Port 인터페이스 정의 (외부 시스템 추상)
- NestJS `@Injectable` (DI 위함)

**금지**:
- ❌ Prisma 직접 사용
- ❌ HTTP 라이브러리 직접 사용 (Port를 통해서만)
- ❌ DB 모델(Prisma 객체)을 그대로 반환

**Service 예시**:
```typescript
// modules/customer/application/services/customer.service.ts
@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: CustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async createCustomer(command: CreateCustomerCommand): Promise<Customer> {
    // 1. 중복 체크 (도메인 규칙)
    if (command.phone) {
      const existing = await this.customerRepo.findByUserAndPhone(
        command.userId,
        PhoneNumber.from(command.phone),
      );
      if (existing) throw new DuplicateCustomerError();
    }

    // 2. 도메인 객체 생성 (검증은 Customer.create에서)
    const customer = Customer.create({
      name: command.name,
      phone: command.phone,
      region: command.region,
      userId: command.userId,
    });

    // 3. 저장
    await this.customerRepo.save(customer);

    // 4. 도메인 이벤트 발행
    this.eventPublisher.publish(new CustomerCreatedEvent(customer.id));

    return customer;
  }
}
```

**Command/Query 객체**:
```typescript
// modules/customer/application/commands/create-customer.command.ts
export class CreateCustomerCommand {
  constructor(
    public readonly userId: UserId,
    public readonly name: string,
    public readonly phone?: string,
    public readonly region?: string,
  ) {}
}
```

---

### 3.3 Infrastructure Layer (외부 시스템 어댑터)

**역할**: Domain/Application의 인터페이스를 실제 기술로 구현

**허용**:
- Prisma 사용
- HTTP/Axios
- 외부 라이브러리 자유롭게
- Domain/Application import (구현하기 위해)

**Repository 구현 예시**:
```typescript
// modules/customer/infrastructure/persistence/prisma-customer.repository.ts
@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: CustomerId): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({
      where: { id: id.toString() },
    });
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async save(customer: Customer): Promise<void> {
    const data = CustomerMapper.toPersistence(customer);
    await this.prisma.customer.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
  // ...
}
```

**Mapper 예시**:
```typescript
// modules/customer/infrastructure/persistence/mappers/customer.mapper.ts
export class CustomerMapper {
  static toDomain(row: PrismaCustomer): Customer {
    return Customer.reconstitute({
      id: CustomerId.from(row.id),
      name: row.name,
      phone: row.phone ? PhoneNumber.from(row.phone) : null,
      region: row.region ? Region.from(row.region) : null,
      userId: UserId.from(row.userId),
      createdAt: row.createdAt,
    });
  }

  static toPersistence(customer: Customer): PrismaCustomerData {
    return {
      id: customer.id.toString(),
      name: customer.name,
      phone: customer.phone?.toString() ?? null,
      region: customer.region?.toString() ?? null,
      userId: customer.userId.toString(),
      createdAt: customer.createdAt,
    };
  }
}
```

**모듈 정의**:
```typescript
// modules/customer/infrastructure/customer.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [CustomerService],  // 다른 모듈이 쓰려면 Service만 export
})
export class CustomerModule {}
```

---

### 3.4 Presentation Layer (Controller, Thin)

**역할**: HTTP 요청을 Application Layer로 위임

**허용**:
- NestJS 데코레이터
- DTO 정의 + class-validator
- Application Service 호출

**금지**:
- ❌ 비즈니스 로직 (검증은 DTO 레벨, 도메인 검증은 Domain Layer)
- ❌ Repository 직접 호출
- ❌ Prisma 직접 사용
- ❌ Domain Entity를 그대로 JSON 응답 (Mapper로 DTO 변환)

**Controller 예시 (User용)**:
```typescript
// modules/customer/presentation/controllers/customer.controller.ts
@Controller('api/customers')                       // ★ /api/* 는 User용
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.createCustomer(
      new CreateCustomerCommand(
        UserId.from(user.id),
        dto.name,
        dto.phone,
        dto.region,
      ),
    );
    return CustomerResponseMapper.toDto(customer);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.findById(
      CustomerId.from(id),
      UserId.from(user.id),
    );
    return CustomerResponseMapper.toDto(customer);
  }
}
```

**Controller 예시 (Admin용)**:
```typescript
// modules/admin/presentation/controllers/admin-customer.controller.ts
@Controller('admin/api/customers')                 // ★ /admin/api/* 는 Admin용
@UseGuards(JwtAuthGuard, AdminGuard)               // ★ AdminGuard 추가
export class AdminCustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async listAll(): Promise<CustomerResponseDto[]> {
    // Admin은 모든 사용자의 거래처 조회 가능
    const customers = await this.customerService.findAllForAdmin();
    return customers.map(CustomerResponseMapper.toDto);
  }
}
```

---

## 4. 모듈 간 통신 규칙

### 4.1 동기 통신 (Application Service 호출)

```typescript
// modules/deal/application/services/deal.service.ts
@Injectable()
export class DealService {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly dealRepo: DealRepository,
    private readonly customerService: CustomerService,  // ✅ 다른 모듈의 Service 사용 OK
  ) {}

  async createDeal(command: CreateDealCommand): Promise<Deal> {
    // 거래처 존재 확인 (Customer 모듈 호출)
    const customer = await this.customerService.findById(command.customerId, command.userId);
    
    const deal = Deal.create({ ...command, customerId: customer.id });
    await this.dealRepo.save(deal);
    return deal;
  }
}
```

**❌ 금지**:
```typescript
// 다른 모듈의 Repository를 직접 호출 X
constructor(
  @Inject(CUSTOMER_REPOSITORY) private customerRepo: CustomerRepository,
) {}
```

### 4.2 비동기 통신 (도메인 이벤트)

모듈 간 느슨한 결합이 필요할 때 (예: 거래처 생성 시 명함 OCR 처리):

```typescript
// modules/business-card 가 customer-created 이벤트 구독
@EventsHandler(CustomerCreatedEvent)
export class CustomerCreatedHandler {
  async handle(event: CustomerCreatedEvent) {
    // 명함 OCR 후처리 등
  }
}
```

---

## 5. 트랜잭션 처리

### 5.1 Application Service에서 트랜잭션 경계 설정

```typescript
@Injectable()
export class DealService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(DEAL_REPOSITORY) private readonly dealRepo: DealRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: CustomerRepository,
  ) {}

  async createDealWithNewCustomer(cmd: CreateDealWithCustomerCommand) {
    return this.prisma.$transaction(async (tx) => {
      const customer = Customer.create({ ... });
      await this.customerRepo.saveWithTx(customer, tx);

      const deal = Deal.create({ customerId: customer.id, ... });
      await this.dealRepo.saveWithTx(deal, tx);

      return deal;
    });
  }
}
```

**규칙**:
- 트랜잭션은 Application Layer에서만 시작
- Domain Layer는 트랜잭션을 모름
- 복잡해지면 Unit of Work 패턴 도입

---

## 6. 에러 처리

### 6.1 Domain Error
```typescript
// modules/customer/domain/errors/customer.errors.ts
export class CustomerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Customer not found: ${id}`, 'CUSTOMER_NOT_FOUND');
  }
}

export class DuplicateCustomerError extends DomainError {
  constructor() {
    super('Customer with this phone already exists', 'DUPLICATE_CUSTOMER');
  }
}
```

### 6.2 Exception Filter로 HTTP 변환
```typescript
// shared/presentation/filters/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusMap: Record<string, number> = {
      CUSTOMER_NOT_FOUND: 404,
      DUPLICATE_CUSTOMER: 409,
      INVALID_PHONE_NUMBER: 400,
    };

    const status = statusMap[error.code] ?? 400;
    response.status(status).json({
      code: error.code,
      message: error.message,
    });
  }
}
```

---

## 7. 의존성 규칙 (Dependency Rule)

```
┌─────────────────────────────────────────┐
│  Presentation (Controller, DTO)         │ ←─┐
└─────────────────────────────────────────┘   │
                  ↓                            │
┌─────────────────────────────────────────┐   │
│  Application (Service, Command, Query)  │   │ 의존 방향
└─────────────────────────────────────────┘   │
                  ↓                            │
┌─────────────────────────────────────────┐   │
│  Domain (Entity, VO, Repo Interface)    │   │
└─────────────────────────────────────────┘   │
                  ↑                            │
┌─────────────────────────────────────────┐   │
│  Infrastructure (Prisma Repo 구현 등)   │ ──┘
└─────────────────────────────────────────┘
```

**핵심**: Infrastructure는 Domain의 인터페이스를 구현하지만, Domain은 Infrastructure를 모름 (의존성 역전)

---

## 8. 폴더 명명 규칙

| 항목 | 명명 |
|------|------|
| Entity | `customer.entity.ts` (단수 + .entity.ts) |
| Value Object | `phone-number.vo.ts` |
| Repository 인터페이스 | `customer.repository.ts` |
| Repository 구현 | `prisma-customer.repository.ts` |
| Service | `customer.service.ts` |
| Command | `create-customer.command.ts` |
| Query | `find-customer.query.ts` |
| Event | `customer-created.event.ts` |
| Handler | `create-customer.handler.ts` |
| Controller | `customer.controller.ts` |
| DTO (요청) | `create-customer.dto.ts` |
| DTO (응답) | `customer.response.dto.ts` |
| Mapper | `customer.mapper.ts` |
| Error | `customer.errors.ts` |

---

## 9. 새 모듈 만들 때 체크리스트

```
☐ domain/
  ☐ entities/ (aggregate root 1개 이상)
  ☐ value-objects/
  ☐ repositories/ (인터페이스 + Symbol)
  ☐ errors/
☐ application/
  ☐ commands/ + queries/
  ☐ services/
  ☐ ports/ (외부 시스템 인터페이스)
☐ infrastructure/
  ☐ persistence/ (Prisma 구현 + Mapper)
  ☐ <module>.module.ts (NestJS 모듈, Repository 바인딩)
☐ presentation/
  ☐ controllers/
  ☐ dto/
  ☐ mappers/ (Domain → DTO)
```

---

## 10. 안티 패턴 (Don't)

### 10.1 ❌ Anemic Domain Model
```typescript
// ❌ 나쁨: Entity에 getter/setter만
export class Customer {
  id: string;
  name: string;
  phone: string;
  // ... 비즈니스 로직 X
}
```

```typescript
// ✅ 좋음: 비즈니스 로직이 Entity에
export class Customer {
  changeRegion(region: Region): void { ... }
  canBeMergedWith(other: Customer): boolean { ... }
}
```

### 10.2 ❌ Application Service에서 Prisma 직접 사용
```typescript
// ❌ 나쁨
async createCustomer(dto: CreateCustomerDto) {
  return this.prisma.customer.create({ data: dto });
}
```

```typescript
// ✅ 좋음
async createCustomer(cmd: CreateCustomerCommand) {
  const customer = Customer.create({ ... });
  await this.customerRepo.save(customer);
  return customer;
}
```

### 10.3 ❌ Domain에서 외부 라이브러리 import
```typescript
// ❌ 나쁨
import { Injectable } from '@nestjs/common';
import { PrismaCustomer } from '@prisma/client';

@Injectable()  // 도메인이 NestJS를 알면 안 됨
export class Customer { ... }
```

### 10.4 ❌ Controller에서 Domain 직접 반환
```typescript
// ❌ 나쁨: Domain 객체를 그대로 JSON으로
return customer;
```

```typescript
// ✅ 좋음: DTO로 변환
return CustomerResponseMapper.toDto(customer);
```

### 10.5 ❌ 모듈 간 Repository 직접 호출
```typescript
// ❌ 나쁨: Deal 모듈이 Customer Repository를 직접 사용
constructor(@Inject(CUSTOMER_REPOSITORY) private customerRepo: CustomerRepository) {}
```

```typescript
// ✅ 좋음: Customer Service를 통해서
constructor(private readonly customerService: CustomerService) {}
```

---

## 11. Admin vs User 분리 전략 (단일 백엔드)

### 11.1 기본 방침
**같은 백엔드 서버에서 Admin/User를 처리하되, 나중에 분리 가능하도록 코드 영역을 미리 분리한다.**

- 빠른 개발 우선 (Phase 1~4)
- 분리 신호 감지 시 1~2일 내 분리 가능하도록 설계

### 11.2 라우트 분리

| 영역 | URL 접두사 | 가드 | 위치 |
|------|----------|-----|------|
| User API | `/api/*` | `JwtAuthGuard` | 각 도메인 모듈의 `presentation/controllers/` |
| Admin API | `/admin/api/*` | `JwtAuthGuard` + `AdminGuard` | `modules/admin/presentation/` 또는 도메인 모듈 내 별도 controller |

### 11.3 Role 기반 권한 (User 테이블 컬럼)

```typescript
// modules/user/domain/value-objects/user-role.vo.ts
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// User Entity에 role 포함
export class User {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private _role: UserRole,
    // ...
  ) {}
  
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }
}
```

```typescript
// shared/presentation/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // JwtAuthGuard가 채워둠
    
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
```

JWT 페이로드에 `role` 포함:
```typescript
{
  sub: 'user-uuid',
  email: 'user@example.com',
  role: 'ADMIN',  // ★
  exp: ...
}
```

### 11.4 Admin 전용 도메인 로직 위치

#### 케이스 A: 도메인 모듈에 Admin Controller 추가
거래처/영업건 같은 **기존 도메인을 관리자도 조회**하는 경우:

```
modules/customer/
├── domain/                              # 공유
├── application/
│   └── services/
│       └── customer.service.ts          # findByUser(), findAllForAdmin() 둘 다 정의
├── infrastructure/
└── presentation/
    ├── controllers/
    │   ├── customer.controller.ts       # User용 (/api/customers)
    │   └── admin-customer.controller.ts # Admin용 (/admin/api/customers)
    └── dto/
```

**Application Service 예시**:
```typescript
@Injectable()
export class CustomerService {
  // User: 본인 거래처만
  async findByUser(userId: UserId): Promise<Customer[]> {
    return this.customerRepo.findByUserId(userId);
  }
  
  // ★ Admin 전용 메서드는 이름에 명시
  async findAllForAdmin(): Promise<Customer[]> {
    return this.customerRepo.findAll();
  }
  
  async countAllForAdmin(): Promise<number> {
    return this.customerRepo.count();
  }
}
```

#### 케이스 B: Admin 전용 도메인 (사용자 관리, 시스템 통계)
관리자만 다루는 새 도메인:

```
modules/admin/
├── domain/
│   ├── entities/
│   │   └── system-metrics.entity.ts
│   └── services/
│       └── user-management.service.ts
├── application/
│   ├── services/
│   │   ├── user-management.service.ts  # 사용자 활성화/비활성화 등
│   │   └── metrics.service.ts          # 전체 통계
│   └── ports/
├── infrastructure/
│   └── persistence/
└── presentation/
    └── controllers/
        ├── admin-user-management.controller.ts
        └── admin-metrics.controller.ts
```

### 11.5 절대 규칙 (Admin 분리 대비)

- ✅ Admin Controller는 **반드시 `/admin/api/*` 접두사**
- ✅ Admin Controller는 **반드시 `AdminGuard` 사용**
- ✅ Admin 전용 메서드는 이름에 `ForAdmin` 명시 (예: `findAllForAdmin`)
- ✅ Admin 전용 도메인은 `modules/admin/`으로 격리
- ❌ User Controller에서 role 체크로 Admin 기능 분기 금지 (반드시 별도 Controller)
- ❌ Admin이 User의 Application Service를 호출할 때 user_id 우회 금지 (Admin 전용 메서드 사용)

### 11.6 분리 시점 신호 (참고)

다음 중 발생 시 백엔드 분리 검토:
- Admin이 무거운 통계/분석 쿼리로 User API 응답 느려짐
- Admin 사용자 수 증가 (관리자가 10명+)
- 보안 격리 요구 강해짐 (Admin은 VPN 안에서만 접근 등)
- Admin 배포 주기와 User 배포 주기가 달라짐

### 11.7 분리 작업 (분리 시점 도달 시)

1. `modules/admin/` 폴더 전체를 새 레포로 복사
2. 공유 도메인 모듈(`customer`, `deal` 등)은 npm 패키지로 추출하거나 복사
3. Admin 전용 메서드(`findAllForAdmin`)를 새 서버에서 활성화
4. 기존 단일 서버에서 Admin 라우트 제거
5. DNS: `admin-api.yourdomain.com` 추가

---

## 12. 설계 철학 — 백엔드 엔지니어 10년차의 관점

> 이 문서의 모든 구체 규칙은 아래 4가지 마음가짐에서 파생된다. 규칙이 충돌할 때는 이 철학으로 되돌아온다.

### 12.1 "도메인을 보존하고, 기술을 갈아끼운다"
- Postgres가 5년 후에도 최선이라는 보장은 없다. CLOVA OCR이 단종될 수 있다. NestJS가 바뀔 수도 있다.
- **변하지 않는 것**: 영업사원이 거래처를 관리하고 명함을 디지털화한다는 **도메인 본질**.
- **변하는 것**: ORM, HTTP 프레임워크, OCR 공급자, 호스팅.
- → Domain Layer가 외부 라이브러리에 의존하면 안 되는 진짜 이유. "Clean Architecture 책에 그렇게 적혀서"가 아니다.

### 12.2 "쓰는 시점이 아니라 지우는 시점에 진가가 드러난다"
- 코드를 추가하는 비용보다 **삭제/교체 비용이 진짜 비용**이다.
- 한 모듈을 통째로 떼어내거나 새 구현체로 교체할 때 다른 모듈이 무너지지 않아야 한다.
- → 모듈 간 통신은 반드시 Application Service 경유. Repository 직접 import 금지. Public Interface(`index.ts`/`exports`)만 노출.
- → 이게 "modules/admin/ 폴더만 떼면 새 서버" 약속의 실체적 근거.

### 12.3 "Anemic Domain은 절차지향의 가면을 쓴 객체지향"
- Entity가 getter/setter만 갖고 있고 비즈니스 로직이 Service에 흩어지면, 그건 객체지향이 아니라 그냥 함수 모음.
- **불변식(invariant)은 Entity 안에서 지킨다.** 예: "거래처 전화번호는 한국 휴대폰 형식" → `PhoneNumber.from()`이 throw, `Customer.create()`가 강제.
- Service는 오케스트레이션(여러 Entity/Repo 조합)이지 비즈니스 규칙의 본거지가 아니다.
- → 새 도메인 모듈을 만들 때 첫 번째 질문: "이 도메인의 불변식은 무엇인가?"

### 12.4 "결정은 미루지 말고, 잠금만 미뤄라"
- "나중에 결정하자"는 보통 "지금 결정하기 싫다"의 가면 — 결국 default 선택지가 결정이 된다.
- 대신 **결정은 지금 하되, 한쪽으로 잠금되는 시점을 미룬다**. 예시:
  - DB는 Postgres로 결정하지만, Repository 인터페이스를 통해 호출 → 나중에 다른 DB로 교체 가능
  - OCR은 CLOVA로 결정하지만, `OcrPort` 인터페이스를 통해 호출 → 새 OCR로 교체 가능
- → 이게 "Application Layer는 Port를 통해서만 외부 시스템 호출"의 진짜 이유.

---

## 13. DB 스키마 설계 원칙 — 확장성 + 유지보수성

> 본 프로젝트의 모든 Prisma 스키마와 마이그레이션은 아래 원칙을 따른다.
> "지금 편한 스키마"가 아니라 **"2년 후의 나도 이해할 수 있는 스키마"**.
>
> ⚠️ **이 문서는 원칙만 정의**. 구체 테이블 설계(컬럼/관계/인덱스)는 사용자가 전체 그림을 본 후 직접 진행 예정.

### 13.1 핵심 원칙 6가지

| # | 원칙 | 한 줄 요약 |
|---|------|----------|
| 1 | **식별자는 의미를 담지 않는다** | PK는 UUID 또는 ULID. 비즈니스 의미(이메일/사업자번호)는 unique constraint로 별도 보장 |
| 2 | **시간은 항상 기록한다** | 모든 테이블에 `createdAt`, `updatedAt`. 사용자 행동 추적 가능한 테이블엔 `deletedAt` 추가 |
| 3 | **소유자는 명시한다** | 모든 사용자 데이터 테이블에 `userId` 컬럼 + RLS + 백엔드 쿼리 강제 |
| 4 | **삭제는 신중하다** | 영업 데이터는 기본 Soft Delete (`deletedAt`). Hard Delete는 명시적 사유와 함께 |
| 5 | **확장 컬럼은 분리한다** | 자주 추가될 필드는 별도 테이블 또는 `metadata jsonb`로 분리해 마이그레이션 비용 절감 |
| 6 | **참조 무결성은 DB가 보장한다** | FK 제약은 항상 명시. 애플리케이션이 일관성을 책임지지 않는다 |

### 13.2 식별자 정책

**왜 자동 증가 정수가 아닌가**:
- ID가 외부에 노출되면 "1번 사용자, 2번 사용자" 정보 유출 (사용자 수 추정 가능)
- 분산 환경/오프라인 동기화에서 ID 충돌
- 모바일 오프라인 큐에서 클라이언트가 ID를 미리 발급 가능해야 함 (UUID/ULID)

**선택**:
- **ULID** 권장 (시간순 정렬 가능 + 인덱스 성능 좋음 + 충돌 안전)
- UUID v7도 가능 (시간순 정렬 + UUID 호환성)
- UUID v4는 시간순 정렬 불가 → B-tree 인덱스 페이지 분할로 쓰기 성능 저하

**예시**:
```prisma
model Customer {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  // ... 또는 애플리케이션에서 ULID 생성
}
```

### 13.3 시간 컬럼 규약

모든 비-임시 테이블은 다음을 갖는다:

```prisma
createdAt DateTime @default(now())              @db.Timestamptz
updatedAt DateTime @updatedAt                   @db.Timestamptz
deletedAt DateTime?                             @db.Timestamptz  // Soft Delete가 필요한 테이블
```

**규칙**:
- 항상 `Timestamptz` (UTC 저장 + 표시는 클라이언트에서 변환)
- `Date`/`Time` 단독 사용은 도메인 명확할 때만 (예: 영업건의 `expectedCloseDate`는 시간 의미 없으면 Date OK)
- **절대 epoch 정수로 저장 금지** — 디버깅 지옥

### 13.4 Soft Delete 정책

| 도메인 | 정책 | 이유 |
|--------|------|------|
| `customer`, `deal`, `note`, `company` | **Soft Delete** | 영업 데이터는 복구 요청 100% 발생 |
| `business_card` (원본 이미지) | Soft Delete + 30일 후 자동 Hard Delete (스토리지 비용) | 단기 복구는 가능, 장기 보관은 비용 |
| 임시 데이터 (`refresh_token`, `signed_url_cache`) | Hard Delete | 의미 없음 |
| 감사 로그 (`audit_log`) | **Hard Delete 금지** | 법적/내부 추적 |

**쿼리 규칙**:
- 기본 Repository는 `deletedAt IS NULL` 자동 필터링
- Admin/복구 메서드만 `includeDeleted: true` 옵션 노출
- 인덱스에 `WHERE deletedAt IS NULL` 부분 인덱스 활용

### 13.5 RLS (Row Level Security) + 백엔드 이중 방어

```sql
-- Supabase Postgres RLS 예시
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_owner_policy ON customers
  USING (user_id = auth.uid());
```

**원칙**:
- RLS는 **마지막 방어선** — 백엔드 쿼리에서도 항상 `where: { userId: currentUser.id }` 명시
- Admin은 RLS 우회 (`service_role` 키 사용) — 단, Application Service에 명시적 메서드(`findAllForAdmin`)만 허용
- RLS 정책 변경 시 마이그레이션에 포함, 코드 리뷰 필수

### 13.6 확장 컬럼 vs 정규화 결정 트리

새 필드 추가 시 다음 순서로 판단:

```
1. 모든 사용자가 쓸 필드인가?
   YES → 컬럼으로 추가 (마이그레이션)
   NO → 2로
2. 검색/필터에 쓰이는가?
   YES → 별도 테이블 (정규화) + 인덱스
   NO → 3으로
3. 자주 바뀌는 자유 형식인가?
   YES → metadata jsonb 컬럼 (단, 쿼리 어려움 주의)
   NO → 컬럼으로 추가
```

**예시 — Customer 도메인 확장**:
- "거래처 등급" (모든 사용자 → ENUM 컬럼)
- "태그" (검색에 쓰임 + 다대다 → `customer_tags` 테이블)
- "OCR 원본 텍스트" (저장만 함, 검색 안 함 → `ocrRawText TEXT` 또는 jsonb)

### 13.7 ENUM vs Lookup Table

| 상황 | 선택 |
|------|------|
| 값이 코드에서 분기 로직에 쓰임 (status: lead/in_progress/won/lost) | **ENUM** (Prisma enum) |
| 사용자가 직접 추가/수정 가능 | **Lookup Table** + FK |
| 다국어 표시명 필요 | **Lookup Table** (ENUM은 표시명 분리 어려움) |

**ENUM 변경 비용**: Postgres ENUM은 값 추가는 쉽지만 **삭제/리네임이 매우 어렵다**. 확실하지 않으면 Lookup Table.

### 13.8 인덱스 설계 기본

- 모든 FK 컬럼에 인덱스 (Prisma는 자동 안 해줌)
- `userId` + 자주 쓰는 필터 컬럼 복합 인덱스: `@@index([userId, region])`, `@@index([userId, status])`
- Soft Delete 사용 테이블: 부분 인덱스 `WHERE deletedAt IS NULL`
- 검색 컬럼: `pg_trgm` GIN 인덱스 ([06_추가_권장_작업.md](../../06_추가_권장_작업.md) C-04 참고)

**금지**:
- 출시 전 "혹시 모르니" 인덱스 남발 금지 (쓰기 성능 저하)
- 측정 없는 최적화 금지 — `EXPLAIN ANALYZE` 후 추가

### 13.9 마이그레이션 규약

| 변경 종류 | 절차 |
|----------|------|
| **컬럼 추가 (nullable)** | 단일 마이그레이션 OK |
| **컬럼 추가 (NOT NULL)** | 2단계: ① nullable 추가 + 기본값 채우기 → ② NOT NULL 제약 |
| **컬럼 삭제** | 2단계: ① 코드에서 제거 + 배포 → ② 다음 릴리즈에서 컬럼 drop |
| **컬럼 리네임** | 3단계: ① 새 컬럼 추가 → ② 양쪽 쓰기 + 읽기는 새 컬럼 → ③ 옛 컬럼 drop |
| **테이블 분할/병합** | 별도 RFC 문서 + 더블 라이트 기간 운영 |

**원칙**:
- 마이그레이션 파일명은 `YYYYMMDDHHmmss_description.sql` (Prisma 자동)
- 모든 마이그레이션은 **롤백 가능**해야 함 (down 스크립트는 Prisma가 안 만들어주지만 PR 설명에 명시)
- 프로덕션 마이그레이션 전 staging에서 실제 데이터 크기로 시간 측정

### 13.10 트랜잭션 + 이벤트 일관성

- 한 유스케이스 내 여러 테이블 쓰기는 반드시 트랜잭션 (`prisma.$transaction`)
- 트랜잭션 시작은 Application Service 안에서만 (Domain은 모름)
- 도메인 이벤트는 **트랜잭션 커밋 후 발행** (Outbox 패턴 권장):
  - 트랜잭션 안: `outbox` 테이블에 이벤트 row insert
  - 트랜잭션 후: 별도 워커가 outbox 읽어 publish
  - 이유: 이벤트 발행 실패 시에도 비즈니스 데이터는 일관

### 13.11 안티 패턴

| ❌ 안티 패턴 | ✅ 대안 |
|------------|--------|
| 비즈니스 의미 담은 PK (예: `customer_email`을 PK로) | 서버 생성 UUID/ULID + email은 unique constraint |
| 모든 컬럼 nullable | NOT NULL이 기본, null은 의미가 명확할 때만 |
| `flag1 INT, flag2 INT, ...` 같은 익명 boolean | 도메인 의미 담은 컬럼 또는 별도 테이블 |
| `data JSON` 한 컬럼에 모든 것 | 핵심 필드는 정규화, 자유 형식만 jsonb |
| FK 없이 ID만 저장 | FK 제약 항상 명시 (CASCADE/RESTRICT 명확히) |
| 텍스트 검색에 `LIKE '%foo%'` | `pg_trgm` + GIN 인덱스 |
| 정수 ID auto increment 외부 노출 | UUID/ULID로 정보 유출 차단 |
| `enum` 마구 추가 | 변경 가능성 있으면 Lookup Table |

### 13.12 새 도메인 추가 시 스키마 체크리스트

```
☐ PK는 UUID/ULID
☐ userId FK (사용자 데이터인 경우)
☐ createdAt / updatedAt
☐ deletedAt (Soft Delete 필요 시)
☐ 모든 FK에 인덱스
☐ 자주 쓰는 필터 컬럼에 복합 인덱스
☐ RLS 정책 정의
☐ 마이그레이션이 무중단으로 가능한지 검증
☐ Domain Entity ↔ Prisma row 매핑 함수 (Mapper)
☐ Repository 인터페이스 (Domain) + 구현 (Infrastructure) 분리
```

---

## 14. AI에게 작업 시킬 때 강조할 것

1. "이 모듈의 도메인 레이어는 NestJS와 Prisma를 import하지 마라"
2. "Application Service는 반드시 Domain Entity로 작업하고, Repository를 통해 저장하라"
3. "Controller에는 비즈니스 로직 넣지 말고, Service에 위임만 해라"
4. "다른 모듈을 쓸 때는 Application Service만 호출하라 (Repository 직접 X)"
5. "응답은 Domain Entity가 아니라 DTO로 변환해서 반환하라"
6. "User용 Controller는 /api/*, Admin용은 /admin/api/* 접두사 + AdminGuard 사용"
7. "Admin 전용 메서드는 이름에 ForAdmin 명시 (findAllForAdmin 등)"
8. "각 도메인 모듈은 자체 4계층(domain/application/infrastructure/presentation)을 가진다"
9. "DB 스키마는 13장 원칙 준수 — UUID/ULID PK, createdAt/updatedAt 필수, Soft Delete 기본, RLS + 백엔드 이중 방어"
10. "마이그레이션은 무중단 절차(13.9) 따를 것. NOT NULL 컬럼 추가는 2단계 마이그레이션"
