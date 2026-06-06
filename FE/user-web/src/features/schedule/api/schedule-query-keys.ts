import type {
  ScheduleListParams,
  WeeklyScheduleParams,
} from "@/features/schedule/types/schedule";

export const scheduleQueryKeys = {
  all: ["schedule"] as const,
  lists: () => [...scheduleQueryKeys.all, "list"] as const,
  list: (params: ScheduleListParams) =>
    [
      ...scheduleQueryKeys.lists(),
      {
        from: params.from ?? "",
        to: params.to ?? "",
        timezone: params.timezone ?? "",
        dealId: params.dealId ?? "",
        companyId: params.companyId ?? "",
        contactId: params.contactId ?? "",
        source: params.source ?? "",
      },
    ] as const,
  details: () => [...scheduleQueryKeys.all, "detail"] as const,
  detail: (scheduleId: string) =>
    [...scheduleQueryKeys.details(), scheduleId] as const,
  weeks: () => [...scheduleQueryKeys.all, "week"] as const,
  week: (params: WeeklyScheduleParams) =>
    [
      ...scheduleQueryKeys.weeks(),
      {
        weekStart: params.weekStart,
        timezone: params.timezone ?? "",
      },
    ] as const,
};
