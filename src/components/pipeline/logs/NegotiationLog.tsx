"use client";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Deal, DealLog } from "@/types/deal.types";
import type { User } from "@/types/user.types";
import type { ContactMode, ResponseType } from "@/types/api.types";
import { useAddDealLog } from "@/hooks/useDeals";
import { LogFeed } from "../LogFeed";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z
  .object({
    mode: z.enum(["PHONE_CALL", "EMAIL", "IN_PERSON", "WHATSAPP"]),
    direction: z
      .enum(["OUTGOING", "INCOMING"])
      .optional()
      .or(z.literal("")),
    outcome: z
      .enum(["COMPLETED", "NETWORK_INTERRUPTION", "CUSTOMER_HUNG_UP", "NO_RESPONSE"])
      .optional()
      .or(z.literal("")),
    durationMin: z.coerce.number().min(0).max(240).optional(),
    response: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL", "NO_RESPONSE"]),
    followUp: z.string().min(1, "Choose a follow-up date."),
    body: z.string().min(3, "Describe the client response."),
  })
  .superRefine((values, ctx) => {
    if (values.mode !== "PHONE_CALL") return;
    if (!values.direction)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a call direction.",
        path: ["direction"],
      });
    if (!values.outcome)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a call outcome.",
        path: ["outcome"],
      });
  });
type Values = z.infer<typeof schema>;

export const NegotiationLog = ({
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
      mode: "PHONE_CALL",
      direction: "",
      outcome: "",
      durationMin: 0,
      response: "NEUTRAL",
      followUp: "",
      body: "",
    },
  });
  const values = useWatch({ control });
  const isPhoneCall = values.mode === "PHONE_CALL";
  const submit = handleSubmit((data) =>
    mutation.mutate(
      {
        dealId: deal.id,
        data: {
          logType: "NEGOTIATION",
          contactMode: data.mode as ContactMode,
          responseType: data.response as ResponseType,
          followUpAt: new Date(data.followUp).toISOString(),
          body: data.body,
          ...(isPhoneCall
            ? {
                callDirection: data.direction as "OUTGOING" | "INCOMING",
                callOutcome: data.outcome as
                  | "COMPLETED"
                  | "NETWORK_INTERRUPTION"
                  | "CUSTOMER_HUNG_UP"
                  | "NO_RESPONSE",
                callDurationSeconds: Math.round((data.durationMin ?? 0) * 60),
              }
            : {}),
        },
      },
      { onSuccess: () => reset() },
    ),
  );
  const phoneFields = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Call direction</Label>
          <Select
            value={values.direction ?? ""}
            onValueChange={(value) => setValue("direction", value as never)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OUTGOING">Outgoing</SelectItem>
              <SelectItem value="INCOMING">Incoming</SelectItem>
            </SelectContent>
          </Select>
          {errors.direction && (
            <p className="text-xs text-danger">{errors.direction.message}</p>
          )}
        </div>
        <div>
          <Label>Call outcome</Label>
          <Select
            value={values.outcome ?? ""}
            onValueChange={(value) => setValue("outcome", value as never)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="NETWORK_INTERRUPTION">
                Network interruption
              </SelectItem>
              <SelectItem value="CUSTOMER_HUNG_UP">Customer hung up</SelectItem>
              <SelectItem value="NO_RESPONSE">No response</SelectItem>
            </SelectContent>
          </Select>
          {errors.outcome && (
            <p className="text-xs text-danger">{errors.outcome.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label>Call duration (minutes)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          placeholder="e.g. 5"
          {...register("durationMin", { valueAsNumber: true })}
        />
        {errors.durationMin && (
          <p className="text-xs text-danger">{errors.durationMin.message}</p>
        )}
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      <form className="space-y-3 border-b pb-4" onSubmit={submit}>
        <h4 className="font-semibold">Add negotiation log</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Contact mode</Label>
            <Select
              value={values.mode}
              onValueChange={(value: ContactMode) => setValue("mode", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHONE_CALL">Phone call</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="IN_PERSON">In person</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Response type</Label>
            <Select
              value={values.response}
              onValueChange={(value: ResponseType) =>
                setValue("response", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POSITIVE">Positive</SelectItem>
                <SelectItem value="NEGATIVE">Negative</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
                <SelectItem value="NO_RESPONSE">No response</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isPhoneCall && phoneFields}
        <div>
          <Label>Follow-up date and time</Label>
          <Input type="datetime-local" {...register("followUp")} />
          {errors.followUp && (
            <p className="text-xs text-danger">{errors.followUp.message}</p>
          )}
        </div>
        <div>
          <Label>Feedback</Label>
          <Textarea {...register("body")} />
          {errors.body && (
            <p className="text-xs text-danger">{errors.body.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save log"}
        </Button>
      </form>
      <LogFeed dealId={deal.id} logs={logs} users={users} />
    </div>
  );
};