import type { Metadata } from "next";
import { InvoiceWorkspace } from "@/components/settings/invoices/InvoiceWorkspace";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = { title: "Invoices" };
export default function InvoicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description="Generate, preview and track customer invoices"
      />
      <InvoiceWorkspace />
    </div>
  );
}
