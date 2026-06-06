import type {
  CreateProductConnectionInput,
  CreateProductInput,
  CreateProductLogInput,
  DeleteProductResponse,
  Product,
  ProductConnection,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  ProductLog,
  ProductLogListParams,
  ProductLogListResponse,
  UpdateProductInput,
  UpdateProductLogInput,
} from "@/features/product/types/product";
import { apiClient } from "@/lib/api-client";

export function listProducts(params: ProductListParams) {
  const query = toProductListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<ProductListResponse>(`/api/products${suffix}`);
}

export function createProduct(input: CreateProductInput) {
  return apiClient<Product>("/api/products", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getProduct(productId: string) {
  return apiClient<ProductDetail>(`/api/products/${productId}`);
}

export function updateProduct(input: UpdateProductInput) {
  return apiClient<Product>(`/api/products/${input.productId}`, {
    method: "PATCH",
    body: compactBody({
      name: input.name,
      category: input.category,
      unitPrice: input.unitPrice,
      currency: input.currency,
      description: input.description,
    }),
  });
}

export function deleteProduct(productId: string) {
  return apiClient<DeleteProductResponse>(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

export function restoreProduct(productId: string) {
  return apiClient<Product>(`/api/products/${productId}/restore`, {
    method: "POST",
  });
}

export function createProductConnection(input: CreateProductConnectionInput) {
  return apiClient<ProductConnection>(
    `/api/products/${input.productId}/connections`,
    {
      method: "POST",
      body: compactBody({
        targetType: input.targetType,
        targetId: input.targetId,
        connectionType: input.connectionType,
        note: input.note,
      }),
    }
  );
}

export function deleteProductConnection(
  productId: string,
  connectionId: string
) {
  return apiClient<DeleteProductResponse>(
    `/api/products/${productId}/connections/${connectionId}`,
    {
      method: "DELETE",
    }
  );
}

export function listProductLogs(
  productId: string,
  params: ProductLogListParams
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return apiClient<ProductLogListResponse>(
    `/api/products/${productId}/logs?${query.toString()}`
  );
}

export function createProductLog(input: CreateProductLogInput) {
  return apiClient<ProductLog>(`/api/products/${input.productId}/logs`, {
    method: "POST",
    body: compactBody({
      loggedAt: input.loggedAt,
      title: input.title,
      content: input.content,
    }),
  });
}

export function updateProductLog(input: UpdateProductLogInput) {
  return apiClient<ProductLog>(
    `/api/products/${input.productId}/logs/${input.logId}`,
    {
      method: "PATCH",
      body: compactBody({
        loggedAt: input.loggedAt,
        title: input.title,
        content: input.content,
      }),
    }
  );
}

export function deleteProductLog(productId: string, logId: string) {
  return apiClient<DeleteProductResponse>(
    `/api/products/${productId}/logs/${logId}`,
    {
      method: "DELETE",
    }
  );
}

function toProductListSearchParams(params: ProductListParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 20));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
