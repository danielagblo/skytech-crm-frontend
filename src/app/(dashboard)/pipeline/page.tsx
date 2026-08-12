import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { CreateDealButton } from "@/components/pipeline/CreateDealButton";
import { buttonVariants } from "@/components/ui/button";
export const metadata: Metadata = { title: "Pipeline" };
export default function PipelinePage() {
  return (
    <div className="relative lg:h-[calc(100dvh-7.75rem)] lg:overflow-hidden 2xl:h-[calc(100dvh-8.25rem)]">
      <div className="fixed bottom-6 right-6 z-20 flex gap-2 rounded-lg border bg-card/95 p-2 shadow-lg backdrop-blur">
        <Link
          href="/settings/invoices"
          className={buttonVariants({ variant: "outline" })}
        >
          <FileText className="h-4 w-4" />
          Invoices
        </Link>
        <CreateDealButton />
      </div>
      <PipelineBoard />
    </div>
  );
}
