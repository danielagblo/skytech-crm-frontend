import { LeadDetailPage } from "@/components/leads/LeadDetailPage";
export default async function Page({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <LeadDetailPage leadId={leadId} />;
}
