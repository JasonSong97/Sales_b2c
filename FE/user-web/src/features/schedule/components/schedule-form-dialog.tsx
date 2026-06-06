import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  IdCard,
  MapPin,
  Trash2,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { DealEntitySearchField } from "@/features/deal/components/deal-entity-search-field";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useUpdateScheduleMutation,
} from "@/features/schedule/hooks/use-schedule-mutations";
import {
  useScheduleCompanyOptions,
  useScheduleContactOptions,
  useScheduleDealOptions,
  type ScheduleEntityOption,
} from "@/features/schedule/hooks/use-schedule-entity-options";
import { useScheduleDetail } from "@/features/schedule/hooks/use-schedule-queries";
import {
  emptyScheduleFormValues,
  scheduleFormSchema,
  toCreateScheduleInput,
  toDateTimeLocalValue,
  toScheduleFormValues,
  toUpdateScheduleInput,
  type ScheduleFormValues,
} from "@/features/schedule/schemas/schedule-schema";
import type { Schedule } from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";

type ScheduleFormDialogProps = {
  readonly open: boolean;
  readonly schedule: Schedule | null;
  readonly initialStartAt: Date | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: (message: string) => void;
};

const reminderOptions = [
  { value: 10, label: "10분 전" },
  { value: 30, label: "30분 전" },
  { value: 60, label: "1시간 전" },
  { value: 24 * 60, label: "1일 전" },
];

