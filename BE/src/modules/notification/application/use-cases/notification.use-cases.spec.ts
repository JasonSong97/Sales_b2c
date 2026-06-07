import type {
  BrowserPushPort,
  SendBrowserPushNotificationInput,
} from "@/modules/notification/application/ports/browser-push.port";
import type {
  EmailDeliveryPort,
  SendEmailNotificationInput,
} from "@/modules/notification/application/ports/email-delivery.port";
import type {
  BrowserPushSubscriptionRecord,
  CreateBrowserPushSubscriptionInput,
  CreateNotificationInput,
  ListNotificationsInput,
  NotificationListResult,
  NotificationRecord,
  NotificationRepository,
  PendingNotificationDeliveryRecord,
  UpdateNotificationSettingInput,
  UserNotificationSettingRecord,
} from "@/modules/notification/application/ports/notification.repository";
import { NotificationScheduler } from "./notification-scheduler.service";
import { SendPendingNotificationsUseCase } from "./send-pending-notifications.use-case";

class FakeNotificationRepository implements NotificationRepository {
  readonly createdNotifications: CreateNotificationInput[][] = [];
  replaceInput: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: CreateNotificationInput["type"];
    readonly notifications: readonly CreateNotificationInput[];
  } | null = null;
  cancelInput: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: CreateNotificationInput["type"];
  } | null = null;
  pendingNotifications: PendingNotificationDeliveryRecord[] = [];
  sentIds: string[] = [];
  canceledIds: string[] = [];
  retryInputs: Array<{
    readonly notificationId: string;
    readonly attemptCount: number;
    readonly nextAttemptAt: Date;
  }> = [];
  failedIds: string[] = [];

  async listNotifications(
    input: ListNotificationsInput
  ): Promise<NotificationListResult> {
    return {
      items: [],
      unreadCount: 0,
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async markNotificationRead(
    userId: string,
    notificationId: string,
    readAt: Date
  ): Promise<NotificationRecord> {
    return createNotificationRecord({
      id: notificationId,
      userId,
      status: "READ",
      readAt,
    });
  }

  async getOrCreateSetting(): Promise<UserNotificationSettingRecord> {
    return defaultSetting();
  }

  async updateSetting(
    _userId: string,
    input: UpdateNotificationSettingInput
  ): Promise<UserNotificationSettingRecord> {
    return { ...defaultSetting(), ...input };
  }

  async createNotifications(
    input: readonly CreateNotificationInput[]
  ): Promise<NotificationRecord[]> {
    this.createdNotifications.push([...input]);

    return input.map((notification, index) =>
      createNotificationRecord({
        id: `notification-${index + 1}`,
        userId: notification.userId,
        type: notification.type,
        channel: notification.channel,
        targetType: notification.targetType,
        targetId: notification.targetId,
        title: notification.title,
        content: notification.content,
        scheduledAt: notification.scheduledAt,
      })
    );
  }

  async replacePendingNotificationsForTarget(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: CreateNotificationInput["type"];
    readonly notifications: readonly CreateNotificationInput[];
  }): Promise<NotificationRecord[]> {
    this.replaceInput = input;

    return input.notifications.map((notification, index) =>
      createNotificationRecord({
        id: `replacement-${index + 1}`,
        userId: notification.userId,
        type: notification.type,
        channel: notification.channel,
      })
    );
  }

  async cancelPendingNotificationsForTarget(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: CreateNotificationInput["type"];
  }): Promise<void> {
    this.cancelInput = input;
  }

  async createBrowserPushSubscription(
    input: CreateBrowserPushSubscriptionInput
  ): Promise<BrowserPushSubscriptionRecord> {
    return {
      id: input.endpoint,
      status: "ACTIVE",
      deviceLabel: input.deviceLabel,
      createdAt: new Date("2026-06-07T00:00:00.000Z"),
      revokedAt: null,
    };
  }

  async revokeBrowserPushSubscription(
    _userId: string,
    subscriptionId: string,
    revokedAt: Date
  ): Promise<BrowserPushSubscriptionRecord> {
    return {
      id: subscriptionId,
      status: "REVOKED",
      deviceLabel: null,
      createdAt: new Date("2026-06-07T00:00:00.000Z"),
      revokedAt,
    };
  }

  async listPendingNotificationsDue(): Promise<
    PendingNotificationDeliveryRecord[]
  > {
    return this.pendingNotifications;
  }

  async markNotificationSent(
    notificationId: string,
    sentAt: Date
  ): Promise<NotificationRecord> {
    this.sentIds.push(notificationId);

    return createNotificationRecord({
      id: notificationId,
      status: "SENT",
      sentAt,
    });
  }

  async markNotificationCanceled(
    notificationId: string,
    canceledAt: Date
  ): Promise<NotificationRecord> {
    this.canceledIds.push(notificationId);

    return createNotificationRecord({
      id: notificationId,
      status: "CANCELED",
      updatedAt: canceledAt,
    });
  }

  async markNotificationRetry(
    notificationId: string,
    _attemptedAt: Date,
    _reason: string,
    attemptCount: number,
    nextAttemptAt: Date
  ): Promise<NotificationRecord> {
    this.retryInputs.push({ notificationId, attemptCount, nextAttemptAt });

    return createNotificationRecord({
      id: notificationId,
      status: "PENDING",
      scheduledAt: nextAttemptAt,
      metadata: { retryAttemptCount: attemptCount },
    });
  }

  async markNotificationFailed(
    notificationId: string,
    failedAt: Date
  ): Promise<NotificationRecord> {
    this.failedIds.push(notificationId);

    return createNotificationRecord({
      id: notificationId,
      status: "FAILED",
      updatedAt: failedAt,
    });
  }
}

