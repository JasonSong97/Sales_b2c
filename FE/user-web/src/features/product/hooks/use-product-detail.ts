import { useQuery } from "@tanstack/react-query";
import {
  getProduct,
  listProductLogs,
} from "@/features/product/api/product-api";
import { productQueryKeys } from "@/features/product/api/product-query-keys";
import type { ProductLogListParams } from "@/features/product/types/product";

export function useProductDetail(productId: string) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => getProduct(productId),
  });
}

export function useProductLogs(
  productId: string,
  params: ProductLogListParams = {}
) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: productQueryKeys.logs(productId, params),
    queryFn: () => listProductLogs(productId, params),
  });
}
