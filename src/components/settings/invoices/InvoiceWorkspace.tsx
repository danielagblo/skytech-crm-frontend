"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { addDays, format } from "date-fns";
import {
  AlertCircle,
  Banknote,
  Download,
  FilePlus2,
  LoaderCircle,
  Mail,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDeals } from "@/hooks/useDeals";
import {
  useCreateInvoice,
  useConfirmInvoiceReception,
  useDeleteInvoice,
  useInvoice,
  useInvoices,
  useIssueInvoice,
  useRecordInvoicePayment,
  useSendInvoice,
  useUpdateInvoice,
  useVoidInvoice,
} from "@/hooks/useInvoices";
import { useDeal } from "@/hooks/useDeals";
import { useLead } from "@/hooks/useLeads";
import type { PaymentMode } from "@/types/api.types";
import type {
  Invoice,
  InvoiceDraftRequest,
  InvoiceStatus,
} from "@/types/invoice.types";
import { formatCurrency, formatDate } from "@/lib/utils";
import InvoicePreview, {
  type InvoiceData,
} from "@/components/invoices/InvoicePreview";
import {
  downloadInvoicePDF,
  openInvoicePdf,
} from "@/components/invoices/InvoicePDF";

const itemSchema = z.object({
  description: z.string().trim().min(2, "Describe this line item.").max(500),
  quantity: z.number().positive("Quantity must be above zero."),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
  subLines: z.array(z.string().max(500)).default([]),
});
const draftSchema = z.object({
  dealId: z.string().min(1, "Select the related deal."),
  recipientName: z.string().max(255),
  recipientCompany: z.string().max(255),
  recipientEmail: z.union([
    z.literal(""),
    z.string().email("Enter a valid email.").max(255),
  ]),
  recipientAddress: z.string(),
  issueDate: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
  ]),
  taxRate: z.number().min(0).max(100),
  discountAmount: z.number().min(0),
  notes: z.string().max(1000),
  terms: z.string().max(1000),
  items: z.array(itemSchema).min(1, "Add at least one line item.").max(100),
});
type DraftValues = z.infer<typeof draftSchema>;

const sendSchema = z.object({
  email: z.union([
    z.literal(""),
    z.string().email("Enter a valid email.").max(255),
  ]),
  subject: z.string().max(255),
  message: z.string().max(5000),
});
type SendValues = z.infer<typeof sendSchema>;

const paymentSchema = z.object({
  amount: z.number().positive("Enter an amount above zero."),
  paymentMode: z.enum(["MOMO", "BANK_TRANSFER", "CASH", "CHEQUE"]),
  reference: z.string().max(100),
  paidAt: z.string().min(1, "Choose the payment date and time."),
});
type PaymentValues = z.infer<typeof paymentSchema>;

const defaultDraft = (): DraftValues => ({
  dealId: "",
  recipientName: "",
  recipientCompany: "",
  recipientEmail: "",
  recipientAddress: "",
  issueDate: "",
  taxRate: 0,
  discountAmount: 0,
  notes: "",
  terms: "Payment is due within 14 days. 50% is to be paid upfront.",
  items: [{ description: "Service", quantity: 1, unitPrice: 0, subLines: [] }],
});

const toDraftValues = (invoice: Invoice): DraftValues => ({
  dealId: invoice.dealId,
  recipientName: invoice.recipientName ?? "",
  recipientCompany: invoice.recipientCompany ?? "",
  recipientEmail: invoice.recipientEmail ?? "",
  recipientAddress: invoice.recipientAddress ?? "",
  issueDate: invoice.issueDate ?? "",
  taxRate: invoice.taxRate,
  discountAmount: invoice.discountAmount,
  notes: invoice.notes ?? "",
  terms: invoice.terms ?? "",
  items: invoice.items.map(
    ({ description, quantity, unitPrice, subLines }) => ({
      description,
      quantity,
      unitPrice,
      subLines: subLines ?? [],
    }),
  ),
});

