import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toScheduleResponse } from "../schedule-response";

@Injectable()
export class RestoreScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(currentUser: CurrentUserContext, scheduleId: string) {
    return toScheduleResponse(
      await this.scheduleRepository.restoreSchedule(currentUser.id, scheduleId)
    );
  }
}
