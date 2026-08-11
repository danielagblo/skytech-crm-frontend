import type { PageParams } from "./api.types";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export type NotificationFilters = PageParams;
