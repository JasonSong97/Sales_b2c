import { z } from "zod";
import type {
  CreateScheduleInput,
  Schedule,
  ScheduleDetail,
  UpdateScheduleInput,
} from "@/features/schedule/types/schedule";

export const scheduleFormSchema = z
  .object({
    title: z.string().trim().min(1, "일정 제목을 입력해주세요.").max(160),
    startAt: z.string().min(1, "시작일시를 입력해주세요."),
    endAt: z.string().min(1, "종료일시를 입력해주세요."),
    allDay: z.boolean(),
    location: z.string().max(240).optional(),
    dealId: z.string().optional(),
    dealSearch: z.string().optional(),
    companyId: z.string().optional(),
    companySearch: z.string().optional(),
    contactId: z.string().optional(),
    contactSearch: z.string().optional(),
    memo: z.string().max(4000).optional(),
    reminderMinutes: z.array(z.number().int().min(0).max(60 * 24 * 30)),
  })
  .refine((values) => toDate(values.startAt) < toDate(values.endAt), {
    message: "종료일시는 시작일시보다 늦어야 합니다.",
    path: ["endAt"],
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const emptyScheduleFormValues: ScheduleFormValues = {
  title: "",
  startAt: "",
  endAt: "",
  allDay: false,
  location: "",
  dealId: "",
  dealSearch: "",
  companyId: "",
  companySearch: "",
  contactId: "",
  contactSearch: "",
  memo: "",
  reminderMinutes: [30],
};

export function toCreateScheduleInput(
  values: ScheduleFormValues
): CreateScheduleInput {
  return {
    title: values.title.trim(),
    startAt: toIsoString(values.startAt),
    endAt: toIsoString(values.endAt),
    allDay: values.allDay,
    location: toOptionalText(values.location),
    dealId: toOptionalText(values.dealId),
    companyId: toOptionalText(values.companyId),
    contactId: toOptionalText(values.contactId),
    memo: toOptionalText(values.memo),
    reminderMinutes: values.reminderMinutes,
  };
}

export function toUpdateScheduleInput(
  scheduleId: string,
  values: ScheduleFormValues
): UpdateScheduleInput {
  return {
    scheduleId,
    ...toCreateScheduleInput(values),
  };
}

export function toScheduleFormValues(
  detail: ScheduleDetail | null,
  fallback: Schedule | null
): ScheduleFormValues {
  const schedule = detail?.schedule ?? fallback;

  if (!schedule) {
    return emptyScheduleFormValues;
  }

  return {
    title: schedule.title,
    startAt: toDateTimeLocalValue(schedule.startAt),
    endAt: toDateTimeLocalValue(schedule.endAt),
    allDay: schedule.allDay,
    location: schedule.location ?? "",
    dealId: schedule.dealId ?? "",
    dealSearch: schedule.dealTitle ?? "",
    companyId: schedule.companyId ?? "",
    companySearch: schedule.companyName ?? "",
    contactId: schedule.contactId ?? "",
    contactSearch: schedule.contactName ?? "",
    memo: schedule.memo ?? "",
    reminderMinutes: toReminderMinutes(schedule),
  };
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offsetMs);

  return local.toISOString().slice(0, 16);
}

function toReminderMinutes(schedule: Schedule) {
  const startAt = new Date(schedule.startAt).getTime();
  const minutes = schedule.reminders.map((reminder) =>
    Math.max(
      0,
      Math.round((startAt - new Date(reminder.remindAt).getTime()) / 60_000)
    )
  );

  return minutes.length > 0 ? minutes : [30];
}

function toIsoString(value: string) {
  return toDate(value).toISOString();
}

function toDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(NaN);
  }

  return date;
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}
