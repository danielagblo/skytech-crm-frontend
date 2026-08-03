import type { ContactMode, DealStage, LogType, PageParams, PaymentMode, Priority, ResponseType, ServiceType } from './api.types';

export interface Deal {
  id: string;
  companyId: string;
  leadId: string | null;
  createdById: string;
  assignedToId: string | null;
  title: string;
  stage: DealStage;
  priority: Priority | null;
  contractValue: number;
  totalPaid: number;
  arrears: number;
  paidInFull: boolean;
  hostingExpiry: string | null;
  domainExpiry: string | null;
  maintenanceExpiry: string | null;
  hostingCost: number;
  domainCost: number;
  maintenanceCost: number;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealFilters extends PageParams {
  search?: string;
  stage?: DealStage;
  assigneeId?: string;
  priority?: Priority;
}

export interface CreateDealRequest {
  leadId?: string;
  assignedToId?: string;
  title: string;
  stage?: DealStage;
  priority?: Priority;
  contractValue?: number;
  totalPaid?: number;
  hostingExpiry?: string;
  domainExpiry?: string;
  maintenanceExpiry?: string;
  hostingCost?: number;
  domainCost?: number;
  maintenanceCost?: number;
  notes?: string;
  version?: number;
}

export type UpdateDealRequest = CreateDealRequest;

export interface DealLog {
  id: string;
  dealId: string;
  createdById: string;
  logType: LogType;
  contactMode: ContactMode | null;
  responseType: ResponseType | null;
  callDirection: 'OUTGOING' | 'INCOMING' | null;
  callDurationSeconds: number | null;
  callOutcome: 'COMPLETED' | 'NETWORK_INTERRUPTION' | 'CUSTOMER_HUNG_UP' | 'NO_RESPONSE' | null;
  followUpAt: string | null;
  settlementValue: number | null;
  settlementFollowUp: string | null;
  specialConditions: string | null;
  amountPaid: number | null;
  paymentMode: PaymentMode | null;
  invoiceNumber: string | null;
  receiptNumber: string | null;
  invoiceIssued: boolean | null;
  serviceType: ServiceType | null;
  expiryDate: string | null;
  retentionAmount: number | null;
  retentionInvoice: string | null;
  retentionReceipt: string | null;
  autoReviewScore: number | null;
  body: string | null;
  createdAt: string;
}

export type CreateDealLogRequest = Partial<Omit<DealLog, 'id' | 'dealId' | 'createdById' | 'createdAt' | 'autoReviewScore'>> & { logType: LogType };

export interface Comment {
  id: string;
  parentCommentId: string | null;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface TopDeal { id: string; title: string; value: number; stage: DealStage }
