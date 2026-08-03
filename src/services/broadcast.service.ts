import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Broadcast, BroadcastFilters, ContactSegments, CreateBroadcastRequest, UpdateBroadcastRequest } from '@/types/broadcast.types';

export const broadcastService = {
  getAll: (params: BroadcastFilters = {}) => api.get<PaginatedResponse<Broadcast>>('/broadcasts', { params }),
  getRecent: ({ days = 7, ...params }: BroadcastFilters = {}) => api.get<PaginatedResponse<Broadcast>>('/broadcasts/recent-activity', { params: { days, ...params } }),
  getById: (id: string) => api.get<ApiResponse<Broadcast>>(`/broadcasts/${id}`),
  getSegments: () => api.get<ApiResponse<ContactSegments>>('/contacts/segments'),
  create: (data: CreateBroadcastRequest) => api.post<ApiResponse<Broadcast>>('/broadcasts', data),
  update: (id: string, data: UpdateBroadcastRequest) => api.put<ApiResponse<Broadcast>>(`/broadcasts/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/broadcasts/${id}`),
  send: (id: string) => api.post<ApiResponse<Broadcast>>(`/broadcasts/${id}/send`),
  schedule: (id: string, scheduledAt: string) => api.post<ApiResponse<Broadcast>>(`/broadcasts/${id}/schedule`, { scheduledAt }),
};
