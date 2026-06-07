import type {
  BrowserPushSubscriptionRecord,
  NotificationListResult,
  NotificationRecord,
  UserNotificationSettingRecord,
} from "@/modules/notification/application/ports/notification.repository";

export interface NotificationResponse {
  readonly id: string;
  readonly type: string;
  readonly channel: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly content: string | null;
  readonly scheduledAt: string;
  readonly sentAt: string | null;
  readonly readAt: string | null;
  readonly status: string;
  readonly metadata: unknown;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NotificationListResponse {
  readonly items: NotificationResponse[];
  readonly unreadCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface UserNotificationSettingResponse {
  readonly defaultReminderMinutes: number;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
}

export interface BrowserPushPublicKeyResponse {
  readonly publicKey: string;
}

export interface BrowserPushSubscriptionResponse {
  readonly id: string;
  readonly status: string;
  readonly deviceLabel: string | null;
  readonly createdAt: string;
  readonly revokedAt: string | null;
}

export interface SendPendingNotificationsResponse {
  readonly sentCount: number;
  readonly canceledCount: number;
  readonly failedCount: number;
}

export function toNotificationResponse(
  notification: NotificationRecord
): NotificationResponse {
  return {
    id: notification.id,
    type: notification.type,
    channel: notification.channel,
    targetType: notification.targetType,
    targetId: notification.targetId,
    title: notification.title,
    content: notification.content,
    scheduledAt: notification.scheduledAt.toISOString(),
    sentAt: toIsoOrNull(notification.sentAt),
    readAt: toIsoOrNull(notification.readAt),
    status: notification.status,
    metadata: notification.metadata,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  };
}

export function toNotificationListResponse(
  result: NotificationListResult
): NotificationListResponse {
  return {
    items: result.items.map(toNotificationResponse),
    unreadCount: result.unreadCount,
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    hasNext: result.hasNext,
  };
}

export function toUserNotificationSettingResponse(
  setting: UserNotificationSettingRecord
): UserNotificationSettingResponse {
  return {
    defaultReminderMinutes: setting.defaultReminderMinutes,
    emailNotificationEnabled: setting.emailNotificationEnabled,
    browserPushEnabled: setting.browserPushEnabled,
  };
}

export function toBrowserPushSubscriptionResponse(
  subscription: BrowserPushSubscriptionRecord
): BrowserPushSubscriptionResponse {
  return {
    id: subscription.id,
    status: subscription.status,
    deviceLabel: subscription.deviceLabel,
    createdAt: subscription.createdAt.toISOString(),
    revokedAt: toIsoOrNull(subscription.revokedAt),
  };
}

function toIsoOrNull(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
