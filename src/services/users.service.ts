import api from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, Role } from '@/types/api.types';
import type { CreateUserRequest, UpdateUserRequest, User, UserFilters, UserPerformance } from '@/types/user.types';

export const usersService = {
  getAll: (params: UserFilters = {}) => api.get<PaginatedResponse<User>>('/users', { params }),
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: CreateUserRequest) => api.post<ApiResponse<User>>('/users', data),
  update: (id: string, data: UpdateUserRequest) => api.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<void>>(`/users/${id}`),
  updateRole: (id: string, role: Role) => api.put<ApiResponse<User>>(`/users/${id}/role`, { role }),
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.put<ApiResponse<User>>(`/users/${id}/photo`, form);
  },
  getPerformance: (id: string) => api.get<ApiResponse<UserPerformance>>(`/users/${id}/performance`),
};
