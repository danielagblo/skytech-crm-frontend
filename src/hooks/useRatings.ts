"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { ratingsService } from "@/services/ratings.service";

export const useRequestRatingLink = () =>
  useMutation({
    mutationFn: (dealId: string) => ratingsService.request(dealId),
    onSuccess: (response) => {
      const link = response.data.data;
      if (link.status === "SENT")
        toast.success("A rating link was emailed to the client.");
      else if (link.status === "ALREADY_SENT")
        toast.info("A rating link is already pending for this client.");
      else toast.info("The client has no email on record, so no rating link was sent.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "The rating link could not be sent.")),
  });