class FakeEmailDeliveryPort implements EmailDeliveryPort {
  readonly sent: SendEmailNotificationInput[] = [];

  async sendNotification(input: SendEmailNotificationInput): Promise<void> {
    this.sent.push(input);
  }
}

class FakeBrowserPushPort implements BrowserPushPort {
  readonly sent: SendBrowserPushNotificationInput[] = [];
  error: Error | null = null;

  async sendNotification(
    input: SendBrowserPushNotificationInput
  ): Promise<void> {
    if (this.error) {
      throw this.error;
    }

    this.sent.push(input);
  }
}

describe("Notification use cases", () => {
  it("creates one notification per delivery channel for next actions", async () => {
    const repository = new FakeNotificationRepository();
    const scheduler = new NotificationScheduler(repository);

    await scheduler.replaceNextActionNotification({
      userId: "user-1",
      dealId: "deal-1",
      dealTitle: "도입 딜",
      nextActionText: "제안서 전달",
      nextActionDueAt: new Date("2026-06-07T00:00:00.000Z"),
      nextActionStatus: "SCHEDULED",
    });

    expect(repository.replaceInput).toMatchObject({
      userId: "user-1",
      targetType: "DEAL",
      targetId: "deal-1",
      type: "NEXT_ACTION_REMINDER",
    });
    expect(repository.replaceInput?.notifications).toHaveLength(2);
    expect(repository.replaceInput?.notifications.map((item) => item.channel)).toEqual(
      ["EMAIL", "BROWSER_PUSH"]
    );
  });

  it("cancels next action notifications when the action is done", async () => {
    const repository = new FakeNotificationRepository();
    const scheduler = new NotificationScheduler(repository);

    await scheduler.replaceNextActionNotification({
      userId: "user-1",
      dealId: "deal-1",
      dealTitle: "도입 딜",
      nextActionText: "제안서 전달",
      nextActionDueAt: new Date("2026-06-07T00:00:00.000Z"),
      nextActionStatus: "DONE",
    });

    expect(repository.cancelInput).toEqual({
      userId: "user-1",
      targetType: "DEAL",
      targetId: "deal-1",
      type: "NEXT_ACTION_REMINDER",
    });
  });

  it("sends pending email and push notifications through delivery ports", async () => {
    const repository = new FakeNotificationRepository();
    const emailPort = new FakeEmailDeliveryPort();
    const browserPushPort = new FakeBrowserPushPort();
    repository.pendingNotifications = [
      createPendingNotification({
        id: "email-1",
        channel: "EMAIL",
        userEmail: "user@example.com",
      }),
      createPendingNotification({
        id: "push-1",
        channel: "BROWSER_PUSH",
        activeBrowserSubscriptions: [
          {
            id: "subscription-1",
            endpoint: "https://push.example/1",
            p256dh: "p256dh",
            auth: "auth",
          },
        ],
      }),
      createPendingNotification({
        id: "email-disabled",
        channel: "EMAIL",
        setting: {
          ...defaultSetting(),
          emailNotificationEnabled: false,
        },
      }),
    ];
    const useCase = new SendPendingNotificationsUseCase(
      repository,
      emailPort,
      browserPushPort
    );

    const result = await useCase.execute({
      now: new Date("2026-06-07T00:00:00.000Z"),
    });

    expect(result).toEqual({ sentCount: 2, canceledCount: 1, failedCount: 0 });
    expect(emailPort.sent).toHaveLength(1);
    expect(browserPushPort.sent).toHaveLength(1);
    expect(repository.sentIds).toEqual(["email-1", "push-1"]);
    expect(repository.canceledIds).toEqual(["email-disabled"]);
  });

  it("keeps provider failures pending until retry attempts are exhausted", async () => {
    const repository = new FakeNotificationRepository();
    const emailPort = new FakeEmailDeliveryPort();
    const browserPushPort = new FakeBrowserPushPort();
    browserPushPort.error = new Error("push timeout");
    repository.pendingNotifications = [
      createPendingNotification({
        id: "push-retry",
        channel: "BROWSER_PUSH",
        activeBrowserSubscriptions: [
          {
            id: "subscription-1",
            endpoint: "https://push.example/1",
            p256dh: "p256dh",
            auth: "auth",
          },
        ],
      }),
      createPendingNotification({
        id: "push-failed",
        channel: "BROWSER_PUSH",
        metadata: { retryAttemptCount: 2 },
        activeBrowserSubscriptions: [
          {
            id: "subscription-2",
            endpoint: "https://push.example/2",
            p256dh: "p256dh",
            auth: "auth",
          },
        ],
      }),
    ];
    const useCase = new SendPendingNotificationsUseCase(
      repository,
      emailPort,
      browserPushPort
    );

    const result = await useCase.execute({
      now: new Date("2026-06-07T00:00:00.000Z"),
    });

    expect(result).toEqual({ sentCount: 0, canceledCount: 0, failedCount: 2 });
    expect(repository.retryInputs).toHaveLength(1);
    expect(repository.retryInputs[0]).toMatchObject({
      notificationId: "push-retry",
      attemptCount: 1,
    });
    expect(repository.failedIds).toEqual(["push-failed"]);
  });
});

