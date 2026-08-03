"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
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
  useDeleteInvoice,
  useInvoice,
  useInvoices,
  useIssueInvoice,
  useRecordInvoicePayment,
  useSendInvoice,
  useUpdateInvoice,
  useVoidInvoice,
} from "@/hooks/useInvoices";
import { invoicesService } from "@/services/invoices.service";
import type { PaymentMode } from "@/types/api.types";
import type {
  Invoice,
  InvoiceDraftRequest,
  InvoiceStatus,
} from "@/types/invoice.types";
import { formatCurrency, formatDate } from "@/lib/utils";

const itemSchema = z.object({
  description: z.string().trim().min(2, "Describe this line item.").max(500),
  quantity: z.number().positive("Quantity must be above zero."),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
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
  dueDate: z.union([
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
  dueDate: "",
  taxRate: 0,
  discountAmount: 0,
  notes: "",
  terms: "Payment is due within 14 days.",
  items: [{ description: "", quantity: 1, unitPrice: 0 }],
});

const toDraftValues = (invoice: Invoice): DraftValues => ({
  dealId: invoice.dealId,
  recipientName: invoice.recipientName ?? "",
  recipientCompany: invoice.recipientCompany ?? "",
  recipientEmail: invoice.recipientEmail ?? "",
  recipientAddress: invoice.recipientAddress ?? "",
  dueDate: invoice.dueDate ?? "",
  taxRate: invoice.taxRate,
  discountAmount: invoice.discountAmount,
  notes: invoice.notes ?? "",
  terms: invoice.terms ?? "",
  items: invoice.items.map(({ description, quantity, unitPrice }) => ({
    description,
    quantity,
    unitPrice,
  })),
});

const requestFrom = (values: DraftValues): InvoiceDraftRequest => ({
  dealId: values.dealId,
  recipientName: values.recipientName || undefined,
  recipientCompany: values.recipientCompany || undefined,
  recipientEmail: values.recipientEmail || undefined,
  recipientAddress: values.recipientAddress || undefined,
  dueDate: values.dueDate || undefined,
  currency: "GHS",
  taxRate: values.taxRate,
  discountAmount: values.discountAmount,
  notes: values.notes || undefined,
  terms: values.terms || undefined,
  items: values.items.map(({ description, quantity, unitPrice }) => ({
    description,
    quantity,
    unitPrice,
  })),
});

const displayNumber = (invoice: Invoice) =>
  invoice.invoiceNumber ?? `Draft ${invoice.id.slice(0, 8)}`;

export const InvoiceWorkspace = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
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
  const paymentMode = useWatch({
    control: paymentForm.control,
    name: "paymentMode",
  });

  const invoice = selected.data;
  const editable = !invoice || invoice.status === "DRAFT";
  const busy = createInvoice.isPending || updateInvoice.isPending;

  useEffect(() => {
    if (!invoice) return;
    form.reset(toDraftValues(invoice));
  }, [form, invoice]);

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
      const response = await invoicesService.downloadPdf(invoice.id);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice.invoiceNumber ?? "invoice"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Invoice PDF downloaded.");
    } catch {
      toast.error("The invoice PDF could not be downloaded.");
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
    invoice && ["ISSUED", "SENT", "SEND_FAILED"].includes(invoice.status),
  );
  const canPay = Boolean(
    invoice && !["DRAFT", "SENDING", "PAID", "VOID"].includes(invoice.status),
  );
  const canVoid = Boolean(
    invoice &&
    invoice.paidAmount === 0 &&
    ["ISSUED", "SENT", "SEND_FAILED"].includes(invoice.status),
  );

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(600px,.95fr)_1.05fr]">
      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {invoice ? displayNumber(invoice) : "New invoice draft"}
              </h2>
              {invoice && <StatusBadge status={invoice.status} />}
              {invoice?.status === "SENDING" && (
                <LoaderCircle className="h-4 w-4 animate-spin text-info" />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
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
                  <Input type="email" {...form.register("recipientEmail")} />
                  {form.formState.errors.recipientEmail && (
                    <p className="text-xs text-danger">
                      {form.formState.errors.recipientEmail.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Due date</Label>
                  <Input type="date" {...form.register("dueDate")} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Billing address</Label>
                  <Input {...form.register("recipientAddress")} />
                </div>
              </div>

              <div>
                <div className="mb-2 grid grid-cols-[1fr_86px_130px_38px] gap-2 text-xs font-medium uppercase text-muted-foreground">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Unit price</span>
                  <span />
                </div>
                {items.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="mb-2 grid grid-cols-[1fr_86px_130px_38px] gap-2"
                  >
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
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    items.append({ description: "", quantity: 1, unitPrice: 0 })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add line item
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Tax rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...form.register("taxRate", { valueAsNumber: true })}
                  />
                </div>
                <div>
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
                <div>
                  <Label>Notes</Label>
                  <Textarea {...form.register("notes")} />
                </div>
                <div>
                  <Label>Terms</Label>
                  <Textarea {...form.register("terms")} />
                </div>
              </div>
            </fieldset>

            {invoice && (
              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Server-calculated totals
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <p>
                    <span className="block text-xs text-muted-foreground">
                      Subtotal
                    </span>
                    {formatCurrency(invoice.subtotal)}
                  </p>
                  <p>
                    <span className="block text-xs text-muted-foreground">
                      Tax
                    </span>
                    {formatCurrency(invoice.taxAmount)}
                  </p>
                  <p>
                    <span className="block text-xs text-muted-foreground">
                      Total
                    </span>
                    <strong>{formatCurrency(invoice.total)}</strong>
                  </p>
                  <p>
                    <span className="block text-xs text-muted-foreground">
                      Paid
                    </span>
                    {formatCurrency(invoice.paidAmount)}
                  </p>
                  <p>
                    <span className="block text-xs text-muted-foreground">
                      Balance
                    </span>
                    <strong>{formatCurrency(invoice.balanceDue)}</strong>
                  </p>
                  <p>
                    <span className="block text-xs text-muted-foreground">
                      Version
                    </span>
                    {invoice.version}
                  </p>
                </div>
              </div>
            )}

            {invoice?.status === "SEND_FAILED" && (
              <div className="rounded-xl border border-danger/30 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                <p className="font-semibold">Delivery failed</p>
                <p className="mt-1">
                  {invoice.lastSendError ||
                    "The mail provider did not return a detailed error."}
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
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

      <section className="surface h-fit overflow-hidden">
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
          <div className="divide-y">
            {invoices.data?.content.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => selectInvoice(item)}
                className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/60 ${selectedId === item.id ? "bg-primary/10" : ""}`}
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
