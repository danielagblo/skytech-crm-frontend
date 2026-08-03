import type { Metadata } from "next";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { CreateDealButton } from "@/components/pipeline/CreateDealButton";
import { PageHeader } from "@/components/shared/PageHeader";
export const metadata: Metadata = { title: "Pipeline" };
export default function PipelinePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline"
        description="Move opportunities forward and capture every interaction"
        actions={<CreateDealButton />}
      />
      <PipelineBoard />
    </div>
  );
}
