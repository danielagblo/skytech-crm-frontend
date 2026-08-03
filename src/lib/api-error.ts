import axios from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

export const getApiError = (error: unknown): ApiErrorResponse | null => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return null;
  return error.response?.data ?? null;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const response = getApiError(error);
  if (!response)
    return axios.isAxiosError(error) && error.code === "ECONNABORTED"
      ? "The server took too long to respond. Please try again."
      : fallback;
  const details = response.details
    ? Object.values(response.details).filter(Boolean)
    : [];
  return details.length > 0
    ? `${response.message}: ${details.join(", ")}`
    : response.message || fallback;
};
