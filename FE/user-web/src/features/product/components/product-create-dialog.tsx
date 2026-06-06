import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateProductMutation } from "@/features/product/hooks/use-product-mutations";
import {
  emptyProductFormValues,
  productFormSchema,
  toCreateProductInput,
  type ProductFormValues,
} from "@/features/product/schemas/product-schema";
import type { Product } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

type ProductCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (product: Product) => void;
};

export function ProductCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: ProductCreateDialogProps) {
  const createProductMutation = useCreateProductMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProductFormValues,
  });

  useEffect(() => {
    if (open) {
      reset(emptyProductFormValues);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    const product = await createProductMutation.mutateAsync(
      toCreateProductInput(values)
    );

    onCreated(product);
    onOpenChange(false);
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6">
      <section
        aria-modal="true"
        className="w-full max-w-2xl overflow-hidden rounded-lg border bg-white shadow-xl"
        role="dialog"
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">제품 빠른 등록</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              제품명, 분류, 단가와 첫 메모를 저장합니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="grid gap-4 px-5 py-5" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="product-name">
              제품명
            </label>
            <input
              aria-describedby={errors.name ? "product-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-name"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive" id="product-name-error">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="product-category">
                분류
              </label>
              <input
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="product-category"
                {...register("category")}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="product-price">
                단가
              </label>
              <input
                aria-describedby={
                  errors.unitPrice ? "product-price-error" : undefined
                }
                aria-invalid={Boolean(errors.unitPrice)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="product-price"
                inputMode="numeric"
                {...register("unitPrice")}
              />
              {errors.unitPrice ? (
                <p className="text-xs text-destructive" id="product-price-error">
                  {errors.unitPrice.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="product-currency">
                통화
              </label>
              <input
                className="h-10 rounded-md border px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                id="product-currency"
                maxLength={3}
                {...register("currency")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="product-description">
              설명
            </label>
            <textarea
              className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-description"
              {...register("description")}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="product-memo">
              첫 메모
            </label>
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-memo"
              {...register("initialMemo")}
            />
          </div>

          {createProductMutation.error ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(createProductMutation.error)}
            </p>
          ) : null}

          <footer className="flex justify-end gap-2 border-t pt-4">
            <button
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              취소
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createProductMutation.isPending}
              type="submit"
            >
              <Plus className="h-4 w-4" />
              저장
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
