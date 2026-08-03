import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  TaskStatus,
} from "@/types/api.types";
import type { Comment } from "@/types/deal.types";
import type {
  CreateSubTaskRequest,
  CreateTaskRequest,
  SubTask,
  Task,
  TaskFilters,
  TaskStats,
  UpdateTaskRequest,
} from "@/types/task.types";

const listParams = ({ assigneeId, ...params }: TaskFilters) => ({
  ...params,
  assignee: assigneeId,
});

export const tasksService = {
  getAll: (params: TaskFilters = {}) =>
    api.get<PaginatedResponse<Task>>("/tasks", { params: listParams(params) }),
  getStats: () => api.get<ApiResponse<TaskStats>>("/tasks/stats"),
  getById: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  create: (data: CreateTaskRequest) =>
    api.post<ApiResponse<Task>>("/tasks", data),
  update: (id: string, data: UpdateTaskRequest) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/tasks/${id}`),
  updateStatus: (id: string, status: TaskStatus) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}/status`, { status }),
  getSubtasks: (taskId: string, page = 0, size = 100) =>
    api.get<PaginatedResponse<SubTask>>(`/tasks/${taskId}/subtasks`, {
      params: { page, size },
    }),
  createSubtask: (taskId: string, data: CreateSubTaskRequest) =>
    api.post<ApiResponse<SubTask>>(`/tasks/${taskId}/subtasks`, data),
  updateSubtask: (
    taskId: string,
    subtaskId: string,
    data: CreateSubTaskRequest,
  ) =>
    api.put<ApiResponse<SubTask>>(
      `/tasks/${taskId}/subtasks/${subtaskId}`,
      data,
    ),
  deleteSubtask: (taskId: string, subtaskId: string) =>
    api.delete<ApiResponse<void>>(`/tasks/${taskId}/subtasks/${subtaskId}`),
  getComments: (taskId: string, page = 0, size = 100) =>
    api.get<PaginatedResponse<Comment>>(`/tasks/${taskId}/comments`, {
      params: { page, size },
    }),
  addComment: (taskId: string, body: string) =>
    api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { body }),
  updateComment: (taskId: string, commentId: string, body: string) =>
    api.put<ApiResponse<Comment>>(`/tasks/${taskId}/comments/${commentId}`, {
      body,
    }),
  deleteComment: (taskId: string, commentId: string) =>
    api.delete<ApiResponse<void>>(`/tasks/${taskId}/comments/${commentId}`),
  replyToComment: (taskId: string, commentId: string, body: string) =>
    api.post<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments/${commentId}/reply`,
      { body },
    ),
};
