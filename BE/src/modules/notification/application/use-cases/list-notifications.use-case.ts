import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import { toNotificationListResponse } from "@/modules/notification/application/notification-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  normalizeNotificationReadFilter,
  normalizePage,
  normalizePageSize,
} from "./notification-input";

export interface ListNotificationsQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly status?: string;
}

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    query: ListNotificationsQuery
  ) {
    const result = await this.notificationRepository.listNotifications({
      userId: currentUser.id,
      page: normalizePage(query.page),
      pageSize: normalizePageSize(query.pageSize),
      status: normalizeNotificationReadFilter(query.status),
    });

    return toNotificationListResponse(result);
  }
}
