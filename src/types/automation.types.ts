import type { AutomationType, PageParams } from './api.types';

export interface Automation {
  id: string;
  automationType: AutomationType;
  name: string;
  active: boolean;
  triggerConfig: Record<string, unknown>;
  steps: Record<string, unknown>[];
  createdById: string;
  createdAt: string;
}

export interface AutomationFilters extends PageParams { type?: AutomationType }

export interface CreateAutomationRequest {
  automationType: AutomationType;
  name: string;
  active?: boolean;
  triggerConfig?: Record<string, unknown>;
  steps?: Record<string, unknown>[];
}

export type UpdateAutomationRequest = CreateAutomationRequest;
