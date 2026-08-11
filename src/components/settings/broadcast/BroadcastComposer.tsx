"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Send } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateBroadcast,
  useScheduleBroadcast,
  useSendBroadcast,
} from "@/hooks/useBroadcast";
import { ContactSegmentSelector } from "./ContactSegmentSelector";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BroadcastChannel } from "@/types/api.types";
const schema = z.object({
  name: z.string().min(3, "Name this broadcast."),
  message: z.string().min(1, "Write a message.").max(160),
  channel: z.enum(["SMS", "EMAIL"]),
});
type Values = z.infer<typeof schema>;
export const BroadcastComposer = () => {
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [scheduleTimes, setScheduleTimes] = useState([""]);
  const create = useCreateBroadcast();
  const send = useSendBroadcast();
  const schedule = useScheduleBroadcast();
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
    defaultValues: { name: "", message: "", channel: "SMS" },
  });
  const values = useWatch({ control });
  const buildFilter = () => {
    if (!leadIds.length && !stages.length) return null;
    return {
      ...(leadIds.length ? { leadIds } : {}),
      ...(stages.length ? { stages } : {}),
    };
  };
  const process = (scheduled: boolean) =>
    handleSubmit(async (data) => {
      const segmentFilter = buildFilter();
      if (!segmentFilter) {
        toast.error("Select at least one audience group or contact.");
        return;
      }
      const times = scheduleTimes.map((value) => value.trim()).filter(Boolean);
      if (scheduled && times.length === 0) {
        toast.error("Add at least one future schedule time.");
        return;
      }
      try {
        if (scheduled) {
          for (const time of times) {
            if (new Date(time) <= new Date()) {
              toast.error("Choose only future schedule times.");
              return;
            }
            const created = await create.mutateAsync({
              name: data.name,
              messageContent: data.message,
              channel: data.channel as BroadcastChannel,
              segmentFilter,
            });
            await schedule.mutateAsync({
              id: created.data.data.id,
              scheduledAt: new Date(time).toISOString(),
            });
          }
        } else {
          const created = await create.mutateAsync({
            name: data.name,
            messageContent: data.message,
            channel: data.channel as BroadcastChannel,
            segmentFilter,
          });
          await send.mutateAsync(created.data.data.id);
        }
        reset();
        setLeadIds([]);
        setStages([]);
        setScheduleTimes([""]);
      } catch {
        /* Mutation hooks present the backend's actionable error. */
      }
    })();
  const pending = create.isPending || send.isPending || schedule.isPending;
  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(440px,1.15fr)_minmax(440px,.85fr)] min-[2200px]:grid-cols-[1.1fr_.9fr]">
      <ContactSegmentSelector
        selectedLeadIds={leadIds}
        selectedStages={stages}
        onLeadIdsChange={setLeadIds}
        onStagesChange={setStages}
      />
      <section className="border bg-card p-5">
        <div className="mb-5">
          <h2 className="text-lg font-normal text-slate-600">
            Message content
          </h2>
          <p className="text-sm text-muted-foreground">
            Only opted-in contacts with a valid destination receive a broadcast.
          </p>
        </div>
        <form className="space-y-4">
          <div>
            <Label>Broadcast name</Label>
            <Input
              placeholder="e.g. August payment reminder"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>Channel</Label>
            <Select
              value={values.channel}
              onValueChange={(value: BroadcastChannel) =>
                setValue("channel", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{values.channel} message</Label>
              <span className="text-xs text-muted-foreground">
                {values.message?.length ?? 0}/160 · 1 SMS credit
              </span>
            </div>
            <Textarea
              className="min-h-64"
              placeholder="Write your message…"
              maxLength={160}
              {...register("message")}
            />
            {errors.message && (
              <p className="text-xs text-danger">{errors.message.message}</p>
            )}
          </div>
          <div>
            <Label>Schedule date and time</Label>
            <div className="space-y-2">
              {scheduleTimes.map((value, index) => (
                <div key={`${index}-${value}`} className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={value}
                    onChange={(event) => {
                      const next = [...scheduleTimes];
                      next[index] = event.target.value;
                      setScheduleTimes(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={scheduleTimes.length === 1}
                    onClick={() =>
                      setScheduleTimes((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setScheduleTimes((current) => [...current, ""])}
              >
                Add another time
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Schedule multiple sends by adding more times. Each time creates a
              queued broadcast.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => void process(true)}
            >
              <CalendarClock className="h-4 w-4" />
              {schedule.isPending ? "Scheduling…" : "Schedule"}
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void process(false)}
            >
              <Send className="h-4 w-4" />
              {send.isPending ? "Sending…" : "Send now"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