export function ScheduleFormDialog({
  open,
  schedule,
  initialStartAt,
  onOpenChange,
  onSaved,
}: ScheduleFormDialogProps) {
  const scheduleId = schedule?.id ?? "";
  const detailQuery = useScheduleDetail(scheduleId, open && Boolean(schedule));
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const deleteScheduleMutation = useDeleteScheduleMutation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: emptyScheduleFormValues,
  });
  const dealId = useWatch({ control, name: "dealId" }) ?? "";
  const dealSearch = useWatch({ control, name: "dealSearch" }) ?? "";
  const companyId = useWatch({ control, name: "companyId" }) ?? "";
  const companySearch = useWatch({ control, name: "companySearch" }) ?? "";
  const contactId = useWatch({ control, name: "contactId" }) ?? "";
  const contactSearch = useWatch({ control, name: "contactSearch" }) ?? "";
  const reminderMinutes = useWatch({ control, name: "reminderMinutes" }) ?? [];
  const dealOptionsQuery = useScheduleDealOptions(dealSearch);
  const companyOptionsQuery = useScheduleCompanyOptions(companySearch);
  const contactOptionsQuery = useScheduleContactOptions(contactSearch, companyId);
  const isEdit = Boolean(schedule);
  const actionError =
    createScheduleMutation.error ??
    updateScheduleMutation.error ??
    deleteScheduleMutation.error ??
    detailQuery.error ??
    null;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEdit) {
      reset(toScheduleFormValues(detailQuery.data ?? null, schedule));
      return;
    }

    reset(getCreateDefaults(initialStartAt));
  }, [detailQuery.data, initialStartAt, isEdit, open, reset, schedule]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    if (schedule) {
      const updated = await updateScheduleMutation.mutateAsync(
        toUpdateScheduleInput(schedule.id, values)
      );
      onSaved(`${updated.title} 일정이 수정되었습니다.`);
    } else {
      const created = await createScheduleMutation.mutateAsync(
        toCreateScheduleInput(values)
      );
      onSaved(`${created.title} 일정이 생성되었습니다.`);
    }

    onOpenChange(false);
  });

  const onDelete = async () => {
    if (!schedule || !window.confirm("일정을 삭제할까요?")) {
      return;
    }

    await deleteScheduleMutation.mutateAsync(schedule.id);
    onSaved(`${schedule.title} 일정이 삭제되었습니다.`);
    onOpenChange(false);
  };

  const onDealSelect = (option: ScheduleEntityOption) => {
    setValue("dealId", option.id, { shouldValidate: true });
    setValue("dealSearch", option.name, { shouldValidate: true });

    if (option.companyId && option.companyName) {
      setValue("companyId", option.companyId, { shouldValidate: true });
      setValue("companySearch", option.companyName, { shouldValidate: true });
    }

    if (option.contactId && option.contactName) {
      setValue("contactId", option.contactId, { shouldValidate: true });
      setValue("contactSearch", option.contactName, { shouldValidate: true });
    }
  };

  const onCompanySelect = (option: ScheduleEntityOption) => {
    setValue("companyId", option.id, { shouldValidate: true });
    setValue("companySearch", option.name, { shouldValidate: true });
    clearContact();
  };

  const onContactSelect = (option: ScheduleEntityOption) => {
    setValue("contactId", option.id, { shouldValidate: true });
    setValue("contactSearch", option.name, { shouldValidate: true });
  };

  const toggleReminder = (value: number) => {
    const next = reminderMinutes.includes(value)
      ? reminderMinutes.filter((item) => item !== value)
      : [...reminderMinutes, value].sort((left, right) => left - right);

    setValue("reminderMinutes", next, { shouldValidate: true });
  };

  const clearDeal = () => {
    setValue("dealId", "", { shouldValidate: true });
    setValue("dealSearch", "", { shouldValidate: true });
  };

  const clearCompany = () => {
    setValue("companyId", "", { shouldValidate: true });
    setValue("companySearch", "", { shouldValidate: true });
    clearContact();
  };

  const clearContact = () => {
    setValue("contactId", "", { shouldValidate: true });
    setValue("contactSearch", "", { shouldValidate: true });
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
            <h2 className="text-lg font-semibold">
              {isEdit ? "일정 수정" : "일정 생성"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              일정 시간과 연결 대상을 저장합니다.
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
            {actionError ? (
              <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
                {getApiErrorMessage(actionError)}
              </p>
            ) : null}

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="schedule-title">
                제목
              </label>
              <input
                aria-describedby={
                  errors.title ? "schedule-title-error" : undefined
                }
                aria-invalid={Boolean(errors.title)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="schedule-title"
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-xs text-destructive" id="schedule-title-error">
                  {errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DateTimeField
                errorMessage={errors.startAt?.message}
                id="schedule-start"
                label="시작일시"
                register={register("startAt")}
              />
              <DateTimeField
                errorMessage={errors.endAt?.message}
                id="schedule-end"
                label="종료일시"
                register={register("endAt")}
              />
            </div>

            <label className="inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
              <input
                className="h-4 w-4 rounded border"
                type="checkbox"
                {...register("allDay")}
              />
              종일
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="schedule-location">
                  장소
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    id="schedule-location"
                    {...register("location")}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium">알림</span>
                <div className="flex flex-wrap gap-2">
                  {reminderOptions.map((option) => (
                    <button
                      className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium ${
                        reminderMinutes.includes(option.value)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-white hover:bg-muted"
                      }`}
                      key={option.value}
                      onClick={() => toggleReminder(option.value)}
                      type="button"
                    >
                      <Bell className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <DealEntitySearchField
                emptyText="검색된 딜이 없습니다."
                errorMessage={errors.dealId?.message}
                icon={BriefcaseBusiness}
                id="schedule-deal"
                isLoading={dealOptionsQuery.isFetching}
                label="딜"
                onClear={clearDeal}
                onSearchChange={(value) =>
                  setValue("dealSearch", value, { shouldValidate: true })
                }
                onSelect={onDealSelect}
                options={dealOptionsQuery.data ?? []}
                placeholder="딜 검색"
                search={dealSearch}
                selectedId={dealId}
              />
              <DealEntitySearchField
                emptyText="검색된 회사가 없습니다."
                errorMessage={errors.companyId?.message}
                icon={Building2}
                id="schedule-company"
                isLoading={companyOptionsQuery.isFetching}
                label="회사"
                onClear={clearCompany}
                onSearchChange={(value) =>
                  setValue("companySearch", value, { shouldValidate: true })
                }
                onSelect={onCompanySelect}
                options={companyOptionsQuery.data ?? []}
                placeholder="회사 검색"
                search={companySearch}
                selectedId={companyId}
              />
              <DealEntitySearchField
                emptyText="검색된 거래처가 없습니다."
                errorMessage={errors.contactId?.message}
                icon={IdCard}
                id="schedule-contact"
                isLoading={contactOptionsQuery.isFetching}
                label="거래처"
                onClear={clearContact}
                onSearchChange={(value) =>
                  setValue("contactSearch", value, { shouldValidate: true })
                }
                onSelect={onContactSelect}
                options={contactOptionsQuery.data ?? []}
                placeholder="거래처 검색"
                search={contactSearch}
                selectedId={contactId}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="schedule-memo">
                메모
              </label>
              <textarea
                className="min-h-28 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="schedule-memo"
                {...register("memo")}
              />
            </div>
          </div>

          <footer className="mt-6 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            {schedule ? (
              <button
                className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-destructive/40 px-4 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteScheduleMutation.isPending}
                onClick={() => void onDelete()}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="flex justify-end gap-2">
              <button
                className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  createScheduleMutation.isPending ||
                  updateScheduleMutation.isPending
                }
                type="submit"
              >
                <CalendarClock className="h-4 w-4" />
                저장
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

type DateTimeFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly errorMessage?: string;
  readonly register: UseFormRegisterReturn;
};

function DateTimeField({
  id,
  label,
  errorMessage,
  register,
}: DateTimeFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        type="datetime-local"
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function getCreateDefaults(initialStartAt: Date | null): ScheduleFormValues {
  const startAt = initialStartAt ?? getNextHour();
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  return {
    ...emptyScheduleFormValues,
    startAt: toDateTimeLocalValue(startAt),
    endAt: toDateTimeLocalValue(endAt),
  };
}

function getNextHour() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  return date;
}
