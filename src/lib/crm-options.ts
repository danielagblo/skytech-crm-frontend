export const LEAD_INDUSTRIES = [
  "Hospitality",
  "Retail & E-commerce",
  "Education",
  "Tourism & Logistics",
  "Real estate & construction",
  "Healthcare",
  "Tech",
  "NGO",
  "Religion",
  "Other",
] as const;

export const DASHBOARD_PERIODS = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "three_months", label: "3 months" },
] as const;

export const DEAL_STAGE_LABELS: Record<string, string> = {
  PROSPECTING: "Prospecting",
  NEGOTIATION: "Negotiation",
  SETTLEMENT: "Settlement",
  PAYMENT: "Payment",
  CLIENT_RETENTION: "Client retention",
};