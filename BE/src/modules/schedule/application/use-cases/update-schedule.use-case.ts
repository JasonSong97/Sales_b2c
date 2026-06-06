import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toScheduleResponse } from "../schedule-response";
import {
  assertValidRange,
  normalizeOptionalAllDay,
  normalizeOptionalDate,
  normalizeOptionalId,
  normalizeOptionalReminderMinutes,
  normalizeOptionalText,
  normalizeRequiredText,
} from "./schedule-input";

export interface UpdateScheduleCommand {
  readonly title?: string;
  readonly startAt?: string;
  readonly endAt?: string;
  readonly allDay?: boolean;
  readonly location?: string | null;
  readonly dealId?: string | null;
  readonly companyId?: string | null;
  readonly contactId?: string | null;
  readonly memo?: string | null;
  readonly reminderMinutes?: number[] | null;
}

@Injectable()
export class UpdateScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    scheduleId: string,
    command: UpdateScheduleCommand
  ) {
    const startAt = normalizeOptionalDate(command.startAt);
    const endAt = normalizeOptionalDate(command.endAt);

    if (startAt && endAt) {
      assertValidRange(startAt, endAt);
    }

    const schedule = await this.scheduleRepository.updateSchedule({
      userId: currentUser.id,
      scheduleId,
      ...(command.title !== undefined
        ? { title: normalizeRequiredText(command.title) }
        : {}),
      ...(startAt !== undefined ? { startAt } : {}),
      ...(endAt !== undefined ? { endAt } : {}),
      ...(command.allDay !== undefined
        ? { allDay: normalizeOptionalAllDay(command.allDay) }
        : {}),
      ...(command.location !== undefined
        ? { location: normalizeOptionalText(command.location) }
        : {}),
      ...(command.memo !== undefined
        ? { memo: normalizeOptionalText(command.memo) }
        : {}),
      ...(command.dealId !== undefined
        ? { dealId: normalizeOptionalId(command.dealId) }
        : {}),
      ...(command.companyId !== undefined
        ? { companyId: normalizeOptionalId(command.companyId) }
        : {}),
      ...(command.contactId !== undefined
        ? { contactId: normalizeOptionalId(command.contactId) }
        : {}),
      ...(command.reminderMinutes !== undefined
        ? {
            reminderMinutes: normalizeOptionalReminderMinutes(
              command.reminderMinutes
            ),
          }
        : {}),
    });

    return toScheduleResponse(schedule);
  }
}
