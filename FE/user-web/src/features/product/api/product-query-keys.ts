import type {
  ProductListParams,
  ProductLogListParams,
} from "@/features/product/types/product";

export const productQueryKeys = {
  all: ["product"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (params: ProductListParams) =>
    [
      ...productQueryKeys.lists(),
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search ?? "",
        category: params.category ?? "",
        includeDeleted: params.includeDeleted ?? false,
      },
    ] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (productId: string) =>
    [...productQueryKeys.details(), productId] as const,
  logs: (productId: string, params: ProductLogListParams) =>
    [
      ...productQueryKeys.detail(productId),
      "logs",
      {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    ] as const,
};
