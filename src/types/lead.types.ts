import type { LeadSource, LeadStatus, PageParams, Priority } from "./api.types";

export type LaunchTimeline =
  "IN_1_WEEK" | "ONE_TO_TWO_MONTHS" | "THREE_PLUS_MONTHS";

export interface Lead {
  id: string;
  companyId: string;
  assignedTo: string[];
  createdById: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone1: string | null;
  phone2: string | null;
  whatsapp: string | null;
  companyName: string | null;
  role: string | null;
  address: string | null;
  industry: string | null;
  category: string | null;
  leadSource: LeadSource | null;
  priority: Priority | null;
  status: LeadStatus;
  launchTimeline: LaunchTimeline | null;
  hasPublicOffice: boolean | null;
  meetingArranged: boolean | null;
  birthday: string | null;
  smsOptIn: boolean;
  emailOptIn: boolean;
  newsletterOptIn: boolean;
  description: string | null;
  conversionScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters extends PageParams {
  search?: string;
  assigneeId?: string;
  priority?: Priority;
  status?: LeadStatus;
  source?: LeadSource;
  category?: string;
}

export interface CreateLeadRequest {
  assignedTo?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  whatsapp?: string;
  companyName?: string;
  role?: string;
  address?: string;
  industry?: string;
  category?: string;
  leadSource?: LeadSource;
  priority?: Priority;
  status?: LeadStatus;
  launchTimeline?: LaunchTimeline;
  hasPublicOffice?: boolean;
  meetingArranged?: boolean;
  birthday?: string;
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  newsletterOptIn?: boolean;
  description?: string;
  conversionScore?: number;
}

export type UpdateLeadRequest = CreateLeadRequest;

export interface ConvertLeadRequest {
  title?: string;
  assignedToId?: string;
  priority?: Priority;
  contractValue?: number;
}

export interface LeadStats {
  total: number;
  countsByStatus: Partial<Record<LeadStatus, number>>;
  sourceBreakdown: Partial<Record<LeadSource, number>>;
  averageConversionScore: number;
}

export interface LeadAssignmentConfig {
  enabled: boolean;
  config: {
    strategy?: "LEAST_LOADED" | "ROUND_ROBIN";
  };
}
