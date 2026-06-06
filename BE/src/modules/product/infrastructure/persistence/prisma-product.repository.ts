import {
  PersonalMemoTargetType,
  Prisma,
  ProductConnectionTargetType as PrismaProductConnectionTargetType,
} from "@prisma/client";
import type { MemoSummaryRecord } from "@/modules/company/application/ports/company.repository";
import {
  type CreateProductConnectionInput,
  type CreateProductInput,
  type CreateProductLogInput,
  type DeleteResultRecord,
  type ListProductLogsInput,
  type ListProductsInput,
  type MemoRecord,
  type PaginatedResult,
  type ProductConnectionRecord,
  type ProductConnectionTargetType,
  type ProductDetailRecord,
  type ProductLogRecord,
  ProductRepository,
  type ProductRecord,
  type UpdateProductInput,
  type UpdateProductLogInput,
} from "@/modules/product/application/ports/product.repository";
import {
  DuplicateProductConnectionError,
  OwnershipViolationError,
  ProductConnectionNotFoundError,
  ProductConnectionTargetNotFoundError,
  ProductLogNotFoundError,
  ProductNotFoundError,
} from "@/modules/product/domain/product.errors";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ProductRow = {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly category: string | null;
  readonly description: string | null;
  readonly unitPrice: Prisma.Decimal | null;
  readonly metadata: Prisma.JsonValue | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

type ProductConnectionRow = {
  readonly id: string;
  readonly productId: string;
  readonly targetType: PrismaProductConnectionTargetType;
  readonly targetId: string;
  readonly connectionType: string;
  readonly note: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

type ProductLogRow = {
  readonly id: string;
  readonly productId: string;
  readonly logDate: Date;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

type TargetRecord = {
  readonly userId: string;
  readonly deletedAt: Date | null;
  readonly name: string;
};

export class PrismaProductRepository implements ProductRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionPort: EncryptionPort
  ) {}

  async listProducts(
    input: ListProductsInput
  ): Promise<PaginatedResult<ProductRecord>> {
    const where = this.createProductWhere(input);
    const [products, totalCount] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.product.count({ where }),
    ]);

    return {
      items: await Promise.all(
        products.map((product) => this.mapProductRecord(product))
      ),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createProduct(input: CreateProductInput): Promise<ProductRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      const product = await transaction.product.create({
        data: {
          userId: input.userId,
          name: input.name,
          category: input.category,
          description: input.description,
          unitPrice: input.unitPrice,
          metadata: this.toProductMetadataJson(input.currency),
        },
      });

      if (input.initialMemo) {
        const encrypted = await this.encryptionPort.encryptText(input.initialMemo);
        await transaction.personalMemo.create({
          data: {
            userId: input.userId,
            targetType: PersonalMemoTargetType.PRODUCT,
            targetId: product.id,
            title: "초기 Memo",
            contentCiphertext: encrypted.ciphertext,
            contentKeyVersion: encrypted.keyVersion,
          },
        });
      }

      return this.mapProductRecord(product, transaction);
    });
  }

  async getProductDetail(
    userId: string,
    productId: string
  ): Promise<ProductDetailRecord | null> {
    const product = await this.prismaService.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      return null;
    }

    const [connections, memos] = await Promise.all([
      this.listConnections(userId, productId),
      this.listMemos(userId, productId),
    ]);

    return {
      product: await this.mapProductRecord(product),
      connections,
      memos,
    };
  }

  async updateProduct(input: UpdateProductInput): Promise<ProductRecord> {
    const existing = await this.prismaService.product.findFirst({
      where: { id: input.productId, userId: input.userId },
    });

    if (!existing) {
      throw new ProductNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    const data: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.category !== undefined) {
      data.category = input.category;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.unitPrice !== undefined) {
      data.unitPrice = input.unitPrice;
    }

    if (input.currency !== undefined) {
      data.metadata = this.toProductMetadataJson(input.currency);
    }

    const product = await this.prismaService.product.update({
      where: { id: input.productId },
      data,
    });

    return this.mapProductRecord(product);
  }

  async deleteProduct(
    userId: string,
    productId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const product = await this.prismaService.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    if (product.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.product.update({
      where: { id: productId },
      data: {
        deletedAt: now,
        permanentDeleteAt,
      },
    });

    return {
      id: productId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreProduct(userId: string, productId: string): Promise<ProductRecord> {
    const product = await this.prismaService.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    const restored = await this.prismaService.product.update({
      where: { id: productId },
      data: {
        deletedAt: null,
        permanentDeleteAt: null,
      },
    });

    return this.mapProductRecord(restored);
  }

  async createProductConnection(
    input: CreateProductConnectionInput
  ): Promise<ProductConnectionRecord> {
    return this.prismaService.$transaction(async (transaction) => {
      await this.assertProductExists(
        input.userId,
        input.productId,
        "write",
        transaction
      );
      const targetName = await this.assertTargetExists(
        transaction,
        input.userId,
        input.targetType,
        input.targetId
      );
      const duplicate = await transaction.productConnection.findFirst({
        where: {
          userId: input.userId,
          productId: input.productId,
          targetType: input.targetType,
          targetId: input.targetId,
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw new DuplicateProductConnectionError();
      }

      const connection = await transaction.productConnection.create({
        data: {
          userId: input.userId,
          productId: input.productId,
          targetType: input.targetType,
          targetId: input.targetId,
          connectionType: input.connectionType,
          note: input.note,
        },
      });

      return this.mapProductConnectionRecord(connection, targetName);
    });
  }

  async deleteProductConnection(
    userId: string,
    productId: string,
    connectionId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    await this.assertProductExists(userId, productId, "write");
    const existing = await this.prismaService.productConnection.findFirst({
      where: { id: connectionId, productId, userId },
    });

    if (!existing) {
      throw new ProductConnectionNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.productConnection.update({
      where: { id: connectionId },
      data: {
        deletedAt: now,
        permanentDeleteAt,
      },
    });

    return {
      id: connectionId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async listProductLogs(
    input: ListProductLogsInput
  ): Promise<PaginatedResult<ProductLogRecord>> {
    await this.assertProductExists(input.userId, input.productId, "read");
    const where = {
      userId: input.userId,
      productId: input.productId,
      deletedAt: null,
    };
    const [logs, totalCount] = await Promise.all([
      this.prismaService.productLog.findMany({
        where,
        orderBy: { logDate: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.productLog.count({ where }),
    ]);

    return {
      items: logs.map((log) => this.mapProductLogRecord(log)),
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async createProductLog(input: CreateProductLogInput): Promise<ProductLogRecord> {
    await this.assertProductExists(input.userId, input.productId, "write");
    const log = await this.prismaService.productLog.create({
      data: {
        userId: input.userId,
        productId: input.productId,
        logDate: input.loggedAt,
        title: input.title,
        content: input.content,
      },
    });

    return this.mapProductLogRecord(log);
  }

  async updateProductLog(
    input: UpdateProductLogInput
  ): Promise<ProductLogRecord> {
    const existing = await this.prismaService.productLog.findFirst({
      where: {
        id: input.logId,
        productId: input.productId,
        userId: input.userId,
      },
    });

    if (!existing) {
      throw new ProductLogNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    const log = await this.prismaService.productLog.update({
      where: { id: input.logId },
      data: {
        ...(input.loggedAt !== undefined ? { logDate: input.loggedAt } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
      },
    });

    return this.mapProductLogRecord(log);
  }

  async deleteProductLog(
    userId: string,
    productId: string,
    logId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    const existing = await this.prismaService.productLog.findFirst({
      where: { id: logId, productId, userId },
    });

    if (!existing) {
      throw new ProductLogNotFoundError();
    }

    if (existing.deletedAt) {
      throw new DeletedResourceError("write");
    }

    await this.prismaService.productLog.update({
      where: { id: logId },
      data: {
        deletedAt: now,
        permanentDeleteAt,
      },
    });

    return {
      id: logId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  private createProductWhere(input: ListProductsInput): Prisma.ProductWhereInput {
    return {
      userId: input.userId,
      ...(input.category ? { category: input.category } : {}),
      ...(input.includeDeleted ? {} : { deletedAt: null }),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { category: { contains: input.search, mode: "insensitive" } },
              { description: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }

  private async assertProductExists(
    userId: string,
    productId: string,
    operation: "read" | "write",
    client: PrismaService | Prisma.TransactionClient = this.prismaService
  ): Promise<ProductRow> {
    const product = await client.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    if (product.deletedAt) {
      throw new DeletedResourceError(operation);
    }

    return product;
  }

  private async assertTargetExists(
    client: PrismaService | Prisma.TransactionClient,
    userId: string,
    targetType: ProductConnectionTargetType,
    targetId: string
  ): Promise<string> {
    const target = await this.findTarget(client, targetType, targetId);

    if (!target) {
      throw new ProductConnectionTargetNotFoundError();
    }

    if (target.userId !== userId) {
      throw new OwnershipViolationError();
    }

    if (target.deletedAt) {
      throw new DeletedResourceError("write");
    }

    return target.name;
  }

  private async findTarget(
    client: PrismaService | Prisma.TransactionClient,
    targetType: ProductConnectionTargetType,
    targetId: string
  ): Promise<TargetRecord | null> {
    if (targetType === "COMPANY") {
      const company = await client.company.findUnique({ where: { id: targetId } });

      return company
        ? {
            userId: company.userId,
            deletedAt: company.deletedAt,
            name: company.name,
          }
        : null;
    }

    if (targetType === "CONTACT") {
      const contact = await client.contact.findUnique({ where: { id: targetId } });

      return contact
        ? {
            userId: contact.userId,
            deletedAt: contact.deletedAt,
            name: contact.name,
          }
        : null;
    }

    const deal = await client.deal.findUnique({ where: { id: targetId } });

    return deal
      ? {
          userId: deal.userId,
          deletedAt: deal.deletedAt,
          name: deal.title,
        }
      : null;
  }

  private async mapProductRecord(
    product: ProductRow,
    client: PrismaService | Prisma.TransactionClient = this.prismaService
  ): Promise<ProductRecord> {
    return {
      id: product.id,
      userId: product.userId,
      name: product.name,
      category: product.category,
      unitPrice: product.unitPrice ? Number(product.unitPrice) : null,
      currency: this.fromProductMetadata(product.metadata).currency,
      description: product.description,
      connectionCount: await this.getConnectionCount(
        client,
        product.userId,
        product.id
      ),
      memoSummary: await this.getMemoSummary(client, product.userId, product.id),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      permanentDeleteAt: product.permanentDeleteAt,
    };
  }

  private async listConnections(
    userId: string,
    productId: string
  ): Promise<ProductConnectionRecord[]> {
    const connections = await this.prismaService.productConnection.findMany({
      where: {
        userId,
        productId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      connections.map(async (connection) => {
        const target = await this.findTarget(
          this.prismaService,
          connection.targetType,
          connection.targetId
        );

        return this.mapProductConnectionRecord(
          connection,
          target?.name ?? "Deleted target"
        );
      })
    );
  }

  private mapProductConnectionRecord(
    connection: ProductConnectionRow,
    targetName: string
  ): ProductConnectionRecord {
    return {
      id: connection.id,
      productId: connection.productId,
      targetType: connection.targetType,
      targetId: connection.targetId,
      targetName,
      connectionType: connection.connectionType as ProductConnectionRecord["connectionType"],
      note: connection.note,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
      deletedAt: connection.deletedAt,
      permanentDeleteAt: connection.permanentDeleteAt,
    };
  }

  private mapProductLogRecord(log: ProductLogRow): ProductLogRecord {
    return {
      id: log.id,
      productId: log.productId,
      loggedAt: log.logDate,
      title: log.title,
      content: log.content,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      deletedAt: log.deletedAt,
      permanentDeleteAt: log.permanentDeleteAt,
    };
  }

  private async getMemoSummary(
    client: PrismaService | Prisma.TransactionClient,
    userId: string,
    productId: string
  ): Promise<MemoSummaryRecord> {
    const [memoCount, latestMemo] = await Promise.all([
      client.personalMemo.count({
        where: {
          userId,
          targetType: PersonalMemoTargetType.PRODUCT,
          targetId: productId,
          deletedAt: null,
        },
      }),
      client.personalMemo.findFirst({
        where: {
          userId,
          targetType: PersonalMemoTargetType.PRODUCT,
          targetId: productId,
          deletedAt: null,
        },
        orderBy: { memoDate: "desc" },
      }),
    ]);

    return {
      hasMemo: memoCount > 0,
      memoCount,
      latestMemoAt: latestMemo?.memoDate ?? null,
    };
  }

  private getConnectionCount(
    client: PrismaService | Prisma.TransactionClient,
    userId: string,
    productId: string
  ): Promise<number> {
    return client.productConnection.count({
      where: {
        userId,
        productId,
        deletedAt: null,
      },
    });
  }

  private async listMemos(userId: string, productId: string): Promise<MemoRecord[]> {
    const memos = await this.prismaService.personalMemo.findMany({
      where: {
        userId,
        targetType: PersonalMemoTargetType.PRODUCT,
        targetId: productId,
        deletedAt: null,
      },
      orderBy: { memoDate: "desc" },
      take: 20,
    });

    return Promise.all(
      memos.map(async (memo) => ({
        id: memo.id,
        targetType: "PRODUCT" as const,
        targetId: memo.targetId,
        memoDate: memo.memoDate,
        title: memo.title,
        content: await this.encryptionPort.decryptText({
          ciphertext: memo.contentCiphertext,
          keyVersion: memo.contentKeyVersion,
        }),
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
        deletedAt: memo.deletedAt,
        permanentDeleteAt: memo.permanentDeleteAt,
      }))
    );
  }

  private fromProductMetadata(metadata: Prisma.JsonValue | null): {
    currency: string;
  } {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return { currency: "KRW" };
    }

    const currency = this.getStringValue(metadata, "currency");

    return { currency: currency ?? "KRW" };
  }

  private toProductMetadataJson(currency: string): Prisma.InputJsonObject {
    return { currency };
  }

  private getStringValue(
    metadata: Record<string, unknown>,
    key: string
  ): string | null {
    const value = metadata[key];

    return typeof value === "string" && value.trim().length > 0 ? value : null;
  }
}
