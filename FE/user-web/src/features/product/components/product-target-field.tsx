import { Building2, IdCard, X } from "lucide-react";
import { useProductTargetOptions } from "@/features/product/hooks/use-product-target-options";
import type { ProductConnectionTargetType } from "@/features/product/types/product";

type ProductTargetFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly search: string;
  readonly onTargetIdChange: (targetId: string) => void;
  readonly onSearchChange: (search: string) => void;
};

export function ProductTargetField({
  id,
  label,
  targetType,
  targetId,
  search,
  onTargetIdChange,
  onSearchChange,
}: ProductTargetFieldProps) {
  const targetOptionsQuery = useProductTargetOptions(targetType, search);
  const options = targetOptionsQuery.data ?? [];
  const Icon = targetType === "CONTACT" ? IdCard : Building2;
  const isDealTarget = targetType === "DEAL";

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring disabled:bg-muted"
          disabled={isDealTarget}
          id={id}
          onChange={(event) => {
            onSearchChange(event.target.value);
            onTargetIdChange("");
          }}
          placeholder={isDealTarget ? "G12 이후 딜 연결 지원" : undefined}
          value={search}
        />
        {targetId || search ? (
          <button
            aria-label="연결 대상 선택 지우기"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => {
              onTargetIdChange("");
              onSearchChange("");
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isDealTarget ? (
        <p className="text-xs text-muted-foreground">
          딜 연결은 G12 Deal Backend 이후 선택 목록을 붙입니다.
        </p>
      ) : null}

      {search.trim().length > 0 && !isDealTarget ? (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {targetOptionsQuery.isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">검색 중</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              선택할 대상이 없습니다.
            </p>
          ) : (
            options.map((option) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={option.id}
                onClick={() => {
                  onTargetIdChange(option.id);
                  onSearchChange(option.name);
                }}
                type="button"
              >
                <span className="font-medium">{option.name}</span>
                <span className="text-xs text-muted-foreground">
                  {option.subtitle || "-"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
