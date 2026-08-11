import type { AutomationType, PageParams } from "./api.types";

export type AutomationChannel = "SMS" | "EMAIL" | "BOTH";

export interface AutomationStep {
  channel: AutomationChannel;
  subject?: string;
  message: string;
  label?: string;
  action?: string;
  wait?: string;
  waitDays?: number;
}

export interface AutomationTriggerConfig {
  date?: string;
  contactIds?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface Automation {
  id: string;
  automationType: AutomationType;
  name: string;
  active: boolean;
  triggerConfig: AutomationTriggerConfig;
  contactIds?: string[];
  steps: AutomationStep[];
  executionState?: "WAITING" | "COMPLETED" | "FAILED";
  nextRunAt?: string | null;
  lastExecutedAt?: string | null;
  failureReason?: string | null;
  recipientCount?: number;
  createdById: string;
  createdAt: string;
}

export interface AutomationFilters extends PageParams {
  type?: AutomationType;
}

export interface CreateAutomationRequest {
  automationType: AutomationType;
  name: string;
  active?: boolean;
  triggerConfig: AutomationTriggerConfig;
  contactIds?: string[];
  steps: AutomationStep[];
}

export type UpdateAutomationRequest = CreateAutomationRequest;

export interface AutomationTypeOption {
  value: AutomationType;
  label?: string;
  executable?: boolean;
  requiresDate?: boolean;
  description?: string;
}

export interface AutomationOptions {
  types?: Array<AutomationType | AutomationTypeOption>;
  automationTypes?: Array<AutomationType | AutomationTypeOption>;
  channels?: AutomationChannel[];
  stepFields?: string[];
  triggerRequirements?: Partial<
    Record<
      AutomationType,
      {
        requiredFields?: string[];
        executable?: boolean;
        requiresDate?: boolean;
      }
    >
  >;
}
