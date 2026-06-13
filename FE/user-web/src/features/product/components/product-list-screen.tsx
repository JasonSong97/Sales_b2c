import { Package, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ProductCreateDialog } from "@/features/product/components/product-create-dialog";
import { useProductList } from "@/features/product/hooks/use-product-list";
import type { Product } from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

type SaleStatus = "ALL" | "active" | "deleted";

export function ProductListScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [saleStatus, setSaleStatus] = useState<SaleStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [connectionFilter, setConnectionFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // TopBar SearchBar에서 넘어온 검색어
  const search = searchParams.get("q") ?? "";

  // TopBar "제품 추가" 버튼 → ?action=create
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setIsCreateOpen(true);
      void navigate("/products", { replace: true });
    }
  }, [navigate, searchParams]);

  const productsQuery = useProductList({
    page: 1,
    pageSize: 20,
    search: search || undefined,
    includeDeleted: saleStatus === "deleted" || saleStatus === "ALL",
    category: categoryFilter || undefined,
  });

  const products = productsQuery.data?.items ?? [];
  const totalCount = productsQuery.data?.totalCount ?? 0;

  const filteredProducts = (() => {
    let list = products;
    if (saleStatus === "active") list = list.filter((p) => !p.deletedAt);
    if (saleStatus === "deleted") list = list.filter((p) => p.deletedAt);
    if (connectionFilter === "connected") list = list.filter((p) => p.connectionCount > 0);
    if (connectionFilter === "none") list = list.filter((p) => p.connectionCount === 0);
    return list;
  })();

  return (
    <section className="flex flex-col gap-0 px-6 py-5">
      {/* Controls Bar */}
      <div className="mb-3 flex h-10 shrink-0 items-center gap-2">
        {/* 전체 */}
        <button
          className={cn(
            "inline-flex h-[30px] items-center rounded-[7px] px-3 text-[12px] font-bold transition-colors",
            saleStatus === "ALL"
              ? "border border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
              : "border border-[#E6EAF0] bg-white text-[#475569] hover:bg-gray-50"
          )}
          onClick={() => setSaleStatus("ALL")}
          type="button"
        >
          전체
        </button>

        {/* 카테고리 ▾ */}
        <div className="relative">
          <select
            className={cn(
              "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50",
              categoryFilter && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
            )}
            onChange={(e) => setCategoryFilter(e.target.value)}
            value={categoryFilter}
          >
            <option value="">카테고리 ▾</option>
            <option value="소프트웨어">소프트웨어</option>
            <option value="하드웨어">하드웨어</option>
            <option value="SaaS">SaaS</option>
            <option value="서비스">서비스</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 연결 상태 ▾ */}
        <div className="relative">
          <select
            className={cn(
              "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50",
              connectionFilter && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
            )}
            onChange={(e) => setConnectionFilter(e.target.value)}
            value={connectionFilter}
          >
            <option value="">연결 상태 ▾</option>
            <option value="connected">연결됨</option>
            <option value="none">미연결</option>
          </select>
        </div>

        {/* 판매 상태 ▾ */}
        <div className="relative">
          <select
            className={cn(
              "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50",
              saleStatus !== "ALL" && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
            )}
            onChange={(e) => setSaleStatus(e.target.value as SaleStatus)}
            value={saleStatus}
          >
            <option value="ALL">판매 상태 ▾</option>
            <option value="active">활성</option>
            <option value="deleted">삭제됨</option>
          </select>
        </div>

        <div className="flex-1" />
        <span className="text-[12px] font-semibold text-[#64748B]">{totalCount}개</span>
      </div>

      {/* Table Card */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
        {/* Notice */}
        {notice ? (
          <div className="mx-6 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}

        {/* Table Header */}
        <div className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6" style={{ height: 44 }}>
          <ProductHeaderCell width={280}>제품명</ProductHeaderCell>
          <ProductHeaderCell width={150}>카테고리</ProductHeaderCell>
          <ProductHeaderCell width={80}>연결</ProductHeaderCell>
          <ProductHeaderCell width={100}>상태</ProductHeaderCell>
          <ProductHeaderCell flex>등록일</ProductHeaderCell>
        </div>

        {/* Table Body */}
        {productsQuery.isLoading ? (
          <ProductListSkeleton />
        ) : productsQuery.isError ? (
          <ProductListError
            error={productsQuery.error}
            onRetry={() => void productsQuery.refetch()}
          />
        ) : filteredProducts.length === 0 ? (
          <ProductEmptyState
            hasSearch={search.length > 0}
            onCreate={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="mt-4 grid gap-3 md:hidden">
        {filteredProducts.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>

      <ProductCreateDialog
        onCreated={(product) => {
          setNotice(`${product.name} 제품이 추가되었습니다.`);
        }}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

function ProductRow({ product }: { readonly product: Product }) {
  const isDeleted = !!product.deletedAt;

  return (
    <Link
      className="flex items-center border-b border-[#E8EDF3] px-6 hover:bg-[#F9FAFB] last:border-b-0"
      style={{ height: 62 }}
      to={`/products/${product.id}`}
    >
      <div style={{ width: 280 }} className="min-w-0 shrink-0">
        <span
          className={cn(
            "block truncate text-[13px] font-semibold",
            isDeleted ? "text-[#9CA3AF] line-through" : "text-[#111827]"
          )}
        >
          {product.name}
        </span>
        {isDeleted ? (
          <span className="mt-0.5 block text-[11px] text-[#EF4444]">삭제됨</span>
        ) : null}
      </div>
      <div style={{ width: 150 }} className="shrink-0">
        {product.category ? (
          <span className="inline-flex h-6 items-center rounded-md bg-[#F3F4F6] px-2.5 text-[11px] font-medium text-[#374151]">
            {product.category}
          </span>
        ) : (
          <span className="text-[12px] text-[#9CA3AF]">-</span>
        )}
      </div>
      <div style={{ width: 80 }} className="shrink-0">
        <span className="text-[13px] text-[#374151]">{product.connectionCount}건</span>
      </div>
      <div style={{ width: 100 }} className="shrink-0">
        <ProductStatusBadge product={product} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[12px] text-[#374151]">
          {formatDate(product.createdAt, { year: "numeric" })}
        </span>
      </div>
    </Link>
  );
}

function ProductStatusBadge({ product }: { readonly product: Product }) {
  if (product.deletedAt) {
    return (
      <span className="inline-flex h-6 items-center rounded-md bg-[#FEF3C7] px-2.5 text-[11px] font-medium text-[#92400E]">
        삭제됨
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-[#D1FAE5] px-2.5 text-[11px] font-medium text-[#065F46]">
      활성
    </span>
  );
}

function ProductHeaderCell({
  children,
  width,
  flex = false,
}: {
  readonly children: string;
  readonly width?: number;
  readonly flex?: boolean;
}) {
  return (
    <div
      className={cn("shrink-0 text-[12px] font-bold text-[#334155]", flex && "min-w-0 flex-1")}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );
}

function MobileProductCard({ product }: { readonly product: Product }) {
  return (
    <Link
      className="block rounded-lg border border-[#E5EAF0] bg-white p-4 hover:bg-[#F9FAFB]"
      to={`/products/${product.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#111827]">{product.name}</p>
          <p className="mt-0.5 text-[12px] text-[#6B7280]">
            {product.category ?? "카테고리 없음"}
          </p>
        </div>
        <ProductStatusBadge product={product} />
      </div>
      <div className="mt-3 flex gap-4 text-[12px] text-[#6B7280]">
        <span>연결 {product.connectionCount}건</span>
        <span>등록일 {formatDate(product.createdAt, { year: "numeric" })}</span>
      </div>
    </Link>
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
    <div className="grid place-items-center px-5 py-16 text-center">
      <Package className="h-10 w-10 text-[#D1D5DB]" />
      <p className="mt-4 text-[14px] font-semibold text-[#374151]">
        {hasSearch ? "조건에 맞는 제품이 없습니다." : "등록된 제품이 없습니다."}
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">
        새 제품을 등록하면 목록에서 바로 확인할 수 있습니다.
      </p>
      <button
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white hover:bg-[#1E40AF]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        제품 추가
      </button>
    </div>
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
    <div className="px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-[#EF4444]">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] px-3 text-[13px] text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          className="animate-pulse border-b border-[#E8EDF3] bg-[#FAFBFC]"
          key={i}
          style={{ height: 62 }}
        />
      ))}
    </div>
  );
}
