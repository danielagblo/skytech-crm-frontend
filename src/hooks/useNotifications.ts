"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { notificationsService } from "@/services/notifications.service";

type NotificationListResponse = Awaited<ReturnType<typeof notificationsService.getAll>>;
type UnreadResponse = Awaited<ReturnType<typeof notificationsService.getUnreadCount>>;

const optimisticallyRead = (
  response: NotificationListResponse | undefined,
  predicate: (item: NotificationListResponse["data"]["data"]["content"][number]) => boolean,
) => response
  ? {
      ...response,
      data: {
        ...response.data,
        data: {
          ...response.data.data,
          content: response.data.data.content.map((item) =>
            predicate(item) ? { ...item, read: true } : item,
          ),
        },
      },
    }
  : response;

const optimisticallySetCount = (response: UnreadResponse | undefined, count: number) =>
  response
    ? { ...response, data: { ...response.data, data: { count: Math.max(count, 0) } } }
    : response;

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsService.getAll({ page: 0, size: 20 }),
    select: (response) => response.data.data.content,
    refetchInterval: 30_000,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsService.getUnreadCount,
    select: (response) => response.data.data.count,
    refetchInterval: 30_000,
  });

export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markRead,
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: ["notifications"] });
      const previous = client.getQueryData<NotificationListResponse>(["notifications"]);
      const previousCount = client.getQueryData<UnreadResponse>(["notifications", "unread-count"]);
      client.setQueryData<NotificationListResponse>(["notifications"], (response) =>
        optimisticallyRead(response, (item) => item.id === id),
      );
      client.setQueryData<UnreadResponse>(["notifications", "unread-count"], (response) =>
        optimisticallySetCount(response, (response?.data.data.count ?? 1) - 1),
      );
      return { previous, previousCount };
    },
    onError: (error, _id, context) => {
      if (context?.previous)
        client.setQueryData(["notifications"], context.previous);
      if (context?.previousCount)
        client.setQueryData(["notifications", "unread-count"], context.previousCount);
      void client.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.error(getApiErrorMessage(error, "The notification could not be marked as read."));
    },
    onSuccess: () => toast.success("Notification marked as read."),
    onSettled: () => void client.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onMutate: async () => {
      await client.cancelQueries({ queryKey: ["notifications"] });
      const previous = client.getQueryData<NotificationListResponse>(["notifications"]);
      const previousCount = client.getQueryData<UnreadResponse>(["notifications", "unread-count"]);
      client.setQueryData<NotificationListResponse>(["notifications"], (response) =>
        optimisticallyRead(response, () => true),
      );
      client.setQueryData<UnreadResponse>(["notifications", "unread-count"], (response) =>
        optimisticallySetCount(response, 0),
      );
      return { previous, previousCount };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) client.setQueryData(["notifications"], context.previous);
      if (context?.previousCount)
        client.setQueryData(["notifications", "unread-count"], context.previousCount);
      void client.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.error(getApiErrorMessage(error, "Notifications could not be marked as read."));
    },
    onSuccess: () => toast.success("All notifications marked as read."),
    onSettled: () => void client.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
