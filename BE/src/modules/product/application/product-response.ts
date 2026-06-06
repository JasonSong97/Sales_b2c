import type {
  DeleteResultRecord,
  MemoRecord,
  PaginatedResult,
  ProductConnectionRecord,
  ProductDetailRecord,
  ProductLogRecord,
  ProductRecord,
} from "@/modules/product/application/ports/product.repository";

export interface ProductResponse {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly unitPrice: number | null;
  readonly currency: string;
  readonly description: string | null;
  readonly connectionCount: number;
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface ProductConnectionResponse {
  readonly id: string;
  readonly productId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly targetName: string;
  readonly connectionType: string;
  readonly note: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface ProductLogResponse {
  readonly id: string;
  readonly productId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
  readonly permanentDeleteAt?: string | null;
}

export interface MemoResponse {
  readonly id: string;
  readonly targetType: "PRODUCT";
  readonly targetId: string;
  readonly memoDate: string;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
}

export interface ProductDetailResponse {
  readonly product: ProductResponse;
  readonly connections: ProductConnectionResponse[];
  readonly memos: MemoResponse[];
}

export interface PaginatedResponse<TItem> {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface DeleteResponse {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
}

export function toProductResponse(product: ProductRecord): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    unitPrice: product.unitPrice,
    currency: product.currency,
    description: product.description,
    connectionCount: product.connectionCount,
    hasMemo: product.memoSummary.hasMemo,
    memoCount: product.memoSummary.memoCount,
    latestMemoAt: toIsoOrNull(product.memoSummary.latestMemoAt),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(product.deletedAt),
    permanentDeleteAt: toIsoOrNull(product.permanentDeleteAt),
  };
}

export function toProductConnectionResponse(
  connection: ProductConnectionRecord
): ProductConnectionResponse {
  return {
    id: connection.id,
    productId: connection.productId,
    targetType: connection.targetType,
    targetId: connection.targetId,
    targetName: connection.targetName,
    connectionType: connection.connectionType,
    note: connection.note,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(connection.deletedAt),
    permanentDeleteAt: toIsoOrNull(connection.permanentDeleteAt),
  };
}

export function toProductLogResponse(log: ProductLogRecord): ProductLogResponse {
  return {
    id: log.id,
    productId: log.productId,
    loggedAt: log.loggedAt.toISOString(),
    title: log.title,
    content: log.content,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(log.deletedAt),
    permanentDeleteAt: toIsoOrNull(log.permanentDeleteAt),
  };
}

export function toMemoResponse(memo: MemoRecord): MemoResponse {
  return {
    id: memo.id,
    targetType: memo.targetType,
    targetId: memo.targetId,
    memoDate: memo.memoDate.toISOString(),
    title: memo.title,
    content: memo.content,
    createdAt: memo.createdAt.toISOString(),
    updatedAt: memo.updatedAt.toISOString(),
    deletedAt: toIsoOrNull(memo.deletedAt),
    permanentDeleteAt: toIsoOrNull(memo.permanentDeleteAt),
  };
}

export function toProductDetailResponse(
  detail: ProductDetailRecord
): ProductDetailResponse {
  return {
    product: toProductResponse(detail.product),
    connections: detail.connections.map(toProductConnectionResponse),
    memos: detail.memos.map(toMemoResponse),
  };
}

export function toPaginatedResponse<TInput, TOutput>(
  result: PaginatedResult<TInput>,
  mapItem: (item: TInput) => TOutput
): PaginatedResponse<TOutput> {
  return {
    items: result.items.map(mapItem),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    hasNext: result.hasNext,
  };
}

export function toDeleteResponse(result: DeleteResultRecord): DeleteResponse {
  return {
    id: result.id,
    deletedAt: result.deletedAt.toISOString(),
    permanentDeleteAt: result.permanentDeleteAt.toISOString(),
  };
}

function toIsoOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}
