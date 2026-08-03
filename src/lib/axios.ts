import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { camelize, snakeize } from "@/lib/case-conversion";
import { useAuthStore } from "@/store/authStore";
import type { AccessToken } from "@/types/auth.types";
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({ baseURL, timeout: 15_000 });
let refreshPromise: Promise<string> | null = null;

const stored = (key: string) =>
  typeof window === "undefined" ? null : localStorage.getItem(key);

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken =
      useAuthStore.getState().refreshToken ?? stored("skytech_refresh");
    if (!refreshToken) throw new Error("No refresh token is available");
    const response = await axios.post<ApiResponse<AccessToken>>(
      `${baseURL}/auth/refresh`,
      snakeize({ refreshToken }),
      { timeout: 15_000 },
    );
    const data = camelize(response.data) as ApiResponse<AccessToken>;
    useAuthStore.getState().setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken ?? stored("skytech_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data && !(config.data instanceof FormData))
    config.data = snakeize(config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = camelize(response.data);
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data)
      error.response.data = camelize(error.response.data) as ApiErrorResponse;
    const status = error.response?.status;
    const original = error.config as RetryConfig | undefined;
    const isAuthRequest =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/verify-otp") ||
      original?.url?.includes("/auth/refresh");
    const accessToken =
      useAuthStore.getState().accessToken ?? stored("skytech_access");
    const isDemoSession =
      accessToken?.startsWith("demo-") &&
      process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthRequest &&
      !isDemoSession
    ) {
      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
        toast.error("Your session expired. Please sign in again.");
        if (typeof window !== "undefined") window.location.assign("/login");
      }
    }

    if (status === 402)
      toast.error(
        error.response?.data?.message ||
          "This feature requires a plan upgrade.",
      );
    if (status === 403 && !isAuthRequest)
      toast.error(
        error.response?.data?.message ||
          "You don't have permission to perform this action.",
      );
    return Promise.reject(error);
  },
);

export default api;
