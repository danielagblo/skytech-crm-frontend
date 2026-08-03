import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { CreateDealButton } from "@/components/pipeline/CreateDealButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { buttonVariants } from "@/components/ui/button";
export const metadata: Metadata = { title: "Pipeline" };
export default function PipelinePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description="Move opportunities forward and capture every interaction"
        actions={
          <>
            <Link
              href="/settings/invoices"
              className={buttonVariants({ variant: "outline" })}
            >
              <FileText className="h-4 w-4" />
              Invoices
            </Link>
            <CreateDealButton />
          </>
        }
      />
      <PipelineBoard />
    </div>
  );
}
