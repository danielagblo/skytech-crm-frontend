import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  RatingInfoResponse,
  RatingLinkResponse,
  RatingSubmissionInput,
  RatingSubmissionResponse,
} from "@/types/rating.types";

export const ratingsService = {
  request: (dealId: string) =>
    api.post<ApiResponse<RatingLinkResponse>>("/ratings", { dealId }),
  info: (token: string) =>
    api.get<ApiResponse<RatingInfoResponse>>(`/ratings/public/${token}`),
  submit: (token: string, payload: RatingSubmissionInput) =>
    api.post<ApiResponse<RatingSubmissionResponse>>(
      `/ratings/public/${token}`,
      payload,
    ),
};