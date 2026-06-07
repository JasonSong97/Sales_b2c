export const NOTIFICATION_REPOSITORY = Symbol("NOTIFICATION_REPOSITORY");

export type NotificationType =
  | "SCHEDULE_REMINDER"
  | "DEAL_DUE_REMINDER"
  | "NEXT_ACTION_REMINDER"
  | "MEETING_NOTE_GENERATED"
  | "TRASH_PERMANENT_DELETE_WARNING";

export type NotificationChannel = "EMAIL" | "BROWSER_PUSH";

export type NotificationStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "READ"
  | "CANCELED";

export type NotificationReadFilter = "ALL" | "READ" | "UNREAD";

export type BrowserPushSubscriptionStatus = "ACTIVE" | "REVOKED";

export interface NotificationRecord {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly content: string | null;
  readonly scheduledAt: Date;
  readonly sentAt: Date | null;
  readonly readAt: Date | null;
  readonly status: NotificationStatus;
  readonly metadata: unknown;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface NotificationListResult {
  readonly items: NotificationRecord[];
  readonly unreadCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
}

export interface ListNotificationsInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly status: NotificationReadFilter;
}

export interface CreateNotificationInput {
  readonly userId: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly content: string | null;
  readonly scheduledAt: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface UserNotificationSettingRecord {
  readonly defaultReminderMinutes: number;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
}

export interface UpdateNotificationSettingInput {
  readonly defaultReminderMinutes?: number;
  readonly emailNotificationEnabled?: boolean;
  readonly browserPushEnabled?: boolean;
}

export interface BrowserPushSubscriptionRecord {
  readonly id: string;
  readonly status: BrowserPushSubscriptionStatus;
  readonly deviceLabel: string | null;
  readonly createdAt: Date;
  readonly revokedAt: Date | null;
}

export interface CreateBrowserPushSubscriptionInput {
  readonly userId: string;
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
  readonly userAgent: string | null;
  readonly deviceLabel: string | null;
}

export interface PendingNotificationDeliveryRecord extends NotificationRecord {
  readonly userEmail: string | null;
  readonly setting: UserNotificationSettingRecord;
  readonly activeBrowserSubscriptions: BrowserPushSubscriptionDeliveryRecord[];
}

export interface BrowserPushSubscriptionDeliveryRecord {
  readonly id: string;
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
}

export interface NotificationRepository {
  listNotifications(
    input: ListNotificationsInput
  ): Promise<NotificationListResult>;
  markNotificationRead(
    userId: string,
    notificationId: string,
    readAt: Date
  ): Promise<NotificationRecord>;
  getOrCreateSetting(userId: string): Promise<UserNotificationSettingRecord>;
  updateSetting(
    userId: string,
    input: UpdateNotificationSettingInput
  ): Promise<UserNotificationSettingRecord>;
  createNotifications(
    input: readonly CreateNotificationInput[]
  ): Promise<NotificationRecord[]>;
  replacePendingNotificationsForTarget(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: NotificationType;
    readonly notifications: readonly CreateNotificationInput[];
  }): Promise<NotificationRecord[]>;
  cancelPendingNotificationsForTarget(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: NotificationType;
  }): Promise<void>;
  createBrowserPushSubscription(
    input: CreateBrowserPushSubscriptionInput
  ): Promise<BrowserPushSubscriptionRecord>;
  revokeBrowserPushSubscription(
    userId: string,
    subscriptionId: string,
    revokedAt: Date
  ): Promise<BrowserPushSubscriptionRecord>;
  listPendingNotificationsDue(input: {
    readonly now: Date;
    readonly limit: number;
  }): Promise<PendingNotificationDeliveryRecord[]>;
  markNotificationSent(
    notificationId: string,
    sentAt: Date
  ): Promise<NotificationRecord>;
  markNotificationCanceled(
    notificationId: string,
    canceledAt: Date,
    reason: string
  ): Promise<NotificationRecord>;
  markNotificationRetry(
    notificationId: string,
    attemptedAt: Date,
    reason: string,
    attemptCount: number,
    nextAttemptAt: Date
  ): Promise<NotificationRecord>;
  markNotificationFailed(
    notificationId: string,
    failedAt: Date,
    reason: string
  ): Promise<NotificationRecord>;
}
