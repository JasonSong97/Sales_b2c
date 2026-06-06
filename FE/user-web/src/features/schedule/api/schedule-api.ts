import type {
  CreateScheduleInput,
  DeleteScheduleResponse,
  Schedule,
  ScheduleDetail,
  ScheduleListParams,
  ScheduleListResponse,
  UpdateScheduleInput,
  WeeklyScheduleParams,
  WeeklyScheduleResponse,
} from "@/features/schedule/types/schedule";
import { apiClient } from "@/lib/api-client";

export function listSchedules(params: ScheduleListParams) {
  const query = toScheduleListSearchParams(params);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiClient<ScheduleListResponse>(`/api/schedules${suffix}`);
}

export function createSchedule(input: CreateScheduleInput) {
  return apiClient<Schedule>("/api/schedules", {
    method: "POST",
    body: compactBody(input),
  });
}

export function getSchedule(scheduleId: string) {
  return apiClient<ScheduleDetail>(`/api/schedules/${scheduleId}`);
}

export function updateSchedule(input: UpdateScheduleInput) {
  return apiClient<Schedule>(`/api/schedules/${input.scheduleId}`, {
    method: "PATCH",
    body: compactBody({
      title: input.title,
      startAt: input.startAt,
      endAt: input.endAt,
      allDay: input.allDay,
      location: input.location,
      dealId: input.dealId,
      companyId: input.companyId,
      contactId: input.contactId,
      memo: input.memo,
      reminderMinutes: input.reminderMinutes,
    }),
  });
}

export function deleteSchedule(scheduleId: string) {
  return apiClient<DeleteScheduleResponse>(`/api/schedules/${scheduleId}`, {
    method: "DELETE",
  });
}

export function getWeeklySchedules(params: WeeklyScheduleParams) {
  const query = new URLSearchParams();
  query.set("weekStart", params.weekStart);

  if (params.timezone) {
    query.set("timezone", params.timezone);
  }

  return apiClient<WeeklyScheduleResponse>(
    `/api/schedules/week?${query.toString()}`
  );
}

function toScheduleListSearchParams(params: ScheduleListParams) {
  const searchParams = new URLSearchParams();

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  if (params.timezone) {
    searchParams.set("timezone", params.timezone);
  }

  if (params.dealId) {
    searchParams.set("dealId", params.dealId);
  }

  if (params.companyId) {
    searchParams.set("companyId", params.companyId);
  }

  if (params.contactId) {
    searchParams.set("contactId", params.contactId);
  }

  if (params.source) {
    searchParams.set("source", params.source);
  }

  return searchParams;
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}
