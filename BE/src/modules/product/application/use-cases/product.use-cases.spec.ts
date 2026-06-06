import type {
  CreateProductConnectionInput,
  CreateProductInput,
  CreateProductLogInput,
  DeleteResultRecord,
  ListProductLogsInput,
  ListProductsInput,
  PaginatedResult,
  ProductConnectionRecord,
  ProductDetailRecord,
  ProductLogRecord,
  ProductRecord,
  ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";
import { CreateProductUseCase } from "./create-product.use-case";
import { CreateProductConnectionUseCase } from "./create-product-connection.use-case";
import { CreateProductLogUseCase } from "./create-product-log.use-case";
import { DeleteProductUseCase } from "./delete-product.use-case";
import { GetProductUseCase } from "./get-product.use-case";
import { ListProductsUseCase } from "./list-products.use-case";

class FakeProductRepository implements ProductRepository {
  createInput: CreateProductInput | null = null;
  listInput: ListProductsInput | null = null;
  connectionInput: CreateProductConnectionInput | null = null;
  logInput: CreateProductLogInput | null = null;
  deleteInput: {
    readonly userId: string;
    readonly productId: string;
  } | null = null;
  detail: ProductDetailRecord | null = null;

  async listProducts(
    input: ListProductsInput
  ): Promise<PaginatedResult<ProductRecord>> {
    this.listInput = input;

    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createProduct(input: CreateProductInput): Promise<ProductRecord> {
    this.createInput = input;

    return createProductRecord({
      id: "product-1",
      userId: input.userId,
      name: input.name,
      category: input.category,
      unitPrice: input.unitPrice,
      currency: input.currency,
      deletedAt: null,
    });
  }

  async getProductDetail(): Promise<ProductDetailRecord | null> {
    return this.detail;
  }

  async updateProduct(): Promise<ProductRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async deleteProduct(
    userId: string,
    productId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    this.deleteInput = { userId, productId };

    return {
      id: productId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreProduct(): Promise<ProductRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async createProductConnection(
    input: CreateProductConnectionInput
  ): Promise<ProductConnectionRecord> {
    this.connectionInput = input;

    const now = new Date("2026-06-06T00:00:00.000Z");

    return {
      id: "connection-1",
      productId: input.productId,
      targetType: input.targetType,
      targetId: input.targetId,
      targetName: "에이컴 코리아",
      connectionType: input.connectionType,
      note: input.note,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      permanentDeleteAt: null,
    };
  }

  async deleteProductConnection(): Promise<DeleteResultRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async listProductLogs(
    input: ListProductLogsInput
  ): Promise<PaginatedResult<ProductLogRecord>> {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createProductLog(
    input: CreateProductLogInput
  ): Promise<ProductLogRecord> {
    this.logInput = input;

    const now = new Date("2026-06-06T00:00:00.000Z");

    return {
      id: "log-1",
      productId: input.productId,
      loggedAt: input.loggedAt,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      permanentDeleteAt: null,
    };
  }

  async updateProductLog(): Promise<ProductLogRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async deleteProductLog(): Promise<DeleteResultRecord> {
    throw new Error("Not implemented in fake repository");
  }
}

describe("Product use cases", () => {
  it("normalizes create input and passes current user ownership", async () => {
    const repository = new FakeProductRepository();
    const useCase = new CreateProductUseCase(repository);

    await useCase.execute(currentUser(), {
      name: "  월간 구독 상품  ",
      category: "  SaaS  ",
      unitPrice: 120000,
      currency: " usd ",
      description: "  B2B 월간 플랜  ",
      initialMemo: "  초기 설명 메모  ",
    });

    expect(repository.createInput).toMatchObject({
      userId: "user-1",
      name: "월간 구독 상품",
      category: "SaaS",
      unitPrice: 120000,
      currency: "USD",
      description: "B2B 월간 플랜",
      initialMemo: "초기 설명 메모",
    });
  });

  it("defaults currency to KRW and allows an empty price", async () => {
    const repository = new FakeProductRepository();
    const useCase = new CreateProductUseCase(repository);

    await useCase.execute(currentUser(), {
      name: "상품",
    });

    expect(repository.createInput?.currency).toBe("KRW");
    expect(repository.createInput?.unitPrice).toBeNull();
  });

  it("rejects invalid product creation values", async () => {
    const repository = new FakeProductRepository();
    const useCase = new CreateProductUseCase(repository);

    await expect(
      useCase.execute(currentUser(), {
        name: "   ",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    await expect(
      useCase.execute(currentUser(), {
        name: "상품",
        unitPrice: -1,
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    await expect(
      useCase.execute(currentUser(), {
        name: "상품",
        currency: "WON",
      })
    ).resolves.toMatchObject({
      currency: "WON",
    });
  });

  it("normalizes list pagination, search, category, and deleted filter", async () => {
    const repository = new FakeProductRepository();
    const useCase = new ListProductsUseCase(repository);

    await useCase.execute(currentUser(), {
      page: -1,
      pageSize: 500,
      search: "  구독  ",
      category: "  SaaS  ",
      includeDeleted: true,
    });

    expect(repository.listInput).toEqual({
      userId: "user-1",
      page: 1,
      pageSize: 100,
      search: "구독",
      category: "SaaS",
      includeDeleted: true,
    });
  });

  it("returns DeletedResource for deleted product detail reads", async () => {
    const repository = new FakeProductRepository();
    repository.detail = {
      product: createProductRecord({
        id: "product-1",
        userId: "user-1",
        name: "삭제된 상품",
        category: null,
        unitPrice: null,
        currency: "KRW",
        deletedAt: new Date("2026-06-06T00:00:00.000Z"),
      }),
      connections: [],
      memos: [],
    };
    const useCase = new GetProductUseCase(repository);

    await expect(
      useCase.execute(currentUser(), "product-1")
    ).rejects.toBeInstanceOf(DeletedResourceError);
  });

  it("normalizes connection input and validates enum values", async () => {
    const repository = new FakeProductRepository();
    const useCase = new CreateProductConnectionUseCase(repository);

    await useCase.execute(currentUser(), "product-1", {
      targetType: "COMPANY",
      targetId: "  company-1  ",
      connectionType: "INTERESTED",
      note: "  도입 관심  ",
    });

    expect(repository.connectionInput).toEqual({
      userId: "user-1",
      productId: "product-1",
      targetType: "COMPANY",
      targetId: "company-1",
      connectionType: "INTERESTED",
      note: "도입 관심",
    });

    await expect(
      useCase.execute(currentUser(), "product-1", {
        targetType: "UNKNOWN",
        targetId: "company-1",
        connectionType: "INTERESTED",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("normalizes product log input", async () => {
    const repository = new FakeProductRepository();
    const useCase = new CreateProductLogUseCase(repository);
    const loggedAt = new Date("2026-06-06T01:00:00.000Z");

    await useCase.execute(currentUser(), "product-1", {
      loggedAt,
      title: "  제안서 전달  ",
      content: "  단가표 포함  ",
    });

    expect(repository.logInput).toEqual({
      userId: "user-1",
      productId: "product-1",
      loggedAt,
      title: "제안서 전달",
      content: "단가표 포함",
    });
  });

  it("passes current user ownership to delete", async () => {
    const repository = new FakeProductRepository();
    const useCase = new DeleteProductUseCase(repository);

    const response = await useCase.execute(currentUser(), "product-1");

    expect(repository.deleteInput).toEqual({
      userId: "user-1",
      productId: "product-1",
    });
    expect(response.id).toBe("product-1");
  });
});

function currentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: "ACTIVE",
  };
}

function createProductRecord(input: {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly category: string | null;
  readonly unitPrice: number | null;
  readonly currency: string;
  readonly deletedAt: Date | null;
}): ProductRecord {
  const now = new Date("2026-06-06T00:00:00.000Z");

  return {
    id: input.id,
    userId: input.userId,
    name: input.name,
    category: input.category,
    unitPrice: input.unitPrice,
    currency: input.currency,
    description: null,
    connectionCount: 0,
    memoSummary: {
      hasMemo: false,
      memoCount: 0,
      latestMemoAt: null,
    },
    createdAt: now,
    updatedAt: now,
    deletedAt: input.deletedAt,
    permanentDeleteAt: null,
  };
}
