import { useQuery } from "@tanstack/react-query";
import {
  getBrowserPushPublicKey,
  getNotificationSettings,
  listNotifications,
} from "@/features/notification/api/notification-api";
import { notificationQueryKeys } from "@/features/notification/api/notification-query-keys";
import type { NotificationReadFilter } from "@/features/notification/types/notification";

export function useNotificationList(input: {
  readonly page: number;
  readonly pageSize: number;
  readonly status: NotificationReadFilter;
}) {
  return useQuery({
    queryKey: notificationQueryKeys.list(input),
    queryFn: () => listNotifications(input),
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationQueryKeys.settings(),
    queryFn: getNotificationSettings,
  });
}

export function useBrowserPushPublicKey() {
  return useQuery({
    queryKey: notificationQueryKeys.browserPushPublicKey(),
    queryFn: getBrowserPushPublicKey,
  });
}
