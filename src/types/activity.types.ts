import type { PageParams } from "./api.types";

export type ActivityType =
  | "UNAUTHORIZED_LOGIN"
  | "LEAD_STATUS_CHANGED"
  | "LEAD_LOG_CALL"
  | "LEAD_STAGE_CHANGED"
  | "TASK_STATUS_CHANGED"
  | "COMMENT_RECEIVED_TASK"
  | "COMMENT_RECEIVED_LEAD"
  | "SUBTASK_CREATED"
  | "TASK_APPROVED"
  | "HOSTING_EXPIRY_NOTICE"
  | "DOMAIN_EXPIRY_NOTICE"
  | "MAINTENANCE_EXPIRY_NOTICE";
export type ActivityEntityType =
  "LEAD" | "DEAL" | "TASK" | "SYSTEM" | "AUTOMATION";

export interface Activity {
  id: string;
  actorId: string | null;
  eventType: ActivityType;
  entityType: ActivityEntityType;
  entityId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityFilters extends PageParams {
  filter?: string;
  days?: number;
}

export interface CreateActivityRequest {
  eventType: ActivityType;
  entityType: ActivityEntityType;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}
