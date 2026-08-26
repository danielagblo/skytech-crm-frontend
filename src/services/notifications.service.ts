import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { AppNotification, NotificationFilters } from "@/types/notification.types";

export const notificationsService = {
  getAll: (params: NotificationFilters = {}) =>
    api.get<PaginatedResponse<AppNotification>>("/notifications", { params }),
  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>("/notifications/unread-count"),
  markRead: (id: string) =>
    api.post<ApiResponse<AppNotification>>(`/notifications/${id}/read`),
  markAllRead: () => api.post<ApiResponse<null>>("/notifications/read-all"),
};
