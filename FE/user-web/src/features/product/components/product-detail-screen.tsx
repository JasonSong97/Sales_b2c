import {
  ArchiveRestore,
  ArrowLeft,
  CircleDollarSign,
  Link2,
  MessageSquareText,
  Package,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ProductConnectionSection } from "@/features/product/components/product-connection-section";
import { ProductEditForm } from "@/features/product/components/product-edit-form";
import { ProductLogSection } from "@/features/product/components/product-log-section";
import {
  useProductDetail,
  useProductLogs,
} from "@/features/product/hooks/use-product-detail";
import {
  useDeleteProductMutation,
  useRestoreProductMutation,
} from "@/features/product/hooks/use-product-mutations";
import type { Product, ProductMemo } from "@/features/product/types/product";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";

type ProductDetailScreenProps = {
  readonly productId: string;
};

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const productQuery = useProductDetail(productId);
  const logsQuery = useProductLogs(productId, { page: 1, pageSize: 20 });
  const deleteProductMutation = useDeleteProductMutation();
  const restoreProductMutation = useRestoreProductMutation();
  const actionError =
    deleteProductMutation.error ?? restoreProductMutation.error ?? null;

  const onDelete = async (product: Product) => {
    if (!window.confirm(`${product.name} 제품을 휴지통으로 이동할까요?`)) {
      return;
    }

    await deleteProductMutation.mutateAsync(product.id);
    setNotice("제품이 휴지통으로 이동되었습니다.");
  };

  const onRestore = async () => {
    const product = await restoreProductMutation.mutateAsync(productId);
    setNotice(`${product.name} 제품이 복구되었습니다.`);
  };

  if (productQuery.isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError) {
    if (isDeletedResourceReadError(productQuery.error)) {
      return (
        <DeletedProductState
          error={productQuery.error}
          isRestoring={restoreProductMutation.isPending}
          onRestore={onRestore}
        />
      );
    }

    return (
      <ProductDetailError
        error={productQuery.error}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const productDetail = productQuery.data;

  if (!productDetail) {
    return <ProductDetailSkeleton />;
  }

  const { product, connections, memos } = productDetail;
  const logs = logsQuery.data?.items ?? [];

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            to="/products"
          >
            <ArrowLeft className="h-4 w-4" />
            제품 목록
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatProductSubtitle(product)}
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-destructive/30 px-4 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={deleteProductMutation.isPending}
          onClick={() => void onDelete(product)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          휴지통 이동
        </button>
      </header>

      {notice ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(actionError)}
        </p>
      ) : null}

      <ProductSummary product={product} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <section className="grid gap-4">
            <div>
              <h2 className="text-lg font-semibold">기본 정보</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                제품명, 분류, 단가, 설명을 정리합니다.
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <ProductEditForm
                onSaved={(updatedProduct) =>
                  setNotice(`${updatedProduct.name} 제품이 저장되었습니다.`)
                }
                product={product}
              />
            </div>
          </section>

          <ProductLogSection
            error={logsQuery.error}
            isLoading={logsQuery.isLoading}
            logs={logs}
            onChanged={setNotice}
            onRetry={() => void logsQuery.refetch()}
            productId={product.id}
          />
        </div>

        <aside className="grid content-start gap-6">
          <ProductConnectionSection
            connections={connections}
            onChanged={setNotice}
            productId={product.id}
          />
          <ProductMemoPanel memos={memos} />
        </aside>
      </div>
    </section>
  );
}

function ProductSummary({ product }: { readonly product: Product }) {
  const items = [
    {
      label: "단가",
      value: formatMoney(product),
      icon: CircleDollarSign,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    },
    {
      label: "분류",
      value: product.category ?? "-",
      icon: Tag,
      className: "border-sky-200 bg-sky-50 text-sky-900",
    },
    {
      label: "연결",
      value: String(product.connectionCount),
      icon: Link2,
      className: "border-violet-200 bg-violet-50 text-violet-900",
    },
    {
      label: "Memo",
      value: String(product.memoCount),
      icon: MessageSquareText,
      className: "border-amber-200 bg-amber-50 text-amber-900",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${item.className}`}
            key={item.label}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 truncate text-xl font-semibold">{item.value}</p>
            </div>
            <Icon className="h-5 w-5" />
          </div>
        );
      })}
    </section>
  );
}

function ProductMemoPanel({ memos }: { readonly memos: ProductMemo[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">Memo 기록</h2>
      <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        메모는 민감정보 후보입니다.
      </p>
      <div className="overflow-hidden rounded-lg border bg-white">
        {memos.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">
            등록된 메모가 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {memos.map((memo) => (
              <article className="grid gap-2 px-4 py-4" key={memo.id}>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(memo.memoDate)}
                </p>
                {memo.title ? (
                  <h3 className="text-sm font-semibold">{memo.title}</h3>
                ) : null}
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {memo.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DeletedProductState({
  error,
  isRestoring,
  onRestore,
}: {
  readonly error: unknown;
  readonly isRestoring: boolean;
  readonly onRestore: () => Promise<void>;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">삭제된 제품입니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <Link
          className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          to="/products"
        >
          제품 목록
        </Link>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRestoring}
          onClick={() => void onRestore()}
          type="button"
        >
          <ArchiveRestore className="h-4 w-4" />
          복구
        </button>
      </div>
    </section>
  );
}

function ProductDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">제품 상세를 불러오지 못했습니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <button
        className="mx-auto inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        재시도
      </button>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <div className="grid gap-2 border-b pb-5">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="h-24 animate-pulse rounded-lg bg-muted" key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}

function isDeletedResourceReadError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.statusCode === 410 &&
    error.isDeletedResource
  );
}

function formatProductSubtitle(product: Product) {
  return [product.category, formatMoney(product)].filter(Boolean).join(" · ");
}

function formatMoney(product: Product) {
  if (product.unitPrice === null) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: product.currency || "KRW",
    maximumFractionDigits: 0,
  }).format(product.unitPrice);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
