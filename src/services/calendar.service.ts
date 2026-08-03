import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { CalendarEvent, CalendarFilters, CreateCalendarEventRequest, UpdateCalendarEventRequest } from '@/types/calendar.types';

export const calendarService = {
  getAll: (params: CalendarFilters = {}) => api.get<PaginatedResponse<CalendarEvent>>('/calendar/events', { params }),
  getById: (id: string) => api.get<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`),
  create: (data: CreateCalendarEventRequest) => api.post<ApiResponse<CalendarEvent>>('/calendar/events', data),
  update: (id: string, data: UpdateCalendarEventRequest) => api.put<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/calendar/events/${id}`),
};
