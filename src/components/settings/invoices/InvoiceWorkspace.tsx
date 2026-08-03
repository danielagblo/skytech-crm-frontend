"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Eye, Mail, Plus, Search, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

const itemSchema = z.object({
  description: z.string().trim().min(2, "Describe this item."),
  quantity: z.coerce.number().positive("Quantity must be above zero."),
  rate: z.coerce.number().min(0, "Rate cannot be negative."),
});
const schema = z.object({
  invoiceNumber: z.string().trim().min(2, "Enter an invoice number."),
  customer: z.string().trim().min(2, "Enter the customer name."),
  email: z.string().email("Enter a valid customer email."),
  address: z.string().trim().min(3, "Enter the billing address."),
  company: z.string().trim().min(2, "Enter the company name."),
  notes: z.string().max(500).optional(),
  terms: z.string().max(500).optional(),
  discount: z.coerce.number().min(0).max(100),
  tax: z.coerce.number().min(0).max(100),
  items: z.array(itemSchema).min(1),
});
type InvoiceValues = z.infer<typeof schema>;
type SavedInvoice = InvoiceValues & {
  id: string;
  createdAt: string;
  total: number;
};
const storageKey = "skytech_local_invoices";
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

const invoiceHtml = (values: InvoiceValues, total: number) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(values.invoiceNumber)}</title><style>body{font:14px Arial;padding:48px;color:#111827}h1{font-size:30px}.meta{display:flex;justify-content:space-between;margin:32px 0}table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #e5e7eb;text-align:left}th{background:#4ade80}.totals{margin:28px 0 0 auto;width:300px}.totals p{display:flex;justify-content:space-between}.total{font-size:18px;font-weight:700}</style></head><body><h1>Invoice ${escapeHtml(values.invoiceNumber)}</h1><div class="meta"><div><strong>Bill to</strong><p>${escapeHtml(values.customer)}<br>${escapeHtml(values.company)}<br>${escapeHtml(values.address)}<br>${escapeHtml(values.email)}</p></div><div><strong>Skytech CRM</strong><p>Generated ${new Date().toLocaleDateString()}</p></div></div><table><thead><tr><th>Item</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${values.items.map((item) => `<tr><td>${escapeHtml(item.description)}</td><td>${item.quantity}</td><td>${formatCurrency(item.rate)}</td><td>${formatCurrency(item.quantity * item.rate)}</td></tr>`).join("")}</tbody></table><div class="totals"><p class="total"><span>Balance due</span><span>${formatCurrency(total)}</span></p></div><h3>Notes</h3><p>${escapeHtml(values.notes ?? "")}</p><h3>Terms &amp; conditions</h3><p>${escapeHtml(values.terms ?? "")}</p></body></html>`;

export const InvoiceWorkspace = () => {
  const [history, setHistory] = useState<SavedInvoice[]>([]);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(false);
  const form = useForm<InvoiceValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-001`,
      customer: "",
      email: "",
      address: "",
      company: "",
      notes: "",
      terms: "Payment due within 14 days.",
      discount: 0,
      tax: 0,
      items: [{ description: "", quantity: 1, rate: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const values = useWatch({ control: form.control });
  const subtotal = (values.items ?? []).reduce(
    (sum, item) => sum + Number(item?.quantity ?? 0) * Number(item?.rate ?? 0),
    0,
  );
  const total = Math.max(
    0,
    subtotal *
      (1 - Number(values.discount ?? 0) / 100) *
      (1 + Number(values.tax ?? 0) / 100),
  );
  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        setHistory(
          JSON.parse(
            localStorage.getItem(storageKey) ?? "[]",
          ) as SavedInvoice[],
        );
      } catch {
        setHistory([]);
      }
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);
  const filtered = useMemo(
    () =>
      history.filter((item) =>
        `${item.invoiceNumber} ${item.customer} ${item.company}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [history, search],
  );
  const persist = (data: InvoiceValues) => {
    const saved: SavedInvoice = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      total,
    };
    const next = [
      saved,
      ...history.filter((item) => item.invoiceNumber !== data.invoiceNumber),
    ];
    localStorage.setItem(storageKey, JSON.stringify(next));
    setHistory(next);
    return saved;
  };
  const download = form.handleSubmit((data) => {
    persist(data);
    const url = URL.createObjectURL(
      new Blob([invoiceHtml(data, total)], { type: "text/html" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.invoiceNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded and saved to this device.");
  });
  const send = form.handleSubmit((data) => {
    persist(data);
    window.open(
      `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(`Invoice ${data.invoiceNumber}`)}&body=${encodeURIComponent(`Hello ${data.customer},\n\nYour invoice balance is ${formatCurrency(total)}. The invoice has been prepared in Skytech CRM.`)}`,
      "_self",
    );
    toast.success("Invoice saved. Your email app is opening.");
  });
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(560px,.9fr)_1.3fr]">
      <section className="surface p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Generate invoice</h2>
            <p className="text-sm text-muted-foreground">
              Create a printable invoice and keep a local history.
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium">
            {values.invoiceNumber}
          </span>
        </div>
        <form className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Invoice number</Label>
              <Input {...form.register("invoiceNumber")} />
              {form.formState.errors.invoiceNumber && (
                <p className="text-xs text-danger">
                  {form.formState.errors.invoiceNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label>Customer</Label>
              <Input placeholder="John Alan" {...form.register("customer")} />
              {form.formState.errors.customer && (
                <p className="text-xs text-danger">
                  {form.formState.errors.customer.message}
                </p>
              )}
            </div>
            <div>
              <Label>Company</Label>
              <Input {...form.register("company")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} />
            </div>
            <div className="sm:col-span-2">
              <Label>Billing address</Label>
              <Input {...form.register("address")} />
            </div>
          </div>
          <div>
            <div className="mb-2 grid grid-cols-[1fr_80px_110px_36px] gap-2 text-xs font-medium uppercase text-muted-foreground">
              <span>Item</span>
              <span>Qty</span>
              <span>Rate</span>
              <span />
            </div>
            {fields.map((field, index) => (
              <div
                className="mb-2 grid grid-cols-[1fr_80px_110px_36px] gap-2"
                key={field.id}
              >
                <Input
                  aria-label={`Item ${index + 1}`}
                  {...form.register(`items.${index}.description`)}
                />
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...form.register(`items.${index}.quantity`)}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register(`items.${index}.rate`)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: 1, rate: 0 })}
            >
              <Plus className="h-4 w-4" />
              Add line item
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Note</Label>
              <Textarea {...form.register("notes")} />
            </div>
            <div>
              <Label>Terms &amp; conditions</Label>
              <Textarea {...form.register("terms")} />
            </div>
          </div>
          <div className="ml-auto max-w-sm space-y-2 rounded-xl bg-muted/50 p-4">
            <p className="flex justify-between text-sm">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Label>
                Discount %<Input type="number" {...form.register("discount")} />
              </Label>
              <Label>
                Tax %<Input type="number" {...form.register("tax")} />
              </Label>
            </div>
            <p className="flex justify-between border-t pt-3 text-base">
              <span>Balance due</span>
              <strong>{formatCurrency(total)}</strong>
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" onClick={() => void send()}>
              <Mail className="h-4 w-4" />
              Save &amp; send
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void download()}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit(() => setPreview(true))}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </form>
      </section>
      <section className="surface min-h-[560px] overflow-hidden">
        <div className="border-b p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No invoices saved"
            message="Create and save your first invoice to build a history on this device."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="p-3">Invoice name</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium">{item.invoiceNumber}</td>
                    <td className="p-3">{item.customer}</td>
                    <td className="p-3">{formatCurrency(item.total)}</td>
                    <td className="p-3">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice preview</DialogTitle>
            <DialogDescription>
              Review the invoice before downloading or sending it.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border bg-white p-6 text-slate-900">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Invoice</h2>
                <p>{values.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <strong>Skytech CRM</strong>
                <p className="text-sm">
                  {values.customer}
                  <br />
                  {values.company}
                </p>
              </div>
            </div>
            <div className="mt-6 divide-y border-y">
              {(values.items ?? []).map((item, index) => (
                <div key={index} className="flex justify-between py-3">
                  <span>
                    {item?.description || "Untitled item"} ×{" "}
                    {item?.quantity ?? 0}
                  </span>
                  <strong>
                    {formatCurrency(
                      Number(item?.quantity ?? 0) * Number(item?.rate ?? 0),
                    )}
                  </strong>
                </div>
              ))}
            </div>
            <p className="mt-5 flex justify-between text-lg">
              <span>Balance due</span>
              <strong>{formatCurrency(total)}</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
