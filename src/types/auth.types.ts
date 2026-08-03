import type { User } from "./user.types";

export interface LoginRequest {
  email: string;
  password: string;
}
interface OtpLoginResponse {
  requiresOtp: true;
  userId: string;
}
interface DirectLoginResponse extends AuthTokens {
  requiresOtp: false;
  userId: string;
}
export type LoginResponse = OtpLoginResponse | DirectLoginResponse;
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
