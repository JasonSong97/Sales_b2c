import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import { toBrowserPushSubscriptionResponse } from "@/modules/notification/application/notification-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class RevokeBrowserPushSubscriptionUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(currentUser: CurrentUserContext, subscriptionId: string) {
    const subscription =
      await this.notificationRepository.revokeBrowserPushSubscription(
        currentUser.id,
        subscriptionId,
        new Date()
      );

    return toBrowserPushSubscriptionResponse(subscription);
  }
}
