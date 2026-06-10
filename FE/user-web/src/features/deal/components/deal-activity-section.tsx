import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateDealActivityMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  dealActivityFormSchema,
  toCreateDealActivityInput,
  toDateTimeLocalValue,
  type DealActivityFormValues,
} from "@/features/deal/schemas/deal-schema";
import type { DealActivity } from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

type DealActivitySectionProps = {
  readonly dealId: string;
  readonly activities: DealActivity[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly onChanged: (message: string) => void;
};

export function DealActivitySection({
  dealId,
  activities,
  isLoading,
  error,
  onRetry,
  onChanged,
}: DealActivitySectionProps) {
  const createActivityMutation = useCreateDealActivityMutation();
  const form = useForm<DealActivityFormValues>({
    resolver: zodResolver(dealActivityFormSchema),
    defaultValues: getEmptyActivityValues(),
  });

  const onCreate = form.handleSubmit(async (values) => {
    await createActivityMutation.mutateAsync(
      toCreateDealActivityInput(dealId, values)
    );
    form.reset(getEmptyActivityValues());
    onChanged("활동 로그가 추가되었습니다.");
  });

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-semibold">활동 로그</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          객관적 사실, 상태 변경, 행동 이력을 기록합니다.
        </p>
      </div>

      <form className="grid gap-3 rounded-lg border bg-white p-4" onSubmit={onCreate}>
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="deal-activity-date">
              활동 시간
            </label>
            <input
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="deal-activity-date"
              type="datetime-local"
              {...form.register("occurredAt")}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="deal-activity-title">
              제목
            </label>
            <input
              aria-describedby={
                form.formState.errors.title
                  ? "deal-activity-title-error"
                  : undefined
              }
              aria-invalid={Boolean(form.formState.errors.title)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="deal-activity-title"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive" id="deal-activity-title-error">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="deal-activity-content">
            내용
          </label>
          <textarea
            className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="deal-activity-content"
            {...form.register("content")}
          />
        </div>

        {createActivityMutation.error ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(createActivityMutation.error)}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createActivityMutation.isPending}
            type="submit"
          >
            <Plus className="h-4 w-4" />
            활동 추가
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        {isLoading ? (
          <div className="grid gap-3 px-4 py-5">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="h-16 animate-pulse rounded bg-muted" key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="grid gap-3 px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {getApiErrorMessage(error)}
            </p>
            <button
              className="mx-auto h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted"
              onClick={onRetry}
              type="button"
            >
              재시도
            </button>
          </div>
        ) : activities.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            등록된 활동 로그가 없습니다.
          </p>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <article
                className="grid grid-cols-[18px_minmax(0,1fr)] gap-3 px-4 py-4"
                key={activity.id}
              >
                <span className="mt-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.occurredAt, { includeYear: true })}
                    </p>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {activity.typeName}
                    </span>
                    {activity.isAutoGenerated ? (
                      <span className="rounded bg-sky-50 px-1.5 py-0.5 text-xs text-sky-700">
                        자동
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold">{activity.title}</h3>
                  {activity.content ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {activity.content}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function getEmptyActivityValues(): DealActivityFormValues {
  return {
    occurredAt: toDateTimeLocalValue(new Date()),
    title: "",
    content: "",
  };
}
