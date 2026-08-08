import type { Metadata } from "next";
import { RatingPage } from "@/components/ratings/RatingPage";

export const metadata: Metadata = {
  title: "Rate your experience",
  description:
    "Tell us how your experience with Skytech went. Your feedback helps us improve.",
};

export default async function RateMePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RatingPage token={token} />;
}