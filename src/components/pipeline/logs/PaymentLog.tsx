"use client";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Deal, DealLog } from "@/types/deal.types";
import type { User } from "@/types/user.types";
import type { PaymentMode } from "@/types/api.types";
import { useAddDealLog } from "@/hooks/useDeals";
import { LogFeed } from "../LogFeed";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const schema = z
  .object({
    amount: z.coerce.number().positive("Enter an amount greater than zero."),
    invoiceIssued: z.boolean(),
    invoice: z.string().optional(),
    receipt: z.string().min(1, "Enter a receipt number."),
    paymentType: z.enum(["DEPOSIT", "INSTALLMENT", "FINAL_PAYMENT"]),
    mode: z.enum(["MOMO", "BANK_TRANSFER", "CASH", "CHEQUE"]),
  })
  .superRefine((values, context) => {
    if (values.invoiceIssued && !values.invoice?.trim())
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["invoice"],
        message: "Enter the issued invoice number.",
      });
  });
type Values = z.infer<typeof schema>;
export const PaymentLog = ({
  deal,
  logs,
  users,
}: {
  deal: Deal;
  logs: DealLog[];
  users: User[];
}) => {
  const mutation = useAddDealLog();
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      invoiceIssued: true,
      paymentType: "INSTALLMENT",
      mode: "MOMO",
    },
  });
  const values = useWatch({ control });
  const submit = handleSubmit((data) =>
    mutation.mutate(
      {
        dealId: deal.id,
        data: {
          logType: "PAYMENT",
          amountPaid: data.amount,
          invoiceIssued: data.invoiceIssued,
          invoiceNumber: data.invoice || undefined,
          receiptNumber: data.receipt,
          paymentMode: data.mode as PaymentMode,
          body: `${data.paymentType.replaceAll("_", " ")} payment recorded.`,
        },
      },
      { onSuccess: () => reset() },
    ),
  );
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 rounded-xl bg-gray-900 p-3 text-white">
        {[
          ["Agreed amount", deal.contractValue],
          ["Total paid", deal.totalPaid],
          ["Left", deal.arrears],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <p className="text-[10px] text-gray-400">{label}</p>
            <p className="text-sm font-semibold">
              {formatCurrency(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3 border-b pb-4">
        <div>
          <Label>Amount</Label>
          <Input type="number" step="0.01" {...register("amount")} />
          {errors.amount && (
            <p className="text-xs text-danger">{errors.amount.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>Invoice issued</Label>
          <Switch
            checked={Boolean(values.invoiceIssued)}
            onCheckedChange={(checked) => setValue("invoiceIssued", checked)}
          />
        </div>
        {values.invoiceIssued && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            Issuing an invoice does not prove delivery. Open the invoice and check
            “Invoice reception confirmed” only after the client definitely receives it.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Invoice number</Label>
            <Input {...register("invoice")} />
            {errors.invoice && (
              <p className="text-xs text-danger">{errors.invoice.message}</p>
            )}
          </div>
          <div>
            <Label>Receipt number</Label>
            <Input {...register("receipt")} />
            {errors.receipt && (
              <p className="text-xs text-danger">{errors.receipt.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Payment type</Label>
            <Select
              value={values.paymentType}
              onValueChange={(value: Values["paymentType"]) =>
                setValue("paymentType", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEPOSIT">Deposit</SelectItem>
                <SelectItem value="INSTALLMENT">Installment</SelectItem>
                <SelectItem value="FINAL_PAYMENT">Final payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment mode</Label>
            <Select
              value={values.mode}
              onValueChange={(value: PaymentMode) => setValue("mode", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOMO">MoMo</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save payment"}
        </Button>
      </form>
      <LogFeed dealId={deal.id} logs={logs} users={users} />
    </div>
  );
};
