import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  createProductConnection,
  createProductLog,
  deleteProduct,
  deleteProductConnection,
  deleteProductLog,
  restoreProduct,
  updateProduct,
  updateProductLog,
} from "@/features/product/api/product-api";
import { productQueryKeys } from "@/features/product/api/product-query-keys";
import type {
  CreateProductConnectionInput,
  CreateProductInput,
  CreateProductLogInput,
  UpdateProductInput,
  UpdateProductLogInput,
} from "@/features/product/types/product";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(product.id),
      });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(product.id),
      });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(result.id),
      });
    },
  });
}

export function useRestoreProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => restoreProduct(productId),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(product.id),
      });
    },
  });
}

export function useCreateProductConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductConnectionInput) =>
      createProductConnection(input),
    onSuccess: (connection) => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(connection.productId),
      });
    },
  });
}

export function useDeleteProductConnectionMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) =>
      deleteProductConnection(productId, connectionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(productId),
      });
    },
  });
}

export function useCreateProductLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductLogInput) => createProductLog(input),
    onSuccess: (log) => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.logs(log.productId, {}),
      });
    },
  });
}

export function useUpdateProductLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductLogInput) => updateProductLog(input),
    onSuccess: (log) => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.logs(log.productId, {}),
      });
    },
  });
}

export function useDeleteProductLogMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteProductLog(productId, logId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.logs(productId, {}),
      });
    },
  });
}
