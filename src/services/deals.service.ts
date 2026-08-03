import api from '@/lib/axios';
import type { ApiResponse, DealStage, PaginatedResponse } from '@/types/api.types';
import type { Comment, CreateDealLogRequest, CreateDealRequest, Deal, DealFilters, DealLog, UpdateDealRequest } from '@/types/deal.types';

const listParams = ({ assigneeId, ...params }: DealFilters) => ({ ...params, assignee: assigneeId });

export const dealsService = {
  getAll: (params: DealFilters = {}) => api.get<PaginatedResponse<Deal>>('/deals', { params: listParams(params) }),
  getPipeline: () => api.get<ApiResponse<Record<DealStage, Deal[]>>>('/pipeline'),
  getById: (id: string) => api.get<ApiResponse<Deal>>(`/deals/${id}`),
  create: (data: CreateDealRequest) => api.post<ApiResponse<Deal>>('/deals', data),
  update: (id: string, data: UpdateDealRequest) => api.put<ApiResponse<Deal>>(`/deals/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/deals/${id}`),
  updateStage: (id: string, stage: DealStage) => api.put<ApiResponse<Deal>>(`/deals/${id}/stage`, { stage }),
  getLogs: (dealId: string, page = 0, size = 100) => api.get<PaginatedResponse<DealLog>>(`/deals/${dealId}/logs`, { params: { page, size } }),
  getLog: (dealId: string, logId: string) => api.get<ApiResponse<DealLog>>(`/deals/${dealId}/logs/${logId}`),
  addLog: (dealId: string, data: CreateDealLogRequest) => api.post<ApiResponse<DealLog>>(`/deals/${dealId}/logs`, data),
  updateLog: (dealId: string, logId: string, data: CreateDealLogRequest) => api.put<ApiResponse<DealLog>>(`/deals/${dealId}/logs/${logId}`, data),
  deleteLog: (dealId: string, logId: string) => api.delete<ApiResponse<void>>(`/deals/${dealId}/logs/${logId}`),
  getComments: (dealId: string, logId: string, page = 0, size = 100) => api.get<PaginatedResponse<Comment>>(`/deals/${dealId}/logs/${logId}/comments`, { params: { page, size } }),
  addComment: (dealId: string, logId: string, body: string) => api.post<ApiResponse<Comment>>(`/deals/${dealId}/logs/${logId}/comments`, { body }),
  updateComment: (dealId: string, logId: string, commentId: string, body: string) => api.put<ApiResponse<Comment>>(`/deals/${dealId}/logs/${logId}/comments/${commentId}`, { body }),
  deleteComment: (dealId: string, logId: string, commentId: string) => api.delete<ApiResponse<void>>(`/deals/${dealId}/logs/${logId}/comments/${commentId}`),
  replyToComment: (dealId: string, logId: string, commentId: string, body: string) => api.post<ApiResponse<Comment>>(`/deals/${dealId}/logs/${logId}/comments/${commentId}/reply`, { body }),
};
