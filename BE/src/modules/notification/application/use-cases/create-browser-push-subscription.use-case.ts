import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import { toBrowserPushSubscriptionResponse } from "@/modules/notification/application/notification-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from "./notification-input";

export interface CreateBrowserPushSubscriptionCommand {
  readonly endpoint: string;
  readonly keys: {
    readonly p256dh: string;
    readonly auth: string;
  };
  readonly userAgent?: string | null;
  readonly deviceLabel?: string | null;
}

@Injectable()
export class CreateBrowserPushSubscriptionUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    command: CreateBrowserPushSubscriptionCommand
  ) {
    const subscription =
      await this.notificationRepository.createBrowserPushSubscription({
        userId: currentUser.id,
        endpoint: normalizeRequiredText(command.endpoint, "endpoint"),
        p256dh: normalizeRequiredText(command.keys.p256dh, "keys.p256dh"),
        auth: normalizeRequiredText(command.keys.auth, "keys.auth"),
        userAgent: normalizeOptionalText(command.userAgent),
        deviceLabel: normalizeOptionalText(command.deviceLabel),
      });

    return toBrowserPushSubscriptionResponse(subscription);
  }
}
