import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, HandCoins, IdCard, Package, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useCreateCompanyMutation } from "@/features/company/hooks/use-company-mutations";
import { useCreateContactMutation } from "@/features/contact/hooks/use-contact-mutations";
import { DealEntitySearchField } from "@/features/deal/components/deal-entity-search-field";
import {
  type DealEntityOption,
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import { useCreateDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  dealFormSchema,
  emptyDealFormValues,
  toCreateDealInput,
  type DealFormValues,
} from "@/features/deal/schemas/deal-schema";
import type { Deal } from "@/features/deal/types/deal";
import { useCreateProductMutation } from "@/features/product/hooks/use-product-mutations";
import { getApiErrorMessage } from "@/lib/api-client";

type DealCreateDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (deal: Deal) => void;
};

export function DealCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: DealCreateDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<DealEntityOption[]>(
    []
  );
  const [inlineProductUnitPrice, setInlineProductUnitPrice] = useState("");
  const [inlineProductUnitPriceError, setInlineProductUnitPriceError] =
    useState<string | null>(null);
  const createDealMutation = useCreateDealMutation();
  const createCompanyMutation = useCreateCompanyMutation();
  const createContactMutation = useCreateContactMutation();
  const createProductMutation = useCreateProductMutation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: emptyDealFormValues,
  });
  const companyId = useWatch({ control, name: "companyId" }) ?? "";
  const companySearch = useWatch({ control, name: "companySearch" }) ?? "";
  const contactId = useWatch({ control, name: "contactId" }) ?? "";
  const contactSearch = useWatch({ control, name: "contactSearch" }) ?? "";
  const productSearch = useWatch({ control, name: "productSearch" }) ?? "";
  const companyOptionsQuery = useDealCompanyOptions(companySearch);
  const contactOptionsQuery = useDealContactOptions(contactSearch, companyId);
  const productOptionsQuery = useDealProductOptions(productSearch);
  const companyName = companySearch.trim();
  const contactName = contactSearch.trim();
  const productName = productSearch.trim();
  const canCreateCompanyInline = canShowInlineCreate({
    search: companySearch,
    selectedId: companyId,
    isFetching: companyOptionsQuery.isFetching,
    isError: companyOptionsQuery.isError,
  });
  const canCreateContactInline = canShowInlineCreate({
    search: contactSearch,
    selectedId: contactId,
    isFetching: contactOptionsQuery.isFetching,
    isError: contactOptionsQuery.isError,
  });
  const canCreateProductInline = canShowInlineCreate({
    search: productSearch,
    selectedId: "",
    isFetching: productOptionsQuery.isFetching,
    isError: productOptionsQuery.isError,
  });
  const isCreatingInlineEntity =
    createCompanyMutation.isPending ||
    createContactMutation.isPending ||
    createProductMutation.isPending;

  useEffect(() => {
    if (open) {
      reset(emptyDealFormValues);
      setSelectedProducts([]);
      setInlineProductUnitPrice("");
      setInlineProductUnitPriceError(null);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const clearContact = () => {
    setValue("contactId", "", { shouldValidate: true });
    setValue("contactSearch", "", { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const deal = await createDealMutation.mutateAsync(toCreateDealInput(values));

    onCreated(deal);
    onOpenChange(false);
  });

  const onProductSelect = (option: DealEntityOption) => {
    const nextProducts = selectedProducts.some((product) => product.id === option.id)
      ? selectedProducts
      : [...selectedProducts, option];

    setSelectedProducts(nextProducts);
    setValue(
      "productIds",
      nextProducts.map((product) => product.id),
      { shouldValidate: true }
    );
    setValue("productSearch", "", { shouldValidate: true });
  };

  const onProductRemove = (productId: string) => {
    const nextProducts = selectedProducts.filter(
      (product) => product.id !== productId
    );

    setSelectedProducts(nextProducts);
    setValue(
      "productIds",
      nextProducts.map((product) => product.id),
      { shouldValidate: true }
    );
  };

  const onInlineCompanyCreate = async () => {
    if (!companyName) {
      return;
    }

    const company = await createCompanyMutation.mutateAsync({
      name: companyName,
    });

    setValue("companyId", company.id, { shouldValidate: true });
    setValue("companySearch", company.name, { shouldValidate: true });
    clearContact();
  };

  const onInlineContactCreate = async () => {
    if (!contactName) {
      return;
    }

    const contact = await createContactMutation.mutateAsync(
      companyId ? { name: contactName, companyId } : { name: contactName }
    );

    setValue("contactId", contact.id, { shouldValidate: true });
    setValue("contactSearch", contact.name, { shouldValidate: true });
  };

  const onInlineProductCreate = async () => {
    if (!productName) {
      return;
    }

    const unitPrice = parseOptionalUnitPrice(inlineProductUnitPrice);

    if (unitPrice === null) {
      setInlineProductUnitPriceError("단가는 0 이상의 정수입니다.");
      return;
    }

    setInlineProductUnitPriceError(null);

    const product = await createProductMutation.mutateAsync(
      unitPrice === undefined
        ? { name: productName, currency: "KRW" }
        : { name: productName, unitPrice, currency: "KRW" }
    );

    onProductSelect({
      id: product.id,
      name: product.name,
      subtitle: [product.category, formatInlineProductPrice(product.unitPrice)]
        .filter(Boolean)
        .join(" · "),
    });
    setInlineProductUnitPrice("");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6">
      <section
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-white shadow-xl"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">딜 빠른 등록</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              딜명, 금액, 연결 대상과 다음 행동을 저장합니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="overflow-y-auto px-5 py-5" onSubmit={onSubmit}>
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_120px]">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-title">
                  딜명
                </label>
                <input
                  aria-describedby={errors.title ? "deal-title-error" : undefined}
                  aria-invalid={Boolean(errors.title)}
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-title"
                  {...register("title")}
                />
                {errors.title ? (
                  <p className="text-xs text-destructive" id="deal-title-error">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-amount">
                  금액
                </label>
                <div className="relative">
                  <HandCoins className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    aria-describedby={
                      errors.amount ? "deal-amount-error" : undefined
                    }
                    aria-invalid={Boolean(errors.amount)}
                    className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-amount"
                    inputMode="numeric"
                    {...register("amount")}
                  />
                </div>
                {errors.amount ? (
                  <p className="text-xs text-destructive" id="deal-amount-error">
                    {errors.amount.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-currency">
                  통화
                </label>
                <input
                  aria-describedby={
                    errors.currency ? "deal-currency-error" : undefined
                  }
                  aria-invalid={Boolean(errors.currency)}
                  className="h-10 rounded-md border px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                  id="deal-currency"
                  maxLength={3}
                  {...register("currency")}
                />
                {errors.currency ? (
                  <p className="text-xs text-destructive" id="deal-currency-error">
                    {errors.currency.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-2">
                <DealEntitySearchField
                  emptyText="선택할 회사가 없습니다."
                  errorMessage={errors.companySearch?.message}
                  icon={Building2}
                  id="deal-company"
                  isLoading={companyOptionsQuery.isLoading}
                  label="회사"
                  onClear={() => {
                    createCompanyMutation.reset();
                    setValue("companyId", "", { shouldValidate: true });
                    setValue("companySearch", "", { shouldValidate: true });
                    clearContact();
                  }}
                  onSearchChange={(value) => {
                    createCompanyMutation.reset();
                    setValue("companySearch", value, { shouldValidate: true });
                    setValue("companyId", "", { shouldValidate: true });
                    clearContact();
                  }}
                  onSelect={(option) => {
                    createCompanyMutation.reset();
                    setValue("companyId", option.id, { shouldValidate: true });
                    setValue("companySearch", option.name, {
                      shouldValidate: true,
                    });
                    clearContact();
                  }}
                  options={companyOptionsQuery.data ?? []}
                  placeholder="회사 검색"
                  search={companySearch}
                  selectedId={companyId}
                />

                {canCreateCompanyInline ? (
                  <InlineCreatePanel
                    actionLabel="새 회사 만들기"
                    disabled={!companyName}
                    errorMessage={
                      createCompanyMutation.error
                        ? getApiErrorMessage(createCompanyMutation.error)
                        : null
                    }
                    isPending={createCompanyMutation.isPending}
                    name={companyName}
                    onCreate={onInlineCompanyCreate}
                    title="새 회사"
                  />
                ) : null}
              </div>

              <div className="grid content-start gap-2">
                <DealEntitySearchField
                  emptyText="선택할 거래처가 없습니다."
                  errorMessage={errors.contactSearch?.message}
                  icon={IdCard}
                  id="deal-contact"
                  isLoading={contactOptionsQuery.isLoading}
                  label="거래처"
                  onClear={() => {
                    createContactMutation.reset();
                    clearContact();
                  }}
                  onSearchChange={(value) => {
                    createContactMutation.reset();
                    setValue("contactSearch", value, { shouldValidate: true });
                    setValue("contactId", "", { shouldValidate: true });
                  }}
                  onSelect={(option) => {
                    createContactMutation.reset();
                    setValue("contactId", option.id, { shouldValidate: true });
                    setValue("contactSearch", option.name, {
                      shouldValidate: true,
                    });
                  }}
                  options={contactOptionsQuery.data ?? []}
                  placeholder="거래처 검색"
                  search={contactSearch}
                  selectedId={contactId}
                />

                {canCreateContactInline ? (
                  <InlineCreatePanel
                    actionLabel="새 거래처 만들기"
                    disabled={!contactName}
                    errorMessage={
                      createContactMutation.error
                        ? getApiErrorMessage(createContactMutation.error)
                        : null
                    }
                    isPending={createContactMutation.isPending}
                    meta={companyId ? `회사: ${companySearch}` : undefined}
                    name={contactName}
                    onCreate={onInlineContactCreate}
                    title="새 거래처"
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <DealEntitySearchField
                emptyText="선택할 제품이 없습니다."
                errorMessage={errors.productSearch?.message}
                icon={Package}
                id="deal-product"
                isLoading={productOptionsQuery.isLoading}
                label="제품"
                onClear={() => {
                  createProductMutation.reset();
                  setInlineProductUnitPrice("");
                  setInlineProductUnitPriceError(null);
                  setValue("productSearch", "", { shouldValidate: true });
                }}
                onSearchChange={(value) => {
                  createProductMutation.reset();
                  setInlineProductUnitPriceError(null);
                  setValue("productSearch", value, { shouldValidate: true });
                }}
                onSelect={(option) => {
                  createProductMutation.reset();
                  onProductSelect(option);
                }}
                options={productOptionsQuery.data ?? []}
                placeholder="제품 검색 후 추가"
                search={productSearch}
                selectedId=""
              />

              {canCreateProductInline ? (
                <InlineCreatePanel
                  actionLabel="새 제품 만들기"
                  disabled={!productName || Boolean(inlineProductUnitPriceError)}
                  errorMessage={
                    createProductMutation.error
                      ? getApiErrorMessage(createProductMutation.error)
                      : null
                  }
                  isPending={createProductMutation.isPending}
                  name={productName}
                  onCreate={onInlineProductCreate}
                  title="새 제품"
                >
                  <div className="grid gap-1 sm:w-40">
                    <label
                      className="text-xs font-medium text-muted-foreground"
                      htmlFor="deal-inline-product-unit-price"
                    >
                      단가
                    </label>
                    <input
                      aria-describedby={
                        inlineProductUnitPriceError
                          ? "deal-inline-product-unit-price-error"
                          : undefined
                      }
                      aria-invalid={Boolean(inlineProductUnitPriceError)}
                      className="h-9 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      id="deal-inline-product-unit-price"
                      inputMode="numeric"
                      onChange={(event) => {
                        setInlineProductUnitPrice(event.target.value);
                        setInlineProductUnitPriceError(null);
                      }}
                      value={inlineProductUnitPrice}
                    />
                    {inlineProductUnitPriceError ? (
                      <p
                        className="text-xs text-destructive"
                        id="deal-inline-product-unit-price-error"
                      >
                        {inlineProductUnitPriceError}
                      </p>
                    ) : null}
                  </div>
                </InlineCreatePanel>
              ) : null}

              {selectedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((product) => (
                    <span
                      className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted px-2 text-sm"
                      key={product.id}
                    >
                      <span className="max-w-52 truncate">{product.name}</span>
                      <button
                        aria-label={`${product.name} 제품 제거`}
                        className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-white"
                        onClick={() => onProductRemove(product.id)}
                        type="button"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-stage">
                  단계
                </label>
                <select
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-stage"
                  {...register("stage")}
                >
                  <option value="INITIAL_CONTACT">초기 접촉</option>
                  <option value="IN_DISCUSSION">논의 중</option>
                  <option value="WON">수주</option>
                  <option value="LOST">실주</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="deal-likelihood"
                >
                  가능성
                </label>
                <select
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-likelihood"
                  {...register("likelihoodStatus")}
                >
                  <option value="POSITIVE">긍정</option>
                  <option value="NEUTRAL">중립</option>
                  <option value="NEGATIVE">부정</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-next">
                  다음 행동
                </label>
                <input
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-next"
                  {...register("nextActionText")}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-next-due">
                  다음 행동 일시
                </label>
                <input
                  className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-next-due"
                  type="datetime-local"
                  {...register("nextActionDueAt")}
                />
              </div>
            </div>

            <details className="rounded-md border px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium">
                고급 옵션
              </summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="deal-close-date"
                  >
                    예상 종료일
                  </label>
                  <input
                    className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-close-date"
                    type="date"
                    {...register("expectedCloseDate")}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="deal-likelihood-percent"
                  >
                    가능성 %
                  </label>
                  <input
                    aria-describedby={
                      errors.likelihoodPercent
                        ? "deal-likelihood-percent-error"
                        : undefined
                    }
                    aria-invalid={Boolean(errors.likelihoodPercent)}
                    className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="deal-likelihood-percent"
                    inputMode="numeric"
                    {...register("likelihoodPercent")}
                  />
                  {errors.likelihoodPercent ? (
                    <p
                      className="text-xs text-destructive"
                      id="deal-likelihood-percent-error"
                    >
                      {errors.likelihoodPercent.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <label className="text-sm font-medium" htmlFor="deal-memo">
                  첫 메모
                </label>
                <textarea
                  className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="deal-memo"
                  {...register("initialMemo")}
                />
              </div>
            </details>

            {createDealMutation.error ? (
              <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
                {getApiErrorMessage(createDealMutation.error)}
              </p>
            ) : null}
          </div>

          <footer className="mt-5 flex justify-end gap-2 border-t pt-4">
            <button
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              취소
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createDealMutation.isPending || isCreatingInlineEntity}
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

type InlineCreatePanelProps = {
  readonly title: string;
  readonly name: string;
  readonly actionLabel: string;
  readonly isPending: boolean;
  readonly onCreate: () => Promise<void>;
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly errorMessage?: string | null;
  readonly meta?: string;
};

function InlineCreatePanel({
  title,
  name,
  actionLabel,
  isPending,
  onCreate,
  children,
  disabled = false,
  errorMessage,
  meta,
}: InlineCreatePanelProps) {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 px-3 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{name}</p>
          {meta ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>

        {children}

        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isPending}
          onClick={() => {
            void onCreate();
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          <span className="whitespace-nowrap">{actionLabel}</span>
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-2 text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function canShowInlineCreate({
  search,
  selectedId,
  isFetching,
  isError,
}: {
  readonly search: string;
  readonly selectedId: string;
  readonly isFetching: boolean;
  readonly isError: boolean;
}) {
  return search.trim().length > 0 && !selectedId && !isFetching && !isError;
}

function parseOptionalUnitPrice(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
}

function formatInlineProductPrice(unitPrice: number | null) {
  return unitPrice === null ? "" : unitPrice.toLocaleString("ko-KR");
}
