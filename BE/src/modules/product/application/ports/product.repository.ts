import type {
  DeleteResultRecord,
  MemoSummaryRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export type {
  DeleteResultRecord,
  PaginatedResult,
  PaginationInput,
} from "@/modules/company/application/ports/company.repository";

export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");

export type ProductConnectionTargetType = "COMPANY" | "CONTACT" | "DEAL";

export type ProductConnectionType =
  | "INTERESTED"
  | "DELIVERED"
  | "PROPOSED"
  | "COMPETITOR"
  | "MAINTENANCE"
  | "OTHER";

export interface ProductMetadata {
  readonly currency: string;
}

export interface ProductRecord {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly category: string | null;
  readonly unitPrice: number | null;
  readonly currency: string;
  readonly description: string | null;
  readonly connectionCount: number;
  readonly memoSummary: MemoSummaryRecord;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface ProductConnectionRecord {
  readonly id: string;
  readonly productId: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly targetName: string;
  readonly connectionType: ProductConnectionType;
  readonly note: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface MemoRecord {
  readonly id: string;
  readonly targetType: "PRODUCT";
  readonly targetId: string;
  readonly memoDate: Date;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface ProductLogRecord {
  readonly id: string;
  readonly productId: string;
  readonly loggedAt: Date;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}

export interface ProductDetailRecord {
  readonly product: ProductRecord;
  readonly connections: ProductConnectionRecord[];
  readonly memos: MemoRecord[];
}

export interface ListProductsInput extends PaginationInput {
  readonly userId: string;
  readonly search: string | null;
  readonly category: string | null;
  readonly includeDeleted: boolean;
}

export interface CreateProductInput {
  readonly userId: string;
  readonly name: string;
  readonly category: string | null;
  readonly unitPrice: number | null;
  readonly currency: string;
  readonly description: string | null;
  readonly initialMemo: string | null;
}

export interface UpdateProductInput {
  readonly userId: string;
  readonly productId: string;
  readonly name?: string;
  readonly category?: string | null;
  readonly unitPrice?: number | null;
  readonly currency?: string;
  readonly description?: string | null;
}

export interface CreateProductConnectionInput {
  readonly userId: string;
  readonly productId: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly connectionType: ProductConnectionType;
  readonly note: string | null;
}

export interface ListProductLogsInput extends PaginationInput {
  readonly userId: string;
  readonly productId: string;
}

export interface CreateProductLogInput {
  readonly userId: string;
  readonly productId: string;
  readonly loggedAt: Date;
  readonly title: string;
  readonly content: string;
}

export interface UpdateProductLogInput {
  readonly userId: string;
  readonly productId: string;
  readonly logId: string;
  readonly loggedAt?: Date;
  readonly title?: string;
  readonly content?: string;
}

export interface ProductRepository {
  listProducts(
    input: ListProductsInput
  ): Promise<PaginatedResult<ProductRecord>>;
  createProduct(input: CreateProductInput): Promise<ProductRecord>;
  getProductDetail(
    userId: string,
    productId: string
  ): Promise<ProductDetailRecord | null>;
  updateProduct(input: UpdateProductInput): Promise<ProductRecord>;
  deleteProduct(
    userId: string,
    productId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
  restoreProduct(userId: string, productId: string): Promise<ProductRecord>;
  createProductConnection(
    input: CreateProductConnectionInput
  ): Promise<ProductConnectionRecord>;
  deleteProductConnection(
    userId: string,
    productId: string,
    connectionId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
  listProductLogs(
    input: ListProductLogsInput
  ): Promise<PaginatedResult<ProductLogRecord>>;
  createProductLog(input: CreateProductLogInput): Promise<ProductLogRecord>;
  updateProductLog(input: UpdateProductLogInput): Promise<ProductLogRecord>;
  deleteProductLog(
    userId: string,
    productId: string,
    logId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord>;
}
