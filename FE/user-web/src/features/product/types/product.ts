export type Product = {
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
};

export type ProductConnectionTargetType = "COMPANY" | "CONTACT" | "DEAL";

export type ProductConnectionType =
  | "INTERESTED"
  | "DELIVERED"
  | "PROPOSED"
  | "COMPETITOR"
  | "MAINTENANCE"
  | "OTHER";

export type ProductConnection = {
  readonly id: string;
  readonly productId: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly targetName: string;
  readonly connectionType: ProductConnectionType;
  readonly note: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type ProductMemo = {
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
};

export type ProductLog = {
  readonly id: string;
  readonly productId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
  readonly permanentDeleteAt?: string | null;
};

export type ProductDetail = {
  readonly product: Product;
  readonly connections: ProductConnection[];
  readonly memos: ProductMemo[];
};

export type PaginatedResponse<TItem> = {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
};

export type ProductListResponse = PaginatedResponse<Product>;
export type ProductLogListResponse = PaginatedResponse<ProductLog>;

export type DeleteProductResponse = {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
};

export type ProductListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly category?: string;
  readonly includeDeleted?: boolean;
};

export type ProductLogListParams = {
  readonly page?: number;
  readonly pageSize?: number;
};

export type CreateProductInput = {
  readonly name: string;
  readonly category?: string;
  readonly unitPrice?: number;
  readonly currency?: string;
  readonly description?: string;
  readonly initialMemo?: string;
};

export type UpdateProductInput = {
  readonly productId: string;
  readonly name?: string;
  readonly category?: string | null;
  readonly unitPrice?: number | null;
  readonly currency?: string;
  readonly description?: string | null;
};

export type CreateProductConnectionInput = {
  readonly productId: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly connectionType: ProductConnectionType;
  readonly note?: string;
};

export type CreateProductLogInput = {
  readonly productId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content?: string;
};

export type UpdateProductLogInput = {
  readonly productId: string;
  readonly logId: string;
  readonly loggedAt?: string;
  readonly title?: string;
  readonly content?: string;
};
