import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, IdCard, Link2, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { ProductTargetField } from "@/features/product/components/product-target-field";
import {
  useCreateProductConnectionMutation,
  useDeleteProductConnectionMutation,
} from "@/features/product/hooks/use-product-mutations";
import {
  emptyProductConnectionFormValues,
  productConnectionFormSchema,
  toCreateProductConnectionInput,
  type ProductConnectionFormValues,
} from "@/features/product/schemas/product-schema";
import type {
  ProductConnection,
  ProductConnectionTargetType,
  ProductConnectionType,
} from "@/features/product/types/product";
import { getApiErrorMessage } from "@/lib/api-client";

const connectionTypeLabels: Record<ProductConnectionType, string> = {
  INTERESTED: "관심",
  DELIVERED: "납품",
  PROPOSED: "제안",
  COMPETITOR: "경쟁",
  MAINTENANCE: "유지보수",
  OTHER: "기타",
};

const targetTypeLabels: Record<ProductConnectionTargetType, string> = {
  COMPANY: "회사",
  CONTACT: "거래처",
  DEAL: "딜",
};

type ProductConnectionSectionProps = {
  readonly productId: string;
  readonly connections: ProductConnection[];
  readonly onChanged: (message: string) => void;
};

export function ProductConnectionSection({
  productId,
  connections,
  onChanged,
}: ProductConnectionSectionProps) {
  const createConnectionMutation = useCreateProductConnectionMutation();
  const deleteConnectionMutation = useDeleteProductConnectionMutation(productId);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductConnectionFormValues>({
    resolver: zodResolver(productConnectionFormSchema),
    defaultValues: emptyProductConnectionFormValues,
  });
  const targetType = watch("targetType");
  const targetId = watch("targetId") ?? "";
  const targetSearch = watch("targetSearch") ?? "";

  const onCreate = handleSubmit(async (values) => {
    await createConnectionMutation.mutateAsync(
      toCreateProductConnectionInput(productId, values)
    );
    reset(emptyProductConnectionFormValues);
    onChanged("제품 연결이 추가되었습니다.");
  });

  const onDelete = async (connection: ProductConnection) => {
    await deleteConnectionMutation.mutateAsync(connection.id);
    onChanged("제품 연결이 삭제되었습니다.");
  };

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-semibold">연결 대상</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          제품을 회사나 거래처에 연결합니다.
        </p>
      </div>

      <form className="grid gap-3 rounded-lg border bg-white p-4" onSubmit={onCreate}>
        <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)]">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="product-target-type">
              대상 유형
            </label>
            <select
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-target-type"
              {...register("targetType", {
                onChange: () => {
                  setValue("targetId", "");
                  setValue("targetSearch", "");
                },
              })}
            >
              <option value="COMPANY">회사</option>
              <option value="CONTACT">거래처</option>
              <option disabled value="DEAL">
                딜
              </option>
            </select>
          </div>
          <ProductTargetField
            id="product-target-search"
            label="연결 대상"
            onSearchChange={(value) =>
              setValue("targetSearch", value, { shouldDirty: true })
            }
            onTargetIdChange={(value) =>
              setValue("targetId", value, { shouldDirty: true })
            }
            search={targetSearch}
            targetId={targetId}
            targetType={targetType}
          />
        </div>
        {errors.targetId ? (
          <p className="text-xs text-destructive">{errors.targetId.message}</p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="product-connection-type">
              연결 유형
            </label>
            <select
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-connection-type"
              {...register("connectionType")}
            >
              {Object.entries(connectionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="product-connection-note">
              설명
            </label>
            <input
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="product-connection-note"
              {...register("note")}
            />
          </div>
        </div>

        {createConnectionMutation.error ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(createConnectionMutation.error)}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createConnectionMutation.isPending}
            type="submit"
          >
            <Plus className="h-4 w-4" />
            연결 추가
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        {connections.length === 0 ? (
          <div className="grid place-items-center px-4 py-8 text-center">
            <Link2 className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              연결된 회사나 거래처가 없습니다.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {connections.map((connection) => (
              <article
                className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between"
                key={connection.id}
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <TargetIcon targetType={connection.targetType} />
                    <span className="font-semibold">{connection.targetName}</span>
                    <span className="inline-flex h-7 items-center rounded-full border bg-muted px-2.5 text-xs font-medium">
                      {targetTypeLabels[connection.targetType]}
                    </span>
                    <span className="inline-flex h-7 items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 text-xs font-medium text-sky-900">
                      {connectionTypeLabels[connection.connectionType]}
                    </span>
                  </p>
                  {connection.note ? (
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {connection.note}
                    </p>
                  ) : null}
                </div>
                <button
                  className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={deleteConnectionMutation.isPending}
                  onClick={() => void onDelete(connection)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {deleteConnectionMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(deleteConnectionMutation.error)}
        </p>
      ) : null}
    </section>
  );
}

function TargetIcon({
  targetType,
}: {
  readonly targetType: ProductConnectionTargetType;
}) {
  if (targetType === "CONTACT") {
    return <IdCard className="h-4 w-4 text-muted-foreground" />;
  }

  if (targetType === "DEAL") {
    return <Link2 className="h-4 w-4 text-muted-foreground" />;
  }

  return <Building2 className="h-4 w-4 text-muted-foreground" />;
}
