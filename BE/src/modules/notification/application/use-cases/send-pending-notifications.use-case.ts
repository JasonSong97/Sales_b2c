import { Inject, Injectable } from "@nestjs/common";
import {
  BROWSER_PUSH_PORT,
  type BrowserPushPort,
} from "@/modules/notification/application/ports/browser-push.port";
import {
  EMAIL_DELIVERY_PORT,
  type EmailDeliveryPort,
} from "@/modules/notification/application/ports/email-delivery.port";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
  type PendingNotificationDeliveryRecord,
} from "@/modules/notification/application/ports/notification.repository";
import type { SendPendingNotificationsResponse } from "@/modules/notification/application/notification-response";

const MAX_DELIVERY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000;

@Injectable()
export class SendPendingNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_DELIVERY_PORT)
    private readonly emailDeliveryPort: EmailDeliveryPort,
    @Inject(BROWSER_PUSH_PORT)
    private readonly browserPushPort: BrowserPushPort
  ) {}

  async execute(input: {
    readonly now?: Date;
    readonly limit?: number;
  } = {}): Promise<SendPendingNotificationsResponse> {
    const now = input.now ?? new Date();
    const notifications =
      await this.notificationRepository.listPendingNotificationsDue({
        now,
        limit: input.limit ?? 100,
      });
    let sentCount = 0;
    let canceledCount = 0;
    let failedCount = 0;

    for (const notification of notifications) {
      const result = await this.sendOne(notification, now);

      if (result === "sent") {
        sentCount += 1;
      } else if (result === "canceled") {
        canceledCount += 1;
      } else {
        failedCount += 1;
      }
    }

    return { sentCount, canceledCount, failedCount };
  }

  private async sendOne(
    notification: PendingNotificationDeliveryRecord,
    now: Date
  ): Promise<"sent" | "canceled" | "failed"> {
    try {
      if (notification.channel === "EMAIL") {
        return await this.sendEmailNotification(notification, now);
      }

      return await this.sendBrowserPushNotification(notification, now);
    } catch (error) {
      await this.recordDeliveryFailure(notification, now, getErrorSummary(error));
      return "failed";
    }
  }

  private async recordDeliveryFailure(
    notification: PendingNotificationDeliveryRecord,
    now: Date,
    reason: string
  ) {
    const attemptCount = getRetryAttemptCount(notification.metadata) + 1;

    if (attemptCount >= MAX_DELIVERY_ATTEMPTS) {
      await this.notificationRepository.markNotificationFailed(
        notification.id,
        now,
        reason
      );
      return;
    }

    await this.notificationRepository.markNotificationRetry(
      notification.id,
      now,
      reason,
      attemptCount,
      new Date(now.getTime() + RETRY_DELAY_MS)
    );
  }

  private async sendEmailNotification(
    notification: PendingNotificationDeliveryRecord,
    now: Date
  ): Promise<"sent" | "canceled" | "failed"> {
    if (!notification.setting.emailNotificationEnabled) {
      await this.notificationRepository.markNotificationCanceled(
        notification.id,
        now,
        "email notification disabled"
      );
      return "canceled";
    }

    if (!notification.userEmail) {
      await this.notificationRepository.markNotificationCanceled(
        notification.id,
        now,
        "user email missing"
      );
      return "canceled";
    }

    await this.emailDeliveryPort.sendNotification({
      to: notification.userEmail,
      subject: notification.title,
      text: notification.content ?? notification.title,
      targetPath: getTargetPath(notification),
    });
    await this.notificationRepository.markNotificationSent(notification.id, now);

    return "sent";
  }

  private async sendBrowserPushNotification(
    notification: PendingNotificationDeliveryRecord,
    now: Date
  ): Promise<"sent" | "canceled" | "failed"> {
    if (!notification.setting.browserPushEnabled) {
      await this.notificationRepository.markNotificationCanceled(
        notification.id,
        now,
        "browser push disabled"
      );
      return "canceled";
    }

    if (notification.activeBrowserSubscriptions.length === 0) {
      await this.notificationRepository.markNotificationCanceled(
        notification.id,
        now,
        "active browser push subscription missing"
      );
      return "canceled";
    }

    for (const subscription of notification.activeBrowserSubscriptions) {
      await this.browserPushPort.sendNotification({
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        title: notification.title,
        body: notification.content ?? notification.title,
        targetPath: getTargetPath(notification),
      });
    }

    await this.notificationRepository.markNotificationSent(notification.id, now);

    return "sent";
  }
}

function getTargetPath(notification: PendingNotificationDeliveryRecord) {
  if (!notification.targetType || !notification.targetId) {
    return null;
  }

  switch (notification.targetType) {
    case "SCHEDULE":
      return `/schedules`;
    case "DEAL":
      return `/deals/${notification.targetId}`;
    case "MEETING_NOTE":
      return `/meeting-notes/${notification.targetId}`;
    default:
      return null;
  }
}

function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "notification delivery failed";
}

function getRetryAttemptCount(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return 0;
  }

  const value = (metadata as { readonly retryAttemptCount?: unknown })
    .retryAttemptCount;

  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : 0;
}
