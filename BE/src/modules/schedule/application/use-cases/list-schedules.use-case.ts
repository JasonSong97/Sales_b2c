import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toScheduleListResponse } from "../schedule-response";
import {
  normalizeOptionalId,
  normalizeScheduleRange,
  normalizeScheduleSource,
} from "./schedule-input";

export interface ListSchedulesQuery {
  readonly from?: string;
  readonly to?: string;
  readonly timezone?: string;
  readonly dealId?: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly source?: string;
}

@Injectable()
export class ListSchedulesUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(currentUser: CurrentUserContext, query: ListSchedulesQuery) {
    const range = normalizeScheduleRange(query);
    const result = await this.scheduleRepository.listSchedules({
      userId: currentUser.id,
      rangeStart: range.rangeStart,
      rangeEnd: range.rangeEnd,
      dealId: normalizeOptionalId(query.dealId),
      companyId: normalizeOptionalId(query.companyId),
      contactId: normalizeOptionalId(query.contactId),
      source: normalizeScheduleSource(query.source),
    });

    return toScheduleListResponse(result);
  }
}
