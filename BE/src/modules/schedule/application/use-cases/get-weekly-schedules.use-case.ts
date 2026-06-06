import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRecord,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toWeeklyScheduleResponse } from "../schedule-response";
import {
  addDays,
  getLocalDateKey,
  normalizeWeeklyRange,
} from "./schedule-input";

export interface GetWeeklySchedulesQuery {
  readonly weekStart: string;
  readonly timezone?: string;
}

@Injectable()
export class GetWeeklySchedulesUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    query: GetWeeklySchedulesQuery
  ) {
    const range = normalizeWeeklyRange(query);
    const result = await this.scheduleRepository.listSchedules({
      userId: currentUser.id,
      rangeStart: range.rangeStart,
      rangeEnd: range.rangeEnd,
      dealId: null,
      companyId: null,
      contactId: null,
      source: null,
    });
    const schedulesByDate = groupSchedulesByDate(result.items, range.timezone);
    const days = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(range.rangeStart, index);
      const date = getLocalDateKey(day, range.timezone);

      return {
        date,
        schedules: schedulesByDate.get(date) ?? [],
      };
    });

    return toWeeklyScheduleResponse({
      weekStart: range.rangeStart,
      weekEnd: range.rangeEnd,
      days,
    });
  }
}

function groupSchedulesByDate(
  schedules: ScheduleRecord[],
  timezone: string
): Map<string, ScheduleRecord[]> {
  const grouped = new Map<string, ScheduleRecord[]>();

  for (const schedule of schedules) {
    const date = getLocalDateKey(schedule.startAt, timezone);
    const items = grouped.get(date) ?? [];
    items.push(schedule);
    grouped.set(date, items);
  }

  return grouped;
}
