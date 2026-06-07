import { createHash } from "node:crypto";
import {
  BrowserPushSubscriptionStatus as PrismaBrowserPushSubscriptionStatus,
  NotificationStatus as PrismaNotificationStatus,
  Prisma,
} from "@prisma/client";
import {
  type BrowserPushSubscriptionDeliveryRecord,
  type BrowserPushSubscriptionRecord,
  type CreateBrowserPushSubscriptionInput,
  type CreateNotificationInput,
  type ListNotificationsInput,
  type NotificationListResult,
  type NotificationRecord,
  type NotificationRepository,
  type PendingNotificationDeliveryRecord,
  type UpdateNotificationSettingInput,
  type UserNotificationSettingRecord,
} from "@/modules/notification/application/ports/notification.repository";
import {
  NotificationNotFoundError,
  PushSubscriptionConflictError,
  PushSubscriptionNotFoundError,
} from "@/modules/notification/domain/notification.errors";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type NotificationRow = {
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  readonly channel: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly content: string | null;
  readonly scheduledAt: Date;
  readonly sentAt: Date | null;
  readonly readAt: Date | null;
  readonly status: string;
  readonly metadata: Prisma.JsonValue | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type UserSettingRow = {
  readonly defaultScheduleReminderMinutes: number;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
};

type BrowserPushSubscriptionRow = {
  readonly id: string;
  readonly status: string;
  readonly deviceLabel: string | null;
  readonly createdAt: Date;
  readonly revokedAt: Date | null;
};

type PendingNotificationRow = NotificationRow & {
  readonly user: {
    readonly email: string | null;
    readonly setting: UserSettingRow | null;
    readonly browserPushSubscriptions: Array<{
      readonly id: string;
      readonly endpointCiphertext: string;
      readonly p256dhCiphertext: string;
      readonly authCiphertext: string;
      readonly contentKeyVersion: string;
    }>;
  };
};

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionPort: EncryptionPort
  ) {}

  async listNotifications(
    input: ListNotificationsInput
  ): Promise<NotificationListResult> {
    const where = this.createNotificationWhere(input);
    const [items, totalCount, unreadCount] = await Promise.all([
      this.prismaService.notification.findMany({
        where,
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prismaService.notification.count({ where }),
      this.prismaService.notification.count({
        where: { userId: input.userId, readAt: null },
      }),
    ]);

    return {
      items: items.map((item) => this.mapNotification(item)),
      unreadCount,
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
      hasNext: input.page * input.pageSize < totalCount,
    };
  }

  async markNotificationRead(
    userId: string,
    notificationId: string,
    readAt: Date
  ): Promise<NotificationRecord> {
    const existing = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new NotificationNotFoundError();
    }

    if (existing.readAt && existing.status === PrismaNotificationStatus.READ) {
      return this.mapNotification(existing);
    }

    const notification = await this.prismaService.notification.update({
      where: { id: existing.id },
      data: {
        readAt,
        status: PrismaNotificationStatus.READ,
      },
    });

    return this.mapNotification(notification);
  }

  async getOrCreateSetting(
    userId: string
  ): Promise<UserNotificationSettingRecord> {
    const setting = await this.prismaService.userSetting.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return this.mapSetting(setting);
  }

  async updateSetting(
    userId: string,
    input: UpdateNotificationSettingInput
  ): Promise<UserNotificationSettingRecord> {
    const data = this.mapSettingUpdate(input);
    const setting = await this.prismaService.userSetting.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return this.mapSetting(setting);
  }

  async createNotifications(
    input: readonly CreateNotificationInput[]
  ): Promise<NotificationRecord[]> {
    return this.prismaService.$transaction(async (transaction) => {
      const notifications = [];

      for (const notification of input) {
        notifications.push(
          await transaction.notification.create({
            data: this.mapCreateNotificationData(notification),
          })
        );
      }

      return notifications.map((notification) =>
        this.mapNotification(notification)
      );
    });
  }

  async replacePendingNotificationsForTarget(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: CreateNotificationInput["type"];
    readonly notifications: readonly CreateNotificationInput[];
  }): Promise<NotificationRecord[]> {
    return this.prismaService.$transaction(async (transaction) => {
      await transaction.notification.updateMany({
        where: {
          userId: input.userId,
          targetType: input.targetType,
          targetId: input.targetId,
          type: input.type,
          status: PrismaNotificationStatus.PENDING,
        },
        data: {
          status: PrismaNotificationStatus.CANCELED,
          metadata: { canceledReason: "replaced by newer notification" },
        },
      });

      const notifications = [];

      for (const notification of input.notifications) {
        notifications.push(
          await transaction.notification.create({
            data: this.mapCreateNotificationData(notification),
          })
        );
      }

      return notifications.map((notification) =>
        this.mapNotification(notification)
      );
    });
  }

  async cancelPendingNotificationsForTarget(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: CreateNotificationInput["type"];
  }): Promise<void> {
    await this.prismaService.notification.updateMany({
      where: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
        type: input.type,
        status: PrismaNotificationStatus.PENDING,
      },
      data: {
        status: PrismaNotificationStatus.CANCELED,
        metadata: { canceledReason: "notification canceled" },
      },
    });
  }

  async createBrowserPushSubscription(
    input: CreateBrowserPushSubscriptionInput
  ): Promise<BrowserPushSubscriptionRecord> {
    const endpointHash = hashValue(input.endpoint);
    const existing =
      await this.prismaService.browserPushSubscription.findUnique({
        where: { endpointHash },
      });

    if (existing && existing.userId !== input.userId) {
      throw new PushSubscriptionConflictError();
    }

    const encrypted = await this.encryptBrowserPushSubscription(input);

    if (existing) {
      const subscription =
        await this.prismaService.browserPushSubscription.update({
          where: { id: existing.id },
          data: {
            endpointCiphertext: encrypted.endpoint.ciphertext,
            p256dhCiphertext: encrypted.p256dh.ciphertext,
            authCiphertext: encrypted.auth.ciphertext,
            contentKeyVersion: encrypted.endpoint.keyVersion,
            status: PrismaBrowserPushSubscriptionStatus.ACTIVE,
            userAgent: input.userAgent,
            deviceLabel: input.deviceLabel,
            revokedAt: null,
          },
        });

      return this.mapBrowserPushSubscription(subscription);
    }

    const subscription = await this.prismaService.browserPushSubscription.create({
      data: {
        userId: input.userId,
        endpointHash,
        endpointCiphertext: encrypted.endpoint.ciphertext,
        p256dhCiphertext: encrypted.p256dh.ciphertext,
        authCiphertext: encrypted.auth.ciphertext,
        contentKeyVersion: encrypted.endpoint.keyVersion,
        userAgent: input.userAgent,
        deviceLabel: input.deviceLabel,
      },
    });

    return this.mapBrowserPushSubscription(subscription);
  }

  async revokeBrowserPushSubscription(
    userId: string,
    subscriptionId: string,
    revokedAt: Date
  ): Promise<BrowserPushSubscriptionRecord> {
    const existing = await this.prismaService.browserPushSubscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!existing) {
      throw new PushSubscriptionNotFoundError();
    }

    const subscription = await this.prismaService.browserPushSubscription.update({
      where: { id: existing.id },
      data: {
        status: PrismaBrowserPushSubscriptionStatus.REVOKED,
        revokedAt,
      },
    });

    return this.mapBrowserPushSubscription(subscription);
  }

  async listPendingNotificationsDue(input: {
    readonly now: Date;
    readonly limit: number;
  }): Promise<PendingNotificationDeliveryRecord[]> {
    const notifications = await this.prismaService.notification.findMany({
      where: {
        status: PrismaNotificationStatus.PENDING,
        scheduledAt: { lte: input.now },
      },
      include: {
        user: {
          select: {
            email: true,
            setting: true,
            browserPushSubscriptions: {
              where: { status: PrismaBrowserPushSubscriptionStatus.ACTIVE },
              select: {
                id: true,
                endpointCiphertext: true,
                p256dhCiphertext: true,
                authCiphertext: true,
                contentKeyVersion: true,
              },
            },
          },
        },
      },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
      take: input.limit,
    });

    return Promise.all(
      notifications.map((notification) =>
        this.mapPendingNotification(notification as PendingNotificationRow)
      )
    );
  }

  async markNotificationSent(
    notificationId: string,
    sentAt: Date
  ): Promise<NotificationRecord> {
    const notification = await this.prismaService.notification.update({
      where: { id: notificationId },
      data: {
        status: PrismaNotificationStatus.SENT,
        sentAt,
      },
    });

    return this.mapNotification(notification);
  }

  async markNotificationCanceled(
    notificationId: string,
    canceledAt: Date,
    reason: string
  ): Promise<NotificationRecord> {
    const notification = await this.prismaService.notification.update({
      where: { id: notificationId },
      data: {
        status: PrismaNotificationStatus.CANCELED,
        metadata: {
          canceledAt: canceledAt.toISOString(),
          canceledReason: reason,
        },
      },
    });

    return this.mapNotification(notification);
  }

  async markNotificationRetry(
    notificationId: string,
    attemptedAt: Date,
    reason: string,
    attemptCount: number,
    nextAttemptAt: Date
  ): Promise<NotificationRecord> {
    const notification = await this.prismaService.notification.update({
      where: { id: notificationId },
      data: {
        status: PrismaNotificationStatus.PENDING,
        scheduledAt: nextAttemptAt,
        metadata: {
          retryAttemptCount: attemptCount,
          lastDeliveryAttemptAt: attemptedAt.toISOString(),
          lastDeliveryError: reason,
        },
      },
    });

    return this.mapNotification(notification);
  }

  async markNotificationFailed(
    notificationId: string,
    failedAt: Date,
    reason: string
  ): Promise<NotificationRecord> {
    const notification = await this.prismaService.notification.update({
      where: { id: notificationId },
      data: {
        status: PrismaNotificationStatus.FAILED,
        metadata: {
          failedAt: failedAt.toISOString(),
          failedReason: reason,
        },
      },
    });

    return this.mapNotification(notification);
  }

  private createNotificationWhere(
    input: ListNotificationsInput
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = { userId: input.userId };

    if (input.status === "READ") {
      where.readAt = { not: null };
    }

    if (input.status === "UNREAD") {
      where.readAt = null;
    }

    return where;
  }

  private mapCreateNotificationData(
    input: CreateNotificationInput
  ): Prisma.NotificationCreateInput {
    return {
      user: { connect: { id: input.userId } },
      type: input.type,
      channel: input.channel,
      targetType: input.targetType,
      targetId: input.targetId,
      title: input.title,
      content: input.content,
      scheduledAt: input.scheduledAt,
      metadata: input.metadata as Prisma.InputJsonValue,
    };
  }

  private mapNotification(row: NotificationRow): NotificationRecord {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as NotificationRecord["type"],
      channel: row.channel as NotificationRecord["channel"],
      targetType: row.targetType,
      targetId: row.targetId,
      title: row.title,
      content: row.content,
      scheduledAt: row.scheduledAt,
      sentAt: row.sentAt,
      readAt: row.readAt,
      status: row.status as NotificationRecord["status"],
      metadata: row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapSetting(setting: UserSettingRow): UserNotificationSettingRecord {
    return {
      defaultReminderMinutes: setting.defaultScheduleReminderMinutes,
      emailNotificationEnabled: setting.emailNotificationEnabled,
      browserPushEnabled: setting.browserPushEnabled,
    };
  }

  private mapSettingUpdate(
    input: UpdateNotificationSettingInput
  ): {
    defaultScheduleReminderMinutes?: number;
    emailNotificationEnabled?: boolean;
    browserPushEnabled?: boolean;
  } {
    const data: {
      defaultScheduleReminderMinutes?: number;
      emailNotificationEnabled?: boolean;
      browserPushEnabled?: boolean;
    } = {};

    if (input.defaultReminderMinutes !== undefined) {
      data.defaultScheduleReminderMinutes = input.defaultReminderMinutes;
    }

    if (input.emailNotificationEnabled !== undefined) {
      data.emailNotificationEnabled = input.emailNotificationEnabled;
    }

    if (input.browserPushEnabled !== undefined) {
      data.browserPushEnabled = input.browserPushEnabled;
    }

    return data;
  }

  private mapBrowserPushSubscription(
    row: BrowserPushSubscriptionRow
  ): BrowserPushSubscriptionRecord {
    return {
      id: row.id,
      status: row.status as BrowserPushSubscriptionRecord["status"],
      deviceLabel: row.deviceLabel,
      createdAt: row.createdAt,
      revokedAt: row.revokedAt,
    };
  }

  private async mapPendingNotification(
    row: PendingNotificationRow
  ): Promise<PendingNotificationDeliveryRecord> {
    return {
      ...this.mapNotification(row),
      userEmail: row.user.email,
      setting: this.mapSetting(row.user.setting ?? defaultSetting()),
      activeBrowserSubscriptions: await Promise.all(
        row.user.browserPushSubscriptions.map((subscription) =>
          this.decryptBrowserPushSubscription(subscription)
        )
      ),
    };
  }

  private async encryptBrowserPushSubscription(
    input: CreateBrowserPushSubscriptionInput
  ) {
    const [endpoint, p256dh, auth] = await Promise.all([
      this.encryptionPort.encryptText(input.endpoint),
      this.encryptionPort.encryptText(input.p256dh),
      this.encryptionPort.encryptText(input.auth),
    ]);

    return { endpoint, p256dh, auth };
  }

  private async decryptBrowserPushSubscription(input: {
    readonly id: string;
    readonly endpointCiphertext: string;
    readonly p256dhCiphertext: string;
    readonly authCiphertext: string;
    readonly contentKeyVersion: string;
  }): Promise<BrowserPushSubscriptionDeliveryRecord> {
    const [endpoint, p256dh, auth] = await Promise.all([
      this.encryptionPort.decryptText({
        ciphertext: input.endpointCiphertext,
        keyVersion: input.contentKeyVersion,
      }),
      this.encryptionPort.decryptText({
        ciphertext: input.p256dhCiphertext,
        keyVersion: input.contentKeyVersion,
      }),
      this.encryptionPort.decryptText({
        ciphertext: input.authCiphertext,
        keyVersion: input.contentKeyVersion,
      }),
    ]);

    return {
      id: input.id,
      endpoint,
      p256dh,
      auth,
    };
  }
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function defaultSetting(): UserSettingRow {
  return {
    defaultScheduleReminderMinutes: 30,
    emailNotificationEnabled: true,
    browserPushEnabled: true,
  };
}
