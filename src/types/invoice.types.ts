import type { PageParams, PaymentMode } from "./api.types";

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "SENDING"
  | "SENT"
  | "SEND_FAILED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOID";

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  subLines?: string[];
}

export interface InvoicePayment {
  id: string;
  amount: number;
  paymentMode: PaymentMode;
  reference: string | null;
  paidAt: string;
  recordedById?: string;
}

export interface Invoice {
  id: string;
  companyId?: string;
  dealId: string;
  createdById?: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  recipientName: string;
  recipientCompany: string | null;
  recipientEmail: string | null;
  recipientAddress: string | null;
  dueDate: string | null;
  issueDate?: string | null;
  currency: "GHS";
  taxRate: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes: string | null;
  terms: string | null;
  version: number;
  issuedAt?: string | null;
  sentAt?: string | null;
  receptionConfirmed: boolean;
  receptionConfirmedAt?: string | null;
  receptionConfirmedById?: string | null;
  lastSendError: string | null;
  items: InvoiceLineItem[];
  payments: InvoicePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters extends PageParams {
  search?: string;
  status?: InvoiceStatus;
  dealId?: string;
}

export interface InvoiceDraftRequest {
  dealId: string;
  recipientName?: string;
  recipientCompany?: string;
  recipientEmail?: string;
  recipientAddress?: string;
  issueDate?: string;
  currency: "GHS";
  taxRate: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
  items: Array<
    Pick<InvoiceLineItem, "description" | "quantity" | "unitPrice"> & {
      subLines?: string[];
    }
  >;
}

export interface UpdateInvoiceDraftRequest extends InvoiceDraftRequest {
  version: number;
}

export interface SendInvoiceRequest {
  email?: string;
  subject?: string;
  message?: string;
}

export interface RecordInvoicePaymentRequest {
  amount: number;
  paymentMode: PaymentMode;
  reference?: string;
  paidAt: string;
}