const requestFrom = (values: DraftValues): InvoiceDraftRequest => ({
  dealId: values.dealId,
  recipientName: values.recipientName || undefined,
  recipientCompany: values.recipientCompany || undefined,
  recipientEmail: values.recipientEmail || undefined,
  recipientAddress: values.recipientAddress || undefined,
  issueDate: values.issueDate || undefined,
  currency: "GHS",
  taxRate: values.taxRate,
  discountAmount: values.discountAmount,
  notes: values.notes || undefined,
  terms: values.terms || undefined,
  items: values.items.map(({ description, quantity, unitPrice, subLines }) => ({
    description,
    quantity,
    unitPrice,
    subLines: (subLines ?? []).map((line) => line.trim()).filter(Boolean),
  })),
});

const displayNumber = (invoice: Invoice) =>
  invoice.invoiceNumber ?? `Draft ${invoice.id.slice(0, 8)}`;

const dueDateFromIssue = (issueDate: string) =>
  issueDate
    ? format(addDays(new Date(`${issueDate}T00:00:00`), 14), "yyyy-MM-dd")
    : "";

const ItemSubLineEditor = ({
  form,
  index,
}: {
  form: UseFormReturn<DraftValues>;
  index: number;
}) => {
  const watched = useWatch({
    control: form.control,
    name: `items.${index}.subLines`,
  });
  const lines: string[] = Array.isArray(watched) ? watched : [];
  const append = () => {
    form.setValue(`items.${index}.subLines`, [...lines, ""], {
      shouldDirty: true,
    });
  };
  const removeAt = (subIndex: number) => {
    form.setValue(
      `items.${index}.subLines`,
      lines.filter((_, lineIndex) => lineIndex !== subIndex),
      { shouldDirty: true },
    );
  };
  return (
    <div className="mt-2 space-y-2 pl-10">
      {lines.map((_, subIndex) => (
        <div key={subIndex} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            className="h-8 text-sm"
            placeholder={`Breakdown line ${subIndex + 1}`}
            aria-label={`Breakdown line ${subIndex + 1} for item ${index + 1}`}
            {...form.register(`items.${index}.subLines.${subIndex}`)}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => removeAt(subIndex)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="bg-amber-300/70 hover:bg-amber-300"
        onClick={append}
      >
        <Plus className="h-3.5 w-3.5" />
        Add breakdown
      </Button>
    </div>
  );
};

export interface InvoiceIssuerSettings {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentInstructions?: string;
}

export const InvoiceWorkspace = ({
  issuerInfo = {},
}: {
  issuerInfo?: InvoiceIssuerSettings;
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [receptionOverride, setReceptionOverride] = useState<
    Record<string, boolean>
  >({});
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirm, setConfirm] = useState<"issue" | "delete" | "void" | null>(
    null,
  );

  const invoices = useInvoices({
    search: search || undefined,
    status,
    page: page - 1,
    size: 15,
  });
  const selected = useInvoice(selectedId);
  const deals = useDeals({ page: 0, size: 100 });
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const issueInvoice = useIssueInvoice();
  const deleteInvoice = useDeleteInvoice();
  const voidInvoice = useVoidInvoice();
  const sendInvoice = useSendInvoice();
  const confirmReception = useConfirmInvoiceReception();
  const recordPayment = useRecordInvoicePayment();

  const form = useForm<DraftValues>({
    resolver: zodResolver(draftSchema),
    mode: "onBlur",
    defaultValues: defaultDraft(),
  });
  const items = useFieldArray({ control: form.control, name: "items" });
  const sendForm = useForm<SendValues>({
    resolver: zodResolver(sendSchema),
    mode: "onBlur",
    defaultValues: { email: "", subject: "", message: "" },
  });
  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    mode: "onBlur",
    defaultValues: {
      amount: 0,
      paymentMode: "BANK_TRANSFER",
      reference: "",
      paidAt: new Date().toISOString().slice(0, 16),
    },
  });
  const dealId = useWatch({ control: form.control, name: "dealId" });
  const draftValues = useWatch({ control: form.control });
  const paymentMode = useWatch({
    control: paymentForm.control,
    name: "paymentMode",
  });

  const invoice = selected.data;
  const selectedDeal = useDeal(dealId);
  const selectedLead = useLead(selectedDeal.data?.leadId ?? "");
  const editable = !invoice || invoice.status === "DRAFT";
  const busy = createInvoice.isPending || updateInvoice.isPending;
  const autofillDealRef = useRef("");

  useEffect(() => {
    if (!invoice) return;
    form.reset(toDraftValues(invoice));
  }, [form, invoice]);

  useEffect(() => {
    const relatedLead = selectedLead.data;
    if (!dealId || !relatedLead || autofillDealRef.current === dealId) return;
    autofillDealRef.current = dealId;
    const leadName = [relatedLead.firstName, relatedLead.lastName]
      .filter(Boolean)
      .join(" ");
    form.setValue("recipientName", leadName || relatedLead.companyName || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("recipientCompany", relatedLead.companyName || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("recipientEmail", relatedLead.email || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("recipientAddress", relatedLead.address || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    const first = form.getValues("items.0");
    const contractTouched = Number(first?.unitPrice ?? 0) > 0;
    const descriptionTouched =
      Boolean(first?.description) && first?.description !== "Service";
    if (!contractTouched && !descriptionTouched) {
      form.setValue("items.0.description", "Service", {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue(
        "items.0.unitPrice",
        selectedDeal.data?.contractValue ?? 0,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
      form.setValue("items.0.quantity", 1, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [dealId, form, selectedLead.data, selectedDeal.data]);

  const selectInvoice = (item: Invoice) => {
    setSelectedId(item.id);
    sendForm.reset({
      email: item.recipientEmail ?? "",
      subject: item.invoiceNumber
        ? `Invoice ${item.invoiceNumber} from Skytech`
        : "",
      message: "Please find your invoice attached.",
    });
  };

  const startNew = () => {
    setSelectedId("");
    form.reset(defaultDraft());
  };

  const save = form.handleSubmit(async (values) => {
    const request = requestFrom(values);
    if (invoice) {
      const response = await updateInvoice.mutateAsync({
        id: invoice.id,
        data: { ...request, version: invoice.version },
      });
      form.reset(toDraftValues(response.data.data));
      return;
    }
    const response = await createInvoice.mutateAsync(request);
    setSelectedId(response.data.data.id);
  });

  const download = async () => {
    if (!invoice) return;
    try {
      if (isMobile()) {
        await openInvoicePdf(previewData);
      } else {
        await downloadInvoicePDF(
          previewData,
          `${invoice.invoiceNumber ?? "invoice"}.pdf`,
        );
      }
      toast.success("Invoice PDF downloaded.");
    } catch {
      toast.error("The invoice PDF could not be generated.");
    }
  };

  const runConfirmedAction = async () => {
    if (!invoice || !confirm) return;
    if (confirm === "issue") await issueInvoice.mutateAsync(invoice.id);
    if (confirm === "delete") {
      await deleteInvoice.mutateAsync(invoice.id);
      startNew();
    }
    if (confirm === "void") await voidInvoice.mutateAsync(invoice.id);
    setConfirm(null);
  };

  const actionPending =
    issueInvoice.isPending || deleteInvoice.isPending || voidInvoice.isPending;
  const canSend = Boolean(
    invoice &&
    selectedLead.data?.emailOptIn &&
    ["ISSUED", "SENT", "SEND_FAILED"].includes(invoice.status),
  );
  const canPay = Boolean(
    invoice && !["DRAFT", "SENDING", "PAID", "VOID"].includes(invoice.status),
  );
  const canVoid = Boolean(
    invoice &&
    invoice.amountPaid === 0 &&
    ["ISSUED", "SENT", "SEND_FAILED"].includes(invoice.status),
  );
  const previewLead = selectedLead.data;
  const previewLeadName = [previewLead?.firstName, previewLead?.lastName]
    .filter(Boolean)
    .join(" ");
  const previewRecipientName =
    draftValues.recipientName ||
    previewLeadName ||
    previewLead?.companyName ||
    "Recipient";
  const previewCompany =
    draftValues.recipientCompany || previewLead?.companyName || "";
  const previewEmail = draftValues.recipientEmail || previewLead?.email || "";
  const previewAddress =
    draftValues.recipientAddress || previewLead?.address || "";
  const chosenIssueDate =
    draftValues.issueDate ||
    (invoice?.issueDate ? String(invoice.issueDate) : "") ||
    "";
  const computedDueDate = dueDateFromIssue(chosenIssueDate);
  const previewDate = chosenIssueDate
    ? formatDate(chosenIssueDate)
    : invoice
      ? formatDate(invoice.createdAt)
      : "—";
  const previewDue =
    computedDueDate || (invoice?.dueDate ? formatDate(invoice.dueDate) : "—");
  const previewData: InvoiceData = {
    issuerName: issuerInfo.name || "Skytech Ghana",
    issuerTagline: "Customer Relations",
    issuerEmail: issuerInfo.email || undefined,
    issuerPhone: issuerInfo.phone || undefined,
    issuerAddress: issuerInfo.address || undefined,
    issuerTaxId: issuerInfo.taxId || undefined,
    paymentInstructions: issuerInfo.paymentInstructions || undefined,
    logoUrl: "/assets/skytech_Logo.png",
    clientName: previewRecipientName,
    clientCompany: previewCompany,
    clientAddress: [previewEmail, previewAddress].filter(Boolean).join("\n"),
    invoiceNo:
      invoice?.invoiceNumber ??
      (invoice ? `Draft ${invoice.id.slice(0, 8)}` : "New draft"),
    date: previewDate,
    dueDate: previewDue,
    items: (draftValues.items ?? []).map((item) => ({
      description: item.description || "Line item",
      rate: Number(item.unitPrice || 0),
      qty: Number(item.quantity || 0),
      subLines: (item.subLines ?? []).filter((line) => line.trim()),
    })),
    taxRatePercent: Number(draftValues.taxRate ?? 0) || 0,
    discountAmount: Number(draftValues.discountAmount ?? 0) || 0,
    bankName: "-",
    accountName: "Skytech Ghana",
    accountNumber: "0-",
    signatureName: "Daniel Agblo",
  };

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
  const openPreview = async () => {
    try {
      await openInvoicePdf(previewData);
    } catch {
      toast.error("The invoice PDF could not be generated.");
    }
  };

  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(680px,.98fr)_minmax(0,1.02fr)] min-[2200px]:grid-cols-[minmax(820px,.9fr)_1.1fr]">
      <section className="overflow-hidden border bg-card xl:min-h-[calc(100vh-125px)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium">
                {invoice ? displayNumber(invoice) : "New invoice draft"}
              </h2>
              {invoice && <StatusBadge status={invoice.status} />}
              {invoice?.status === "SENDING" && (
                <LoaderCircle className="h-4 w-4 animate-spin text-info" />
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {editable
                ? "The backend calculates every financial total when you save."
                : "Issued financial values are frozen and authoritative."}
            </p>
          </div>
          <Button variant="outline" onClick={startNew}>
            <FilePlus2 className="h-4 w-4" />
            New draft
          </Button>
        </div>

        {selected.isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-72" />
          </div>
        ) : (
          <form className="space-y-5 p-4 sm:p-5" onSubmit={save}>
            <fieldset
              disabled={!editable || busy}
              className="space-y-5 disabled:opacity-70"
            >
              <div>
                <div>
                  <Label>Related deal</Label>
                  <Select
                    value={dealId}
                    onValueChange={(value) =>
                      form.setValue("dealId", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {(deals.data?.content ?? []).map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.dealId && (
                    <p className="text-xs text-danger">
                      {form.formState.errors.dealId.message}
                    </p>
                  )}
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-xl border bg-background p-4">
                    <h3 className="mb-3 text-sm font-semibold">Bill to</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Recipient name</Label>
                        <Input
                          {...form.register("recipientName")}
                          placeholder="Use lead details when blank"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input {...form.register("recipientCompany")} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          {...form.register("recipientEmail")}
                        />
                        {form.formState.errors.recipientEmail && (
                          <p className="text-xs text-danger">
                            {form.formState.errors.recipientEmail.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Billing address</Label>
                        <Input {...form.register("recipientAddress")} />
                      </div>
                    </div>
                  </section>
                  <section className="rounded-xl border bg-background p-4">
                    <h3 className="mb-3 text-sm font-semibold">From</h3>
                    <dl className="mb-4 space-y-2 rounded-lg bg-primary/10 p-3 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Company</dt>
                        <dd className="font-medium">
                          {issuerInfo.name || "Skytech Ghana"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="truncate font-medium">
                          {issuerInfo.email || "Not configured"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="truncate font-medium">
                          {issuerInfo.address || "Not configured"}
                        </dd>
                      </div>
                    </dl>
                    <div className="space-y-3">
                      <div>
                        <Label>Issue date</Label>
                        <Input type="date" {...form.register("issueDate")} />
                      </div>
                      <div>
                        <Label>Due date (auto)</Label>
                        <Input
                          type="date"
                          readOnly
                          tabIndex={-1}
                          value={dueDateFromIssue(draftValues.issueDate ?? "")}
                          aria-label="Due date, calculated 14 days from the issue date"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          14 days from the issue date.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[620px]">
                  <div className="mb-2 grid grid-cols-[1fr_86px_130px_38px] gap-2 bg-primary/70 px-3 py-2 text-sm font-medium text-black">
                    <span>Item</span>
                    <span>Quantity</span>
                    <span>Rate</span>
                    <span />
                  </div>
                  {items.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="mb-2 border-b bg-background px-3 py-2"
                    >
                      <div className="grid grid-cols-[1fr_86px_130px_38px] gap-2">
                        <Input
                          aria-label={`Line item ${index + 1}`}
                          {...form.register(`items.${index}.description`)}
                        />
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`items.${index}.unitPrice`, {
                            valueAsNumber: true,
                          })}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={items.fields.length === 1}
                          onClick={() => items.remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <ItemSubLineEditor form={form} index={index} />
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="w-full rounded-none bg-amber-300/70 text-foreground hover:bg-amber-300"
                    onClick={() =>
                      items.append({
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        subLines: [],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add line item
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,.9fr)]">
                <div className="space-y-3">
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      className="min-h-20"
                      {...form.register("notes")}
                    />
                  </div>
                  <div>
                    <Label>Terms & conditions</Label>
                    <Textarea
                      className="min-h-28"
                      {...form.register("terms")}
                    />
                  </div>
                </div>
                <div className="space-y-3 rounded-xl border bg-muted/25 p-4">
                  <div className="grid grid-cols-[1fr_120px] items-center gap-3">
                    <Label>Tax rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      {...form.register("taxRate", { valueAsNumber: true })}
                    />
                    <Label>Discount amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register("discountAmount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="border-t pt-3">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      Server-calculated totals
                    </div>
                    {invoice ? (
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Subtotal</dt>
                          <dd>{formatCurrency(invoice.subtotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Tax</dt>
                          <dd>{formatCurrency(invoice.taxAmount)}</dd>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base">
                          <dt>Total</dt>
                          <dd className="font-semibold">
                            {formatCurrency(invoice.total)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Paid</dt>
                          <dd>{formatCurrency(invoice.amountPaid || 0)}</dd>
                        </div>
                        <div className="flex justify-between text-base">
                          <dt>Balance due</dt>
                          <dd className="font-semibold">
                            {formatCurrency(invoice.balanceDue)}
                          </dd>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <dt>Draft version</dt>
                          <dd>{invoice.version}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-xs leading-5 text-muted-foreground">
                        Save the draft to receive authoritative subtotal, tax,
                        total, and balance values from the backend.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>

            {invoice?.status === "SEND_FAILED" && (
              <div className="rounded-xl border border-danger/30 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                <p className="font-semibold">Delivery failed</p>
                <p className="mt-1">
                  {invoice.lastSendError ||
                    "The mail provider did not return a detailed error."}
                </p>
              </div>
            )}

            {invoice && !["DRAFT", "VOID"].includes(invoice.status) && (
              <label className="flex items-start gap-3 rounded-xl border p-4">
                <Checkbox
                  className="mt-0.5"
                  checked={
                    receptionOverride[invoice.id] ?? invoice.receptionConfirmed
                  }
                  disabled={
                    invoice.receptionConfirmed || confirmReception.isPending
                  }
                  onCheckedChange={(checked) => {
                    if (!checked || invoice.receptionConfirmed) return;
                    setReceptionOverride((current) => ({
                      ...current,
                      [invoice.id]: true,
                    }));
                    confirmReception.mutate(invoice.id, {
                      onError: () =>
                        setReceptionOverride((current) => {
                          const next = { ...current };
                          delete next[invoice.id];
                          return next;
                        }),
                    });
                  }}
                />
                <span>
                  <span className="block text-sm font-semibold">
                    Invoice reception confirmed
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Check only after the client has definitely received the
                    invoice by email, print, or in person.
                  </span>
                </span>
              </label>
            )}

            {invoice &&
              !selectedLead.data?.emailOptIn &&
              !["DRAFT", "VOID"].includes(invoice.status) && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                  This client has not consented to email communication. Provide
                  a printed copy, then confirm reception above.
                </div>
              )}

            <div className="flex flex-wrap justify-end gap-2 border-t pt-5 sm:[&_button]:min-w-36">
              {editable && (
                <Button type="submit" disabled={busy}>
                  {busy
                    ? "Saving…"
                    : invoice
                      ? "Save full draft"
                      : "Create draft"}
                </Button>
              )}
              {invoice?.status === "DRAFT" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirm("issue")}
                  >
                    Issue invoice
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirm("delete")}
                  >
                    Delete draft
                  </Button>
                </>
              )}
              {invoice && invoice.status !== "DRAFT" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void download()}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isMobile()) void openPreview();
                  else setPreviewOpen(true);
                }}
              >
                Preview
              </Button>
              {canSend && (
                <Button type="button" onClick={() => setSendOpen(true)}>
                  <Send className="h-4 w-4" />
                  {invoice?.status === "SEND_FAILED" ? "Retry send" : "Send"}
                </Button>
              )}
              {canPay && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    paymentForm.setValue("amount", invoice?.balanceDue ?? 0);
                    setPaymentOpen(true);
                  }}
                >
                  <Banknote className="h-4 w-4" />
                  Record payment
                </Button>
              )}
              {canVoid && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirm("void")}
                >
                  Void invoice
                </Button>
              )}
            </div>
          </form>
        )}
      </section>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-full max-w-[95vw] lg:max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>Invoice preview</DialogTitle>
            <DialogDescription>
              Live preview of the current draft following the invoice template.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] w-full overflow-y-auto rounded-xl border">
            <InvoicePreview data={previewData} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
            <Button type="button" onClick={() => void openPreview()}>
              Open as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="h-fit min-h-[520px] overflow-hidden border bg-card xl:min-h-[calc(100vh-125px)]">
        <div className="flex flex-wrap gap-2 border-b p-4">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search invoices"
            />
          </div>
          <Select
            value={status ?? "ALL"}
            onValueChange={(value) => {
              setStatus(value === "ALL" ? undefined : (value as InvoiceStatus));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {[
                "DRAFT",
                "ISSUED",
                "SENDING",
                "SENT",
                "SEND_FAILED",
                "PARTIALLY_PAID",
                "PAID",
                "VOID",
              ].map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {invoices.isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : invoices.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Invoices could not be loaded"
            message="Check your connection and access, then try again."
          />
        ) : (invoices.data?.content.length ?? 0) === 0 ? (
          <EmptyState
            icon={Mail}
            title="No invoices found"
            message="Create a draft or adjust the current filters."
          />
        ) : (
          <div className="divide-y overflow-x-auto">
            <div className="grid min-w-[520px] grid-cols-[1fr_auto] gap-3 bg-muted/70 px-4 py-3 text-xs font-medium text-muted-foreground">
              <span>Invoice and customer</span>
              <span className="text-right">Updated</span>
            </div>
            {invoices.data?.content.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => selectInvoice(item)}
                className={`grid min-w-[520px] w-full grid-cols-[1fr_auto] items-center gap-3 p-4 text-left transition hover:bg-muted/60 ${selectedId === item.id ? "bg-primary/10" : ""}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {displayNumber(item)}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {item.recipientName ||
                      item.recipientCompany ||
                      "Recipient from deal"}{" "}
                    · {formatCurrency(item.total)}
                  </span>
                </span>
                <span className="text-right">
                  <StatusBadge status={item.status} />
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
        <Pagination
          page={page}
          totalPages={Math.max(invoices.data?.totalPages ?? 1, 1)}
          onPageChange={setPage}
        />
      </section>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send invoice</DialogTitle>
            <DialogDescription>
              The server will attach the generated PDF. Delivery status is
              checked automatically.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={sendForm.handleSubmit(async (values) => {
              if (!invoice) return;
              await sendInvoice.mutateAsync({
                id: invoice.id,
                data: {
                  email: values.email || undefined,
                  subject: values.subject || undefined,
                  message: values.message || undefined,
                },
              });
              setSendOpen(false);
            })}
          >
            <div>
              <Label>Email override</Label>
              <Input type="email" {...sendForm.register("email")} />
              {sendForm.formState.errors.email && (
                <p className="text-xs text-danger">
                  {sendForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label>Subject</Label>
              <Input {...sendForm.register("subject")} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                className="min-h-28"
                {...sendForm.register("message")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSendOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sendInvoice.isPending}>
                {sendInvoice.isPending ? "Queuing…" : "Queue email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record invoice payment</DialogTitle>
            <DialogDescription>
              This also creates the related PAYMENT deal log. Do not add another
              payment log.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={paymentForm.handleSubmit(async (values) => {
              if (!invoice) return;
              await recordPayment.mutateAsync({
                id: invoice.id,
                data: {
                  amount: values.amount,
                  paymentMode: values.paymentMode,
                  reference: values.reference || undefined,
                  paidAt: new Date(values.paidAt).toISOString(),
                },
              });
              setPaymentOpen(false);
            })}
          >
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="0.01"
                max={invoice?.balanceDue}
                step="0.01"
                {...paymentForm.register("amount", { valueAsNumber: true })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Current backend balance:{" "}
                {formatCurrency(invoice?.balanceDue ?? 0)}
              </p>
              {paymentForm.formState.errors.amount && (
                <p className="text-xs text-danger">
                  {paymentForm.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <Label>Payment mode</Label>
              <Select
                value={paymentMode}
                onValueChange={(value: PaymentMode) =>
                  paymentForm.setValue("paymentMode", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["MOMO", "BANK_TRANSFER", "CASH", "CHEQUE"].map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference</Label>
              <Input {...paymentForm.register("reference")} />
            </div>
            <div>
              <Label>Paid at</Label>
              <Input
                type="datetime-local"
                {...paymentForm.register("paidAt")}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Recording…" : "Record payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm === "issue"
            ? "Issue this invoice?"
            : confirm === "delete"
              ? "Delete this draft?"
              : "Void this invoice?"
        }
        description={
          confirm === "issue"
            ? "Issuing freezes the number, line items, issuer details, and financial values."
            : confirm === "delete"
              ? "This editable draft will be permanently deleted."
              : "The invoice will be marked void. Only unpaid issued invoices can be voided."
        }
        confirmLabel={
          confirm === "issue"
            ? "Issue invoice"
            : confirm === "delete"
              ? "Delete draft"
              : "Void invoice"
        }
        pending={actionPending}
        onConfirm={() => void runConfirmedAction()}
      />
    </div>
  );
};
