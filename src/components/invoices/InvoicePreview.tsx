"use client";

/**
 * InvoicePreview
 * --------------
 * On-screen preview of the invoice (React + Tailwind), matching the
 * Pixel-matched template. The company logo sits in the upper-right, and the
 * issuer's cursive signature appears in the footer.
 *
 * This is NOT used for PDF export - @react-pdf/renderer does not understand
 * Tailwind classes. Use InvoicePDF instead, which mirrors this exact layout.
 */

export interface InvoiceLineItem {
  description: string;
  rate: number;
  qty: number;
}

export interface InvoiceData {
  issuerName: string;
  issuerTagline?: string;
  issuerEmail?: string;
  issuerPhone?: string;
  issuerAddress?: string;
  issuerTaxId?: string;
  paymentInstructions?: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  taxRatePercent: number;
  discountAmount?: number;
  currencySymbol?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  signatureName?: string;
  logoUrl?: string;
}

export const defaultInvoice: InvoiceData = {
  issuerName: "[YOUR NAME]",
  issuerTagline: "[YOUR TITLE / COMPANY]",
  clientName: "[CLIENT NAME]",
  clientCompany: "[CLIENT COMPANY]",
  clientAddress: "[CLIENT ADDRESS]",
  invoiceNo: "[INVOICE NO.]",
  date: "[DATE]",
  dueDate: "[DUE DATE]",
  items: [
    { description: "[LINE ITEM DESCRIPTION]", rate: 0, qty: 1 },
    { description: "[LINE ITEM DESCRIPTION]", rate: 0, qty: 1 },
  ],
  taxRatePercent: 0,
  bankName: "[BANK NAME]",
  accountName: "[ACCOUNT NAME]",
  accountNumber: "[ACCOUNT NUMBER]",
  signatureName: "[SIGNATURE]",
};

