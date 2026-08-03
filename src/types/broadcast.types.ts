import type {
  BroadcastChannel,
  BroadcastStatus,
  DealStage,
  PageParams,
} from "./api.types";

export interface ContactSegments {
  all: number;
  byStage: Partial<Record<DealStage, number>>;
}

export interface Broadcast {
  id: string;
  name: string;
  messageContent: string;
  channel: BroadcastChannel;
  status: BroadcastStatus;
  recipientCount: number;
  segmentFilter: Record<string, unknown>;
  createdById: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface BroadcastFilters extends PageParams {
  days?: number;
}

export interface CreateBroadcastRequest {
  name: string;
  messageContent: string;
  channel: BroadcastChannel;
  segmentFilter: Record<string, unknown>;
  scheduledAt?: string;
}

export type UpdateBroadcastRequest = CreateBroadcastRequest;
