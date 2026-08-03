import type { CalendarEventType, PageParams } from './api.types';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  linkedLeadId: string | null;
  linkedDealId: string | null;
  startTime: string;
  endTime: string;
  eventType: CalendarEventType;
  assignees: string[];
  createdAt: string;
}

export interface CalendarFilters extends PageParams { from?: string; to?: string }

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  linkedLeadId?: string;
  linkedDealId?: string;
  startTime: string;
  endTime: string;
  eventType: CalendarEventType;
  assignees?: string[];
}

export type UpdateCalendarEventRequest = CreateCalendarEventRequest;
