import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/features/product/api/product-api";
import { productQueryKeys } from "@/features/product/api/product-query-keys";
import type { ProductListParams } from "@/features/product/types/product";

export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => listProducts(params),
  });
}
