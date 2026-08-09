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
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIRECTIONS: {
  value: "OUTGOING" | "INCOMING";
  label: string;
  icon: string;
  activeClass: string;
}[] = [
  {
    value: "OUTGOING",
    label: "Outgoing",
    icon: "/assets/outgoing-call.svg",
    activeClass:
      "[filter:invert(33%)_sepia(97%)_saturate(2244%)_hue-rotate(195deg)_brightness(96%)_contrast(96%)]",
  },
  {
    value: "INCOMING",
    label: "Incoming",
    icon: "/assets/incoming-call.svg",
    activeClass:
      "[filter:invert(33%)_sepia(97%)_saturate(2244%)_hue-rotate(195deg)_brightness(96%)_contrast(96%)]",
  },
];

const RESPONSES: {
  value: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  label: string;
  icon: string;
  activeClass: string;
  labelClass: string;
}[] = [
  {
    value: "POSITIVE",
    label: "Positive",
    icon: "/assets/happy-face.svg",
    activeClass:
      "[filter:invert(48%)_sepia(13%)_saturate(1087%)_hue-rotate(80deg)_brightness(115%)_contrast(101%)]",
    labelClass: "text-green-600",
  },
  {
    value: "NEUTRAL",
    label: "Neutral",
    icon: "/assets/neutral-face.svg",
    activeClass:
      "[filter:invert(59%)_sepia(97%)_saturate(663%)_hue-rotate(5deg)_brightness(99%)_contrast(99%)]",
    labelClass: "text-yellow-600",
  },
  {
    value: "NEGATIVE",
    label: "Negative",
    icon: "/assets/sad-face.svg",
    activeClass:
      "[filter:invert(37%)_sepia(93%)_saturate(2101%)_hue-rotate(343deg)_brightness(90%)_contrast(95%)]",
    labelClass: "text-red-600",
  },
];

const parseDurationSeconds = (raw: string): number => {
  const text = raw.trim();
  if (!text) return 0;
  if (/[.:]/.test(text)) {
    const parts = text.split(/[.:]/).map((part) => Number(part));
    if (parts.some((part) => !Number.isFinite(part) || part < 0)) return NaN;
    if (parts.length > 3) return NaN;
    let total = 0;
    parts.forEach((part, index) => {
      total += part * Math.pow(60, parts.length - 1 - index);
    });
    return Math.round(total);
  }
  const minutes = Number(text);
  return Number.isFinite(minutes) && minutes >= 0
    ? Math.round(minutes * 60)
    : NaN;
};

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
    duration: z.string().refine(
      (value) => {
        const text = value.trim();
        if (!text) return true;
        const seconds = parseDurationSeconds(text);
        return Number.isFinite(seconds) && seconds >= 0 && seconds <= 240 * 60;
      },
      { message: "Enter minutes (e.g. 5) or minutes and seconds (e.g. 5.30 or 5:30)." },
    ),
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
      duration: "",
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
                callDurationSeconds: parseDurationSeconds(data.duration),
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
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {DIRECTIONS.map((option) => {
              const selected = values.direction === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("direction", option.value)}
                  className="flex flex-col items-center gap-1"
                >
                  <img
                    src={option.icon}
                    alt={option.label}
                    className={cn("h-8 w-8", selected && option.activeClass)}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      selected ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.direction && (
            <p className="text-xs text-danger">{errors.direction.message}</p>
          )}
        </div>
        <div>
          <Label>Call outcome</Label>
          <div className="[&>button]:mt-1.5">
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
          </div>
          {errors.outcome && (
            <p className="text-xs text-danger">{errors.outcome.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label>Call duration</Label>
        <Input
          inputMode="decimal"
          placeholder="minutes and seconds, e.g. 5.30 or 5:30"
          {...register("duration")}
        />
        {errors.duration && (
          <p className="text-xs text-danger">{errors.duration.message}</p>
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
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {RESPONSES.map((option) => {
                const selected = values.response === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("response", option.value)}
                    className="flex flex-col items-center gap-1"
                  >
                    <img
                      src={option.icon}
                      alt={option.label}
                      className={cn("h-8 w-8", selected && option.activeClass)}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        selected ? option.labelClass : "text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
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