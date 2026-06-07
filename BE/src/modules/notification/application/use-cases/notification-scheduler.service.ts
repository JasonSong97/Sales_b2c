import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type CreateNotificationInput,
  type NotificationRepository,
  type NotificationType,
} from "@/modules/notification/application/ports/notification.repository";

const DELIVERY_CHANNELS = ["EMAIL", "BROWSER_PUSH"] as const;

@Injectable()
export class NotificationScheduler {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async replaceScheduleReminderNotifications(input: {
    readonly userId: string;
    readonly scheduleId: string;
    readonly scheduleTitle: string;
    readonly startAt: Date;
    readonly reminders: readonly { readonly remindAt: Date }[];
  }): Promise<void> {
    await this.replaceTargetNotifications({
      userId: input.userId,
      type: "SCHEDULE_REMINDER",
      targetType: "SCHEDULE",
      targetId: input.scheduleId,
      title: `일정 알림: ${input.scheduleTitle}`,
      content: `${formatDateTime(input.startAt)} 일정이 예정되어 있습니다.`,
      scheduledAtList: input.reminders.map((reminder) => reminder.remindAt),
      metadata: { scheduleStartAt: input.startAt.toISOString() },
    });
  }

  async replaceDealDueNotification(input: {
    readonly userId: string;
    readonly dealId: string;
    readonly dealTitle: string;
    readonly expectedCloseDate: Date | null;
  }): Promise<void> {
    if (!input.expectedCloseDate) {
      await this.cancelTargetNotifications({
        userId: input.userId,
        type: "DEAL_DUE_REMINDER",
        targetType: "DEAL",
        targetId: input.dealId,
      });
      return;
    }

    await this.replaceTargetNotifications({
      userId: input.userId,
      type: "DEAL_DUE_REMINDER",
      targetType: "DEAL",
      targetId: input.dealId,
      title: `딜 마감 알림: ${input.dealTitle}`,
      content: `${formatDate(input.expectedCloseDate)} 마감 예정입니다.`,
      scheduledAtList: [input.expectedCloseDate],
      metadata: { expectedCloseDate: input.expectedCloseDate.toISOString() },
    });
  }

  async replaceNextActionNotification(input: {
    readonly userId: string;
    readonly dealId: string;
    readonly dealTitle: string;
    readonly nextActionText: string | null;
    readonly nextActionDueAt: Date | null;
    readonly nextActionStatus: string;
  }): Promise<void> {
    if (
      !input.nextActionText ||
      !input.nextActionDueAt ||
      input.nextActionStatus === "DONE" ||
      input.nextActionStatus === "NONE"
    ) {
      await this.cancelTargetNotifications({
        userId: input.userId,
        type: "NEXT_ACTION_REMINDER",
        targetType: "DEAL",
        targetId: input.dealId,
      });
      return;
    }

    await this.replaceTargetNotifications({
      userId: input.userId,
      type: "NEXT_ACTION_REMINDER",
      targetType: "DEAL",
      targetId: input.dealId,
      title: `다음 행동 알림: ${input.dealTitle}`,
      content: input.nextActionText,
      scheduledAtList: [input.nextActionDueAt],
      metadata: { nextActionDueAt: input.nextActionDueAt.toISOString() },
    });
  }

  async createMeetingNoteGeneratedNotification(input: {
    readonly userId: string;
    readonly meetingNoteId: string;
    readonly meetingTitle: string;
    readonly createdAt?: Date;
  }): Promise<void> {
    const scheduledAt = input.createdAt ?? new Date();
    await this.notificationRepository.createNotifications(
      this.createChannelNotifications({
        userId: input.userId,
        type: "MEETING_NOTE_GENERATED",
        targetType: "MEETING_NOTE",
        targetId: input.meetingNoteId,
        title: "회의록 생성 완료",
        content: input.meetingTitle,
        scheduledAt,
        metadata: { meetingNoteId: input.meetingNoteId },
      })
    );
  }

  async cancelTargetNotifications(input: {
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly type: NotificationType;
  }): Promise<void> {
    await this.notificationRepository.cancelPendingNotificationsForTarget(input);
  }

  private async replaceTargetNotifications(input: {
    readonly userId: string;
    readonly type: NotificationType;
    readonly targetType: string;
    readonly targetId: string;
    readonly title: string;
    readonly content: string | null;
    readonly scheduledAtList: readonly Date[];
    readonly metadata: Record<string, unknown>;
  }) {
    const notifications = input.scheduledAtList.flatMap((scheduledAt) =>
      this.createChannelNotifications({
        userId: input.userId,
        type: input.type,
        targetType: input.targetType,
        targetId: input.targetId,
        title: input.title,
        content: input.content,
        scheduledAt,
        metadata: input.metadata,
      })
    );

    await this.notificationRepository.replacePendingNotificationsForTarget({
      userId: input.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      type: input.type,
      notifications,
    });
  }

  private createChannelNotifications(input: {
    readonly userId: string;
    readonly type: NotificationType;
    readonly targetType: string;
    readonly targetId: string;
    readonly title: string;
    readonly content: string | null;
    readonly scheduledAt: Date;
    readonly metadata: Record<string, unknown>;
  }): CreateNotificationInput[] {
    return DELIVERY_CHANNELS.map((channel) => ({
      userId: input.userId,
      type: input.type,
      channel,
      targetType: input.targetType,
      targetId: input.targetId,
      title: input.title,
      content: input.content,
      scheduledAt: input.scheduledAt,
      metadata: input.metadata,
    }));
  }
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeZone: "Asia/Seoul",
  }).format(value);
}
