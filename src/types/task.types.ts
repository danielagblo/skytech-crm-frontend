import type { PageParams, Priority, TaskStatus } from './api.types';

export interface Task {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority | null;
  createdById: string;
  allowReminder: boolean;
  linkedLeadId: string | null;
  linkedDealId: string | null;
  dueDate: string | null;
  assigneeIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters extends PageParams {
  search?: string;
  status?: TaskStatus;
  assigneeId?: string;
  priority?: Priority;
  overdue?: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  allowReminder?: boolean;
  linkedLeadId?: string;
  linkedDealId?: string;
  dueDate?: string;
  assigneeIds?: string[];
  version?: number;
}

export type UpdateTaskRequest = CreateTaskRequest;

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  priority: Priority | null;
  complete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  complete?: boolean;
}

export interface TaskStats { total: number; done: number; overdue: number }
