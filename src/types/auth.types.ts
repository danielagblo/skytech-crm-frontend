import type { User } from "./user.types";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  requiresOtp: boolean;
  userId: string;
}
export interface VerifyOtpRequest {
  userId: string;
  otp: string;
}
export interface RefreshRequest {
  refreshToken: string;
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}
export interface AccessToken {
  accessToken: string;
}
