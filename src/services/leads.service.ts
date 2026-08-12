import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { Deal } from "@/types/deal.types";
import type {
  ConvertLeadRequest,
  CreateLeadRequest,
  Lead,
  LeadFilters,
  LeadStats,
  UpdateLeadRequest,
} from "@/types/lead.types";

const listParams = ({ assigneeId, ...params }: LeadFilters) => ({
  ...params,
  assignee: assigneeId,
});

export const leadsService = {
  getAll: (params: LeadFilters = {}) =>
    api.get<PaginatedResponse<Lead>>("/leads", { params: listParams(params) }),
  getById: (id: string) => api.get<ApiResponse<Lead>>(`/leads/${id}`),
  getStats: () => api.get<ApiResponse<LeadStats>>("/leads/stats"),
  create: (data: CreateLeadRequest) =>
    api.post<ApiResponse<Lead>>("/leads", data),
  update: (id: string, data: UpdateLeadRequest) =>
    api.put<ApiResponse<Lead>>(`/leads/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/leads/${id}`),
  convert: (id: string, data: ConvertLeadRequest = {}) =>
    api.post<ApiResponse<Deal>>(`/leads/${id}/convert`, data),
  assign: (id: string, assignees: string[], autoAssign = false) =>
    api.put<ApiResponse<Lead>>(`/leads/${id}/assign`, {
      assignees,
      autoAssign,
    }),
};
