import { ArchiveRestore, Package, Plus, Search, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import { useProductList } from "@/features/product/hooks/use-product-list";
import {
  useDeleteProductMutation,
  useRestoreProductMutation,
} from "@/features/product/hooks/use-product-mutations";
import type { Product } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/utils/format";

export function ProductListScreen() {
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [categoryText, setCategoryText] = useState("");
  const [category, setCategory] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const productsQuery = useProductList({
    page: 1,
    pageSize: 20,
    search: search || undefined,
    category: category || undefined,
    includeDeleted,
  });
  const deleteProductMutation = useDeleteProductMutation();
  const restoreProductMutation = useRestoreProductMutation();
  const actionError =
    deleteProductMutation.error ?? restoreProductMutation.error ?? null;
  const productList = productsQuery.data;

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
    setCategory(categoryText.trim());
  };

  const onDelete = async (product: Product) => {
    if (!window.confirm(`${product.name} 제품을 휴지통으로 이동할까요?`)) {
      return;
    }

    await deleteProductMutation.mutateAsync(product.id);
    setNotice("제품이 휴지통으로 이동되었습니다.");
  };

  const onRestore = async (product: Product) => {
    await restoreProductMutation.mutateAsync(product.id);
    setNotice("제품이 복구되었습니다.");
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">제품</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            제품 기본 정보, 단가, 연결 대상을 관리합니다.
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          제품 추가
        </button>
      </header>

      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(180px,280px)_auto]"
        onSubmit={onSearchSubmit}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="제품명, 분류, 설명 검색"
            value={searchText}
          />
        </div>
        <input
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => setCategoryText(event.target.value)}
          placeholder="분류 필터"
          value={categoryText}
        />
        <div className="flex flex-wrap items-end gap-2">
          <label className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium">
            <input
              checked={includeDeleted}
              className="h-4 w-4 rounded border"
              onChange={(event) => setIncludeDeleted(event.target.checked)}
              type="checkbox"
            />
            삭제 포함
          </label>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            <Search className="h-4 w-4" />
            검색
          </button>
        </div>
      </form>

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

      {productsQuery.isLoading ? (
        <ProductListSkeleton />
      ) : productsQuery.isError ? (
        <ProductListError
          error={productsQuery.error}
          onRetry={() => void productsQuery.refetch()}
        />
      ) : !productList || productList.items.length === 0 ? (
        <ProductEmptyState
          hasSearch={search.length > 0 || category.length > 0}
          onCreate={() => setIsCreateOpen(true)}
        />
      ) : (
        <ProductListContent
          isMutating={
            deleteProductMutation.isPending || restoreProductMutation.isPending
          }
          onDelete={onDelete}
          onRestore={onRestore}
          products={productList.items}
        />
      )}

      <ProductCreateDialog
        onCreated={(product) => setNotice(`${product.name} 제품이 추가되었습니다.`)}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

type ProductListContentProps = {
  readonly products: Product[];
  readonly isMutating: boolean;
  readonly onDelete: (product: Product) => Promise<void>;
  readonly onRestore: (product: Product) => Promise<void>;
};

function ProductListContent({
  products,
  isMutating,
  onDelete,
  onRestore,
}: ProductListContentProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
        <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.7fr_0.7fr_0.8fr_0.9fr_1fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>제품명</span>
          <span>분류</span>
          <span>단가</span>
          <span>연결</span>
          <span>Memo</span>
          <span>상태</span>
          <span>최근 수정일</span>
          <span className="text-right">작업</span>
        </div>
        {products.map((product) => (
          <div
            className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.7fr_0.7fr_0.8fr_0.9fr_1fr] items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-muted/50"
            key={product.id}
          >
            <Link
              className="min-w-0 font-medium text-slate-950 hover:text-primary"
              to={`/products/${product.id}`}
            >
              <span className="block truncate">{product.name}</span>
            </Link>
            <span className="truncate text-slate-700">
              {product.category ?? "-"}
            </span>
            <span className="truncate text-slate-700">
              {product.unitPrice === null
                ? "-"
                : formatMoney(product.unitPrice, product.currency || "KRW")}
            </span>
            <span className="text-slate-700">{product.connectionCount}</span>
            <span className="text-slate-700">{product.memoCount}</span>
            <ProductStatusBadge product={product} />
            <span className="text-slate-700">
              {formatDate(product.updatedAt, { year: "numeric" })}
            </span>
            <ProductRowActions
              isMutating={isMutating}
              onDelete={onDelete}
              onRestore={onRestore}
              product={product}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {products.map((product) => (
          <article className="rounded-lg border bg-white p-4" key={product.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  className="block truncate text-base font-semibold hover:text-primary"
                  to={`/products/${product.id}`}
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[
                    product.category,
                    product.unitPrice === null
                      ? "-"
                      : formatMoney(product.unitPrice, product.currency || "KRW"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <ProductStatusBadge product={product} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <Field label="연결" value={String(product.connectionCount)} />
              <Field label="Memo" value={String(product.memoCount)} />
              <Field
                label="수정일"
                value={formatDate(product.updatedAt, { year: "numeric" })}
              />
            </dl>
            <div className="mt-4 flex justify-end">
              <ProductRowActions
                isMutating={isMutating}
                onDelete={onDelete}
                onRestore={onRestore}
                product={product}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

type ProductRowActionsProps = {
  readonly product: Product;
  readonly isMutating: boolean;
  readonly onDelete: (product: Product) => Promise<void>;
  readonly onRestore: (product: Product) => Promise<void>;
};

function ProductRowActions({
  product,
  isMutating,
  onDelete,
  onRestore,
}: ProductRowActionsProps) {
  const isDeleted = product.deletedAt !== null;

  return (
    <div className="flex justify-end gap-2">
      {isDeleted ? (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
          onClick={() => void onRestore(product)}
          type="button"
        >
          <ArchiveRestore className="h-4 w-4" />
          복구
        </button>
      ) : (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating}
          onClick={() => void onDelete(product)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      )}
    </div>
  );
}

function ProductStatusBadge({ product }: { readonly product: Product }) {
  if (product.deletedAt) {
    return (
      <span className="inline-flex h-7 w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-800">
        삭제됨
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-800">
      활성
    </span>
  );
}

function ProductEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <section className="grid place-items-center rounded-lg border bg-white px-5 py-14 text-center">
      <Package className="h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">
        {hasSearch ? "조건에 맞는 제품이 없습니다." : "등록된 제품이 없습니다."}
      </h2>
      <button
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-4 w-4" />
        제품 추가
      </button>
    </section>
  );
}

function ProductListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="grid place-items-center rounded-lg border bg-white px-5 py-12 text-center">
      <Package className="h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">제품 목록을 불러오지 못했습니다.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {getApiErrorMessage(error)}
      </p>
      <button
        className="mt-4 h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        재시도
      </button>
    </section>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="h-20 animate-pulse rounded-lg bg-muted" key={index} />
      ))}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate font-medium">{value}</dd>
    </div>
  );
}
