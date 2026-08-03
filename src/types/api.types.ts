export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PageData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type PaginatedResponse<T> = ApiResponse<PageData<T>>;

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string> | null;
  timestamp: string;
  upgradeRequired?: boolean;
  feature?: string;
}

export type Role = "ADMIN" | "MANAGER" | "AGENT";
export type PlanTier = "FREE" | "PRO";
export type DealStage =
  "PROSPECTING" | "NEGOTIATION" | "SETTLEMENT" | "PAYMENT" | "CLIENT_RETENTION";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "DOING" | "DONE" | "OVERDUE";
export type LeadStatus =
  "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "CONVERTED";
export type LeadSource =
  "SMS" | "EMAIL" | "FACEBOOK" | "GOOGLE" | "BANNER" | "META_ADS";
export type BroadcastStatus = "DRAFT" | "SENT" | "WAITING" | "FAILED";
export type LogType =
  "NEGOTIATION" | "SETTLEMENT" | "PAYMENT" | "CLIENT_RETENTION";
export type ContactMode = "PHONE_CALL" | "EMAIL" | "IN_PERSON" | "WHATSAPP";
export type ResponseType = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "NO_RESPONSE";
export type PaymentMode = "MOMO" | "BANK_TRANSFER" | "CASH" | "CHEQUE";
export type ServiceType = "HOSTING" | "DOMAIN" | "MAINTENANCE";
export type CalendarEventType =
  "CALL_LOG_FOLLOWUP" | "PAYMENT_DUE" | "MEETING" | "REMINDER";
export type AutomationType =
  "BIRTHDAY" | "PUBLIC_HOLIDAY" | "PAYMENT" | "PERSONAL";
export type BroadcastChannel = "SMS" | "EMAIL";
