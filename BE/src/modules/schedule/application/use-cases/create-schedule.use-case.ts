import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  type ScheduleRepository,
} from "@/modules/schedule/application/ports/schedule.repository";
import { NotificationScheduler } from "@/modules/notification/application/use-cases/notification-scheduler.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { toScheduleResponse } from "../schedule-response";
import {
  assertValidRange,
  normalizeAllDay,
  normalizeOptionalId,
  normalizeOptionalText,
  normalizeReminderMinutes,
  normalizeRequiredDate,
  normalizeRequiredText,
} from "./schedule-input";

export interface CreateScheduleCommand {
  readonly title: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly allDay?: boolean;
  readonly location?: string;
  readonly dealId?: string;
  readonly companyId?: string;
  readonly contactId?: string;
  readonly memo?: string;
  readonly reminderMinutes?: number[];
}

@Injectable()
export class CreateScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository,
    private readonly notificationScheduler: NotificationScheduler
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    command: CreateScheduleCommand
  ) {
    const startAt = normalizeRequiredDate(command.startAt);
    const endAt = normalizeRequiredDate(command.endAt);
    assertValidRange(startAt, endAt);

    const schedule = await this.scheduleRepository.createSchedule({
      userId: currentUser.id,
      title: normalizeRequiredText(command.title),
      startAt,
      endAt,
      allDay: normalizeAllDay(command.allDay),
      location: normalizeOptionalText(command.location),
      memo: normalizeOptionalText(command.memo),
      dealId: normalizeOptionalId(command.dealId),
      companyId: normalizeOptionalId(command.companyId),
      contactId: normalizeOptionalId(command.contactId),
      reminderMinutes: normalizeReminderMinutes(command.reminderMinutes),
    });

    await this.notificationScheduler.replaceScheduleReminderNotifications({
      userId: currentUser.id,
      scheduleId: schedule.id,
      scheduleTitle: schedule.title,
      startAt: schedule.startAt,
      reminders: schedule.reminders,
    });

    return toScheduleResponse(schedule);
  }
}
