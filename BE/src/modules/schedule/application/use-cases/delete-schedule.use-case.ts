import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toDeleteScheduleResponse } from "../schedule-response";

@Injectable()
export class DeleteScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(currentUser: CurrentUserContext, scheduleId: string) {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await this.scheduleRepository.deleteSchedule(
      currentUser.id,
      scheduleId,
      now,
      permanentDeleteAt
    );

    return toDeleteScheduleResponse(result);
  }
}
