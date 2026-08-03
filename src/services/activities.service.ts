import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Activity, ActivityFilters, CreateActivityRequest } from '@/types/activity.types';

export const activitiesService = {
  getAll: (params: ActivityFilters = {}) => api.get<PaginatedResponse<Activity>>('/activities', { params }),
  create: (data: CreateActivityRequest) => api.post<ApiResponse<Activity>>('/activities', data),
};
