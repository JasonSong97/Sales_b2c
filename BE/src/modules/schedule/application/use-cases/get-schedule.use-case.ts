import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toScheduleDetailResponse } from "../schedule-response";
import { assertNotDeleted, assertScheduleExists } from "./schedule-input";

@Injectable()
export class GetScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(currentUser: CurrentUserContext, scheduleId: string) {
    const detail = assertScheduleExists(
      await this.scheduleRepository.getScheduleDetail(currentUser.id, scheduleId)
    );
    assertNotDeleted(detail.schedule.deletedAt, "read");

    return toScheduleDetailResponse(detail);
  }
}