function currency(n: number, symbol = "GH¢") {
  return `${symbol} ${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export default function InvoicePreview({
  data = defaultInvoice,
}: {
  data?: InvoiceData;
}) {
  const subtotal = data.items.reduce((sum, i) => sum + i.rate * i.qty, 0);
  const tax = subtotal * ((data.taxRatePercent ?? 0) / 100);
  const discount = data.discountAmount ?? 0;
  const total = Math.max(subtotal + tax - discount, 0);
  const symbol = data.currencySymbol ?? "GH¢";

  return (
    <div className="w-full flex justify-center bg-neutral-100 p-4 md:p-8">
      {/* Page: fixed aspect to emulate a portrait invoice sheet */}
      <div
        className="bg-white text-neutral-800 shadow-sm w-full"
        style={{ maxWidth: "816px" }}
      >
        <div className="px-8 pt-12 pb-10 md:px-16 md:pt-16 md:pb-12 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-neutral-800">
                INVOICE
              </h1>
              {(data.issuerAddress ||
                data.issuerPhone ||
                data.issuerEmail ||
                data.issuerTaxId) && (
                <div className="mt-3 text-[11px] md:text-xs leading-relaxed text-neutral-600">
                  <p className="font-bold tracking-wide text-neutral-800">
                    {data.issuerName}
                  </p>
                  {data.issuerAddress && (
                    <p className="whitespace-pre-line">{data.issuerAddress}</p>
                  )}
                  {data.issuerPhone && <p>Phone: {data.issuerPhone}</p>}
                  {data.issuerEmail && <p>Email: {data.issuerEmail}</p>}
                  {data.issuerTaxId && <p>Tax ID: {data.issuerTaxId}</p>}
                </div>
              )}
            </div>

            {/* Company logo (upper right) */}
            <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center shrink-0">
              {data.logoUrl ? (
                <img
                  src={data.logoUrl}
                  alt={data.issuerName}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-neutral-100">
                  <span
                    className="text-xl md:text-3xl leading-none mb-1"
                    style={{ fontFamily: "'Brush Script MT', cursive" }}
                  >
                    {data.issuerName[0]}.
                  </span>
                  <span className="text-[8px] md:text-[9px] font-bold tracking-widest text-neutral-800 text-center px-2 leading-tight">
                    {data.issuerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Issued to / Invoice meta */}
          <div className="mt-12 md:mt-16 flex flex-wrap justify-between gap-6 text-xs md:text-sm">
            <div>
              <p className="font-bold tracking-wide text-neutral-800 mb-2">
                ISSUED TO:
              </p>
              <p className="text-neutral-700 leading-relaxed">
                {data.clientName || "—"}
                <br />
                {data.clientCompany && (
                  <>
                    {data.clientCompany}
                    <br />
                  </>
                )}
                {data.clientAddress && (
                  <span className="whitespace-pre-line">{data.clientAddress}</span>
                )}
              </p>
            </div>
            <div className="md:text-right">
              <p className="mb-2">
                <span className="font-bold tracking-wide">INVOICE NO:</span>{" "}
                <span className="font-bold ml-2">{data.invoiceNo}</span>
              </p>
              <p className="text-neutral-700">
                <span className="font-bold tracking-wide">DATE:</span>{" "}
                <span className="ml-2">{data.date}</span>
              </p>
              <p className="text-neutral-700">
                <span className="font-bold tracking-wide">DUE DATE:</span>{" "}
                <span className="ml-2">{data.dueDate}</span>
              </p>
            </div>
          </div>

          {/* Line items table */}
          <div className="mt-12 md:mt-14">
            <div className="grid grid-cols-[1fr_80px_60px_100px] md:grid-cols-[1fr_100px_100px_120px] text-xs md:text-sm font-bold tracking-wide text-neutral-800 pb-3 border-b-2 border-neutral-800">
              <span>DESCRIPTION</span>
              <span>RATE</span>
              <span>QTY</span>
              <span className="text-right">TOTAL</span>
            </div>

            {data.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_80px_60px_100px] md:grid-cols-[1fr_100px_100px_120px] text-xs md:text-sm text-neutral-700 py-3 border-b border-neutral-100"
              >
                <span className="pr-2">{item.description}</span>
                <span>{item.rate}</span>
                <span>{item.qty}</span>
                <span className="text-right">
                  {currency(item.rate * item.qty, symbol)}
                </span>
              </div>
            ))}

            <div className="mt-4 space-y-2 text-xs md:text-sm">
              <div className="grid grid-cols-[1fr_80px_60px_100px] md:grid-cols-[1fr_100px_100px_120px]">
                <span className="font-bold tracking-wide">SUBTOTAL</span>
                <span />
                <span />
                <span className="text-right font-bold">
                  {currency(subtotal, symbol)}
                </span>
              </div>
              {discount > 0 && (
                <div className="grid grid-cols-[1fr_80px_60px_100px] md:grid-cols-[1fr_100px_100px_120px]">
                  <span />
                  <span />
                  <span className="text-right text-neutral-600">Discount</span>
                  <span className="text-right">
                    - {currency(discount, symbol)}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-[1fr_80px_60px_100px] md:grid-cols-[1fr_100px_100px_120px]">
                <span />
                <span />
                <span className="text-right text-neutral-600">Tax</span>
                <span className="text-right">{data.taxRatePercent}%</span>
              </div>
              <div className="border-t-2 border-neutral-800 pt-2 grid grid-cols-[1fr_80px_60px_100px] md:grid-cols-[1fr_100px_100px_120px]">
                <span />
                <span />
                <span className="text-right font-bold">TOTAL</span>
                <span className="text-right font-bold">
                  {currency(total, symbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer: payment info + signature */}
          <div className="mt-auto pt-16 md:pt-24 flex flex-wrap justify-between items-end gap-6">
            <div className="text-xs md:text-sm">
              <p className="font-bold tracking-wide text-neutral-800 mb-2">
                PAYMENT INFO:
              </p>
              {data.paymentInstructions ? (
                <p className="whitespace-pre-line leading-relaxed text-neutral-700">
                  {data.paymentInstructions}
                </p>
              ) : (
                <p className="text-neutral-700 leading-relaxed">
                  {data.bankName}
                  <br />
                  Account Name: {data.accountName}
                  <br />
                  Account No.: {data.accountNumber}
                </p>
              )}
            </div>
            {data.signatureName && (
              <div className="pr-4">
                <p
                  className="text-3xl text-neutral-800"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  {data.signatureName}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {data.issuerName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}