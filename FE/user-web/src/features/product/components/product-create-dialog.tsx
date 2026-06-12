import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
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
  const formId = "product-create-form";

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
    <ModalShell
      description="제품명, 분류, 단가와 첫 메모를 저장합니다."
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={createProductMutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      size="md"
      title="제품 빠른 등록"
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={onSubmit}>
        <ModalFormSection
          description="제품명과 가격 정보를 빠르게 저장합니다."
          title="제품 기본 정보"
        >
          <ModalFieldGroup
            error={errors.name?.message}
            id="product-name"
            label="제품명"
          >
            <input
              aria-describedby={errors.name ? "product-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-name"
              {...register("name")}
            />
          </ModalFieldGroup>

          <ModalFormRow columns={3}>
            <ModalFieldGroup id="product-category" label="분류">
              <input
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="product-category"
                {...register("category")}
              />
            </ModalFieldGroup>
            <ModalFieldGroup
              error={errors.unitPrice?.message}
              id="product-price"
              label="단가"
            >
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
            </ModalFieldGroup>
            <ModalFieldGroup id="product-currency" label="통화">
              <input
                className="h-10 rounded-md border px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                id="product-currency"
                maxLength={3}
                {...register("currency")}
              />
            </ModalFieldGroup>
          </ModalFormRow>
        </ModalFormSection>

        <ModalFormSection title="설명">
          <ModalFieldGroup id="product-description" label="설명">
            <textarea
              className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-description"
              {...register("description")}
            />
          </ModalFieldGroup>
        </ModalFormSection>

        <ModalFormSection title="첫 메모">
          <ModalFieldGroup id="product-memo" label="첫 메모">
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-memo"
              {...register("initialMemo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>

          {createProductMutation.error ? (
            <ErrorState
              message={getApiErrorMessage(createProductMutation.error)}
              title="제품 저장 실패"
              variant="inline"
            />
          ) : null}
      </ModalForm>
    </ModalShell>
  );
}
