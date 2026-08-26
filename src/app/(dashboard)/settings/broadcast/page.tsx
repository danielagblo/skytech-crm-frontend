import type { Metadata } from "next";
import { BroadcastComposer } from "@/components/settings/broadcast/BroadcastComposer";
import { BroadcastHistory } from "@/components/settings/broadcast/BroadcastHistory";
export const metadata: Metadata = { title: "Broadcast" };
export default function BroadcastPage() {
  return (
    <div className="space-y-3">
      <BroadcastComposer />
      <BroadcastHistory />
    </div>
  );
}
