import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { AccessToken, AuthTokens, LoginRequest, LoginResponse, VerifyOtpRequest } from '@/types/auth.types';
import type { User } from '@/types/user.types';

export const authService = {
  login: (data: LoginRequest) => api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  verifyOtp: (data: VerifyOtpRequest) => api.post<ApiResponse<AuthTokens>>('/auth/verify-otp', data),
  refresh: (refreshToken: string) => api.post<ApiResponse<AccessToken>>('/auth/refresh', { refreshToken }),
  logout: () => api.post<ApiResponse<void>>('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
};
