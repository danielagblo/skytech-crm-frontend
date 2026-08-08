import type { Metadata } from "next";
import {
  InvoiceWorkspace,
  type InvoiceIssuerSettings,
} from "@/components/settings/invoices/InvoiceWorkspace";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = { title: "Invoices" };

const issuerInfo: InvoiceIssuerSettings = {
  name: process.env.INVOICE_ISSUER_NAME ?? "",
  email: process.env.INVOICE_ISSUER_EMAIL ?? "",
  phone: process.env.INVOICE_ISSUER_PHONE ?? "",
  address: process.env.INVOICE_ISSUER_ADDRESS ?? "",
  taxId: process.env.INVOICE_ISSUER_TAX_ID ?? "",
  paymentInstructions: process.env.INVOICE_PAYMENT_INSTRUCTIONS ?? "",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description="Generate, preview and track customer invoices"
      />
      <InvoiceWorkspace issuerInfo={issuerInfo} />
    </div>
  );
}