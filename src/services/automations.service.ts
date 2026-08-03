import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
  Automation,
  AutomationFilters,
  AutomationOptions,
  CreateAutomationRequest,
  UpdateAutomationRequest,
} from "@/types/automation.types";

export const automationsService = {
  getOptions: () =>
    api.get<ApiResponse<AutomationOptions>>("/automations/options"),
  getAll: (params: AutomationFilters = {}) =>
    api.get<PaginatedResponse<Automation>>("/automations", { params }),
  getBirthday: (params: AutomationFilters = {}) =>
    api.get<PaginatedResponse<Automation>>("/automations/birthday-configs", {
      params,
    }),
  getHolidays: (params: AutomationFilters = {}) =>
    api.get<PaginatedResponse<Automation>>("/automations/holiday-configs", {
      params,
    }),
  getPayments: (params: AutomationFilters = {}) =>
    api.get<PaginatedResponse<Automation>>("/automations/payment-workflows", {
      params,
    }),
  getById: (id: string) =>
    api.get<ApiResponse<Automation>>(`/automations/${id}`),
  create: (data: CreateAutomationRequest) =>
    api.post<ApiResponse<Automation>>("/automations", data),
  update: (id: string, data: UpdateAutomationRequest) =>
    api.put<ApiResponse<Automation>>(`/automations/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/automations/${id}`),
  toggle: (id: string) =>
    api.put<ApiResponse<Automation>>(`/automations/${id}/toggle`),
};
