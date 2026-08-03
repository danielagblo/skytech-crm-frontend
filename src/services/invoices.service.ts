import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
  Invoice,
  InvoiceDraftRequest,
  InvoiceFilters,
  RecordInvoicePaymentRequest,
  SendInvoiceRequest,
  UpdateInvoiceDraftRequest,
} from "@/types/invoice.types";

export const invoicesService = {
  getAll: ({ dealId, ...params }: InvoiceFilters = {}) =>
    api.get<PaginatedResponse<Invoice>>("/invoices", {
      params: { ...params, deal_id: dealId },
    }),
  getById: (id: string) => api.get<ApiResponse<Invoice>>(`/invoices/${id}`),
  create: (data: InvoiceDraftRequest) =>
    api.post<ApiResponse<Invoice>>("/invoices", data),
  update: (id: string, data: UpdateInvoiceDraftRequest) =>
    api.put<ApiResponse<Invoice>>(`/invoices/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/invoices/${id}`),
  issue: (id: string) =>
    api.post<ApiResponse<Invoice>>(`/invoices/${id}/issue`),
  downloadPdf: (id: string) =>
    api.get<Blob>(`/invoices/${id}/pdf`, { responseType: "blob" }),
  send: (id: string, data: SendInvoiceRequest) =>
    api.post<ApiResponse<Invoice>>(`/invoices/${id}/send`, data),
  recordPayment: (id: string, data: RecordInvoicePaymentRequest) =>
    api.post<ApiResponse<Invoice>>(`/invoices/${id}/payments`, data),
  void: (id: string) => api.post<ApiResponse<Invoice>>(`/invoices/${id}/void`),
};
