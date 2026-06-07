import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import { toNotificationResponse } from "@/modules/notification/application/notification-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(currentUser: CurrentUserContext, notificationId: string) {
    const notification = await this.notificationRepository.markNotificationRead(
      currentUser.id,
      notificationId,
      new Date()
    );

    return toNotificationResponse(notification);
  }
}