function createPendingNotification(
  overrides: Partial<PendingNotificationDeliveryRecord> = {}
): PendingNotificationDeliveryRecord {
  return {
    ...createNotificationRecord(overrides),
    userEmail: overrides.userEmail ?? "user@example.com",
    setting: overrides.setting ?? defaultSetting(),
    activeBrowserSubscriptions: overrides.activeBrowserSubscriptions ?? [],
  };
}

function createNotificationRecord(
  overrides: Partial<NotificationRecord> = {}
): NotificationRecord {
  const now = new Date("2026-06-07T00:00:00.000Z");

  return {
    id: overrides.id ?? "notification-1",
    userId: overrides.userId ?? "user-1",
    type: overrides.type ?? "NEXT_ACTION_REMINDER",
    channel: overrides.channel ?? "EMAIL",
    targetType: overrides.targetType ?? "DEAL",
    targetId: overrides.targetId ?? "deal-1",
    title: overrides.title ?? "알림",
    content: overrides.content ?? "내용",
    scheduledAt: overrides.scheduledAt ?? now,
    sentAt: overrides.sentAt ?? null,
    readAt: overrides.readAt ?? null,
    status: overrides.status ?? "PENDING",
    metadata: overrides.metadata ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

function defaultSetting(): UserNotificationSettingRecord {
  return {
    defaultReminderMinutes: 30,
    emailNotificationEnabled: true,
    browserPushEnabled: true,
  };
}
