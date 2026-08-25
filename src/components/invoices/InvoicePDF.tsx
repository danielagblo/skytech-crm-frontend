"use client";

/**
 * InvoicePDF
 * ----------
 * Generates a real, downloadable PDF mirroring InvoicePreview.tsx using
 * @react-pdf/renderer's StyleSheet API (Tailwind classes do not exist in the
 * PDF renderer). The company logo is placed upper-right and the issuer's
 * signature renders at the footer.
 *
 * NOTE: relative logo URLs are resolved against window.location.origin so the
 * PDF worker can fetch the image at render time.
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { InvoiceData, InvoiceLineItem } from "./InvoicePreview";

export type { InvoiceData, InvoiceLineItem };

function currency(n: number, symbol = "GH¢") {
  return `${symbol} ${n.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

const resolveUrl = (url: string | undefined) => {
  if (!url) return undefined;
  if (url.startsWith("/") && typeof window !== "undefined")
    return `${window.location.origin}${url}`;
  return url;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 64,
    fontFamily: "Helvetica",
    color: "#262626",
    fontSize: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#262626",
  },
  logoWrap: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 155,
    height: 52,
    objectFit: "contain",
    objectPosition: "right",
  },
  metaRow: {
    marginTop: 56,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 6,
    fontSize: 10,
  },
  bodyText: {
    color: "#404040",
    lineHeight: 1.5,
    fontSize: 10,
  },
  metaLine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  table: {
    marginTop: 44,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#262626",
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  colDescription: { flex: 1 },
  colRate: { width: 70 },
  colQty: { width: 70 },
  colTotal: { width: 80, textAlign: "right" },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    fontSize: 10,
  },
  tableCellText: {
    color: "#404040",
    fontSize: 10,
  },
  totalsBlock: {
    marginTop: 10,
  },
  totalsRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  totalsDivider: {
    borderTopWidth: 1.5,
    borderTopColor: "#262626",
    marginBottom: 8,
  },
  footerRow: {
    marginTop: "auto",
    paddingTop: 90,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signature: {
    fontSize: 22,
    fontFamily: "Helvetica-Oblique",
    paddingRight: 8,
  },
  signatureLabel: {
    fontSize: 7,
    color: "#737373",
    textAlign: "right",
  },
});

export function InvoicePDFDocument({
  data,
}: {
  data: InvoiceData;
}) {
  const subtotal = data.items.reduce((sum, i) => sum + i.rate * i.qty, 0);
  const tax = subtotal * ((data.taxRatePercent ?? 0) / 100);
  const discount = data.discountAmount ?? 0;
  const total = Math.max(subtotal + tax - discount, 0);
  const symbol = data.currencySymbol ?? "GH¢";
  const logoUrl = resolveUrl(data.logoUrl);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            {data.issuerAddress || data.issuerPhone || data.issuerEmail || data.issuerTaxId ? (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.bodyText, { fontFamily: "Helvetica-Bold", fontSize: 9 }]}>
                  {data.issuerName}
                </Text>
                {data.issuerAddress ? (
                  <Text style={[styles.bodyText, { fontSize: 8 }]}>
                    {data.issuerAddress}
                  </Text>
                ) : null}
                {data.issuerPhone ? (
                  <Text style={[styles.bodyText, { fontSize: 8 }]}>
                    Phone: {data.issuerPhone}
                  </Text>
                ) : null}
                {data.issuerEmail ? (
                  <Text style={[styles.bodyText, { fontSize: 8 }]}>
                    Email: {data.issuerEmail}
                  </Text>
                ) : null}
                {data.issuerTaxId ? (
                  <Text style={[styles.bodyText, { fontSize: 8 }]}>
                    Tax ID: {data.issuerTaxId}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
          {logoUrl ? (
            // @react-pdf/renderer's Image has no alt prop; the logo is decorative.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.logo} src={logoUrl} />
          ) : (
            <View style={styles.logoWrap}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 1.5,
                  borderColor: "#2b2b2b",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: 22 }}>
                  {data.issuerName[0]}.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Issued to / meta */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.label}>ISSUED TO:</Text>
            <Text style={styles.bodyText}>{data.clientName}</Text>
            {data.clientCompany ? (
              <Text style={styles.bodyText}>{data.clientCompany}</Text>
            ) : null}
            {data.clientAddress ? (
              <Text style={styles.bodyText}>{data.clientAddress}</Text>
            ) : null}
          </View>
          <View>
            <View style={styles.metaLine}>
              <Text style={[styles.label, { marginRight: 8 }]}>
                INVOICE NO:
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                {data.invoiceNo}
              </Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={[styles.label, { marginRight: 8 }]}>DATE:</Text>
              <Text style={styles.bodyText}>{data.date}</Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={[styles.label, { marginRight: 8 }]}>
                DUE DATE:
              </Text>
              <Text style={styles.bodyText}>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Line items table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.colRate, styles.tableHeaderText]}>RATE</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>QTY</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>TOTAL</Text>
          </View>

          {data.items.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <View style={[styles.colDescription, { paddingRight: 6 }]}>
                <Text style={styles.tableCellText}>{item.description}</Text>
                {item.subLines?.map((line, subIdx) => (
                  <Text
                    key={subIdx}
                    style={{
                      color: "#737373",
                      fontSize: 8,
                      marginLeft: 4,
                      marginTop: 1,
                    }}
                  >
                    -- {line}
                  </Text>
                ))}
              </View>
              <Text style={[styles.colRate, styles.tableCellText]}>
                {item.rate}
              </Text>
              <Text style={[styles.colQty, styles.tableCellText]}>
                {item.qty}
              </Text>
              <Text style={[styles.colTotal, styles.tableCellText]}>
                {currency(item.rate * item.qty, symbol)}
              </Text>
            </View>
          ))}

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={[styles.colDescription, styles.label]}>SUBTOTAL</Text>
              <Text style={styles.colRate} />
              <Text style={styles.colQty} />
              <Text style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>
                {currency(subtotal, symbol)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.colDescription} />
                <Text style={styles.colRate} />
                <Text style={[styles.colQty, { textAlign: "right" }]}>
                  Discount
                </Text>
                <Text style={styles.colTotal}>
                  - {currency(discount, symbol)}
                </Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.colDescription} />
              <Text style={styles.colRate} />
              <Text style={[styles.colQty, { textAlign: "right" }]}>Tax</Text>
              <Text style={styles.colTotal}>{data.taxRatePercent}%</Text>
            </View>
            <View style={styles.totalsDivider} />
            <View style={styles.totalsRow}>
              <Text style={styles.colDescription} />
              <Text style={styles.colRate} />
              <Text
                style={[
                  styles.colQty,
                  { textAlign: "right", fontFamily: "Helvetica-Bold" },
                ]}
              >
                TOTAL
              </Text>
              <Text style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>
                {currency(total, symbol)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer: payment info + signature */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.label}>PAYMENT INFO:</Text>
            {data.paymentInstructions ? (
              <View style={{ maxWidth: 220 }}>
                <Text style={[styles.bodyText, { fontSize: 9 }]}>
                  {data.paymentInstructions}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.bodyText}>{data.bankName}</Text>
                <Text style={styles.bodyText}>
                  Account Name: {data.accountName}
                </Text>
                <Text style={styles.bodyText}>
                  Account No.: {data.accountNumber}
                </Text>
              </View>
            )}
          </View>
          {data.signatureName ? (
            <View>
              <Text style={styles.signature}>{data.signatureName}</Text>
              <Text style={styles.signatureLabel}>{data.issuerName}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

/** Render the document to a Blob (browser-side) for download or preview. */
export async function invoiceToPdfBlob(invoice: InvoiceData) {
  return pdf(<InvoicePDFDocument data={invoice} />).toBlob();
}

/** Download the invoice PDF to the user's disk. */
export async function downloadInvoicePDF(
  data: InvoiceData,
  filename = "invoice.pdf",
) {
  const blob = await invoiceToPdfBlob(data);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Open the invoice PDF in a new tab (mobile-friendly PDF preview). */
export async function openInvoicePdf(data: InvoiceData) {
  const blob = await invoiceToPdfBlob(data);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}
