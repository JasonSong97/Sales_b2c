import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import { toUserNotificationSettingResponse } from "@/modules/notification/application/notification-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { normalizeDefaultReminderMinutes } from "./notification-input";

export interface UpdateNotificationSettingsCommand {
  readonly defaultReminderMinutes?: number;
  readonly emailNotificationEnabled?: boolean;
  readonly browserPushEnabled?: boolean;
}

@Injectable()
export class UpdateNotificationSettingsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    command: UpdateNotificationSettingsCommand
  ) {
    const setting = await this.notificationRepository.updateSetting(currentUser.id, {
      ...(command.defaultReminderMinutes !== undefined
        ? {
            defaultReminderMinutes: normalizeDefaultReminderMinutes(
              command.defaultReminderMinutes
            ),
          }
        : {}),
      ...(command.emailNotificationEnabled !== undefined
        ? { emailNotificationEnabled: command.emailNotificationEnabled }
        : {}),
      ...(command.browserPushEnabled !== undefined
        ? { browserPushEnabled: command.browserPushEnabled }
        : {}),
    });

    return toUserNotificationSettingResponse(setting);
  }
}
