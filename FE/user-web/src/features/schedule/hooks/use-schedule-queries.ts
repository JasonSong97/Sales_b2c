import { useQuery } from "@tanstack/react-query";
import {
  getSchedule,
  getWeeklySchedules,
  listSchedules,
} from "@/features/schedule/api/schedule-api";
import { scheduleQueryKeys } from "@/features/schedule/api/schedule-query-keys";
import type {
  ScheduleListParams,
  WeeklyScheduleParams,
} from "@/features/schedule/types/schedule";

export function useScheduleList(params: ScheduleListParams) {
  return useQuery({
    queryKey: scheduleQueryKeys.list(params),
    queryFn: () => listSchedules(params),
  });
}

export function useScheduleDetail(scheduleId: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && scheduleId.length > 0,
    queryKey: scheduleQueryKeys.detail(scheduleId),
    queryFn: () => getSchedule(scheduleId),
  });
}

export function useWeeklySchedules(params: WeeklyScheduleParams) {
  return useQuery({
    queryKey: scheduleQueryKeys.week(params),
    queryFn: () => getWeeklySchedules(params),
  });
}
