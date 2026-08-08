export type RatingLinkStatus = "SENT" | "ALREADY_SENT" | "NO_EMAIL";

export interface RatingLinkResponse {
  id: string;
  agentId: string;
  dealId: string;
  clientEmail: string | null;
  status: RatingLinkStatus;
  message: string | null;
}

export interface RatingInfoResponse {
  id: string;
  agentId: string;
  agentName: string;
  dealTitle: string;
  rated: boolean;
  rating: number | null;
  feedback: string | null;
}

export interface RatingSubmissionInput {
  ratingId: string;
  rating: number;
  feedback?: string;
  clientName?: string;
}

export interface RatingSubmissionResponse {
  id: string;
  agentId: string;
  dealId: string;
  rating: number;
  feedback: string | null;
  clientName: string | null;
  ratedAt: string;
}