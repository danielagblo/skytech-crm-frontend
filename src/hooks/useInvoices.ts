"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { invoicesService } from "@/services/invoices.service";
import type {
  InvoiceDraftRequest,
  InvoiceFilters,
  RecordInvoicePaymentRequest,
  SendInvoiceRequest,
  UpdateInvoiceDraftRequest,
} from "@/types/invoice.types";

const invalidate = (client: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    client.invalidateQueries({ queryKey: ["invoices"] }),
    client.invalidateQueries({ queryKey: ["deals"] }),
    client.invalidateQueries({ queryKey: ["pipeline"] }),
  ]);

export const useInvoices = (filters: InvoiceFilters = {}) =>
  useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => invoicesService.getAll(filters),
    select: (response) => response.data.data,
  });

export const useInvoice = (id: string) => {
  const client = useQueryClient();
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const invoice = (await invoicesService.getById(id)).data.data;
      if (invoice.status !== "SENDING")
        void client.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "invoices" &&
            typeof query.queryKey[1] === "object",
        });
      return invoice;
    },
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "SENDING" ? 2_000 : false,
  });
};

export const useCreateInvoice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceDraftRequest) => invoicesService.create(data),
    onSuccess: () => {
      void invalidate(client);
      toast.success(
        "Invoice draft created. Totals were calculated by the server.",
      );
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The invoice draft could not be created."),
      ),
  });
};

export const useUpdateInvoice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInvoiceDraftRequest;
    }) => invoicesService.update(id, data),
    onSuccess: () => {
      void invalidate(client);
      toast.success("Invoice draft updated.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "The invoice draft could not be updated. Refresh it if another user changed the draft.",
        ),
      ),
  });
};

const lifecycleMutation = (
  request: (id: string) => Promise<unknown>,
  successMessage: string,
  fallback: string,
) => {
  const useLifecycle = () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: request,
      onSuccess: () => {
        void invalidate(client);
        toast.success(successMessage);
      },
      onError: (error) => toast.error(getApiErrorMessage(error, fallback)),
    });
  };
  return useLifecycle;
};

export const useIssueInvoice = lifecycleMutation(
  invoicesService.issue,
  "Invoice issued and frozen.",
  "The invoice could not be issued.",
);
export const useDeleteInvoice = lifecycleMutation(
  invoicesService.delete,
  "Invoice draft deleted.",
  "Only editable drafts can be deleted.",
);
export const useVoidInvoice = lifecycleMutation(
  invoicesService.void,
  "Invoice voided.",
  "The invoice could not be voided.",
);

export const useSendInvoice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendInvoiceRequest }) =>
      invoicesService.send(id, data),
    onSuccess: (_, variables) => {
      void client.invalidateQueries({ queryKey: ["invoices", variables.id] });
      void client.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(
        "Invoice queued for delivery. Status will update automatically.",
      );
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "The invoice could not be queued for delivery.",
        ),
      ),
  });
};

export const useConfirmInvoiceReception = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: invoicesService.confirmReception,
    onSuccess: (_, id) => {
      void client.invalidateQueries({ queryKey: ["invoices", id] });
      void client.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice reception confirmed.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Invoice reception could not be confirmed.")),
  });
};

export const useRecordInvoicePayment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RecordInvoicePaymentRequest;
    }) => invoicesService.recordPayment(id, data),
    onSuccess: () => {
      void invalidate(client);
      toast.success(
        "Payment recorded. The related deal log was created automatically.",
      );
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "The payment could not be recorded."),
      ),
  });
};
