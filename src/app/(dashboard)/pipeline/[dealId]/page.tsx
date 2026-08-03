import { DealDetailPage } from "@/components/pipeline/DealDetailPage";
export default async function Page({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  return <DealDetailPage dealId={dealId} />;
}
