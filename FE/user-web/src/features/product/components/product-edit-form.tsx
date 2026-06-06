import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateProductMutation } from "@/features/product/hooks/use-product-mutations";
import {
  productFormSchema,
  toProductFormValues,
  toUpdateProductInput,
  type ProductFormValues,
} from "@/features/product/schemas/product-schema";
import type { Product } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

type ProductEditFormProps = {
  readonly product: Product;
  readonly onSaved: (product: Product) => void;
};

export function ProductEditForm({ product, onSaved }: ProductEditFormProps) {
  const updateProductMutation = useUpdateProductMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toProductFormValues(product),
  });

  useEffect(() => {
    reset(toProductFormValues(product));
  }, [product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const updatedProduct = await updateProductMutation.mutateAsync(
      toUpdateProductInput(product.id, values)
    );

    onSaved(updatedProduct);
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="product-detail-name">
          제품명
        </label>
        <input
          aria-describedby={
            errors.name ? "product-detail-name-error" : undefined
          }
          aria-invalid={Boolean(errors.name)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="product-detail-name"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-xs text-destructive" id="product-detail-name-error">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="product-detail-category">
            분류
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="product-detail-category"
            {...register("category")}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="product-detail-price">
            단가
          </label>
          <input
            aria-describedby={
              errors.unitPrice ? "product-detail-price-error" : undefined
            }
            aria-invalid={Boolean(errors.unitPrice)}
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="product-detail-price"
            inputMode="numeric"
            {...register("unitPrice")}
          />
          {errors.unitPrice ? (
            <p className="text-xs text-destructive" id="product-detail-price-error">
              {errors.unitPrice.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="product-detail-currency">
            통화
          </label>
          <input
            className="h-10 rounded-md border px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
            id="product-detail-currency"
            maxLength={3}
            {...register("currency")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="product-detail-description">
          설명
        </label>
        <textarea
          className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="product-detail-description"
          {...register("description")}
        />
      </div>

      {updateProductMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateProductMutation.error)}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={updateProductMutation.isPending}
          type="submit"
        >
          <Save className="h-4 w-4" />
          저장
        </button>
      </div>
    </form>
  );
}
