import type { AxiosResponse } from "axios";
import type { ApiResponse, PageData, DealStage } from "@/types/api.types";
import type { CalendarEvent } from "@/types/calendar.types";
import type { Broadcast, ContactSegments } from "@/types/broadcast.types";
import type { Invoice } from "@/types/invoice.types";
import type { Automation, AutomationOptions } from "@/types/automation.types";
import type { DashboardOverview } from "@/types/dashboard.types";
import type { Deal } from "@/types/deal.types";
import type { Lead, LeadStats } from "@/types/lead.types";
import type { Task, TaskStats } from "@/types/task.types";
import type { User, UserPerformance } from "@/types/user.types";
import { useAuthStore } from "@/store/authStore";

const stamp = "2026-08-11T09:00:00.000Z";

export const isDemoSession = () =>
  useAuthStore.getState().accessToken?.startsWith("demo-") === true &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";

export const demoResponse = <T>(data: T) =>
  Promise.resolve({
    data: {
      success: true,
      data,
      message: "Demo data",
      timestamp: stamp,
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  } as AxiosResponse<ApiResponse<T>>);

export const demoPage = <T>(content: T[]): PageData<T> => ({
  content,
  page: 0,
  size: Math.max(content.length, 1),
  totalElements: content.length,
  totalPages: 1,
  last: true,
});

export const demoUsers: User[] = [
  ["demo-admin", "Jeffery", "Henadez", "ADMIN"],
  ["agent-1", "John", "Alan", "AGENT"],
  ["agent-2", "Esther", "Howard", "MANAGER"],
  ["agent-3", "Sandra", "Alonso", "AGENT"],
].map(([id, firstName, lastName, role], index) => ({
  id,
  companyId: "demo-company",
  firstName,
  lastName,
  email: `${String(firstName).toLowerCase()}@skytech.demo`,
  phone: `+233 55 289 24${33 + index}`,
  username: `${String(firstName).toLowerCase()}.${String(lastName).toLowerCase()}`,
  role: role as User["role"],
  planTier: "PRO",
  profilePhotoUrl: null,
  active: true,
  lastLogin: stamp,
  lastSeenAt: index < 2 ? stamp : null,
  presenceStatus: index < 2 ? "ONLINE" : "OFFLINE",
  createdAt: stamp,
}));

const leadNames = [
  ["John", "Alan", "Xbox Limited", "Hospitality", "SMS"],
  ["Sandra", "Alonso", "Telecom Limited", "Tech", "EMAIL"],
  ["Daniel", "Agblo", "Aisle Logistics", "Tourism & Logistics", "GOOGLE"],
  ["Kofi", "Mensah", "Nexa Homes", "Real estate & construction", "FACEBOOK"],
  ["Ama", "Boateng", "CarePoint", "Healthcare", "META_ADS"],
] as const;

export const demoLeads: Lead[] = leadNames.map(
  ([firstName, lastName, companyName, category, source], index) => ({
    id: `lead-${index + 1}`,
    companyId: "demo-company",
    assignedTo: index < 3 ? ["agent-1", "agent-2"] : ["agent-3"],
    createdById: "demo-admin",
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}@example.com`,
    phone1: `+233 55 289 24${33 + index}`,
    phone2: null,
    whatsapp: `+233 55 289 24${33 + index}`,
    companyName,
    role: index === 0 ? "Manager" : "Executive",
    address: index % 2 === 0 ? "Osu, Accra" : "East Legon, Accra",
    industry: category,
    category,
    leadSource: source,
    priority: index % 3 === 0 ? "HIGH" : index % 3 === 1 ? "MEDIUM" : "LOW",
    status: index === 3 ? "CONTACTED" : index === 4 ? "CONVERTED" : "NEW",
    launchTimeline: "IN_1_WEEK",
    hasPublicOffice: true,
    meetingArranged: index !== 2,
    birthday: "1992-02-23",
    smsOptIn: true,
    emailOptIn: true,
    newsletterOptIn: index % 2 === 0,
    description:
      "Pre-built business VoIP systems with virtual PBX, clean CRM integrations and coordinated outbound calling.",
    conversionScore: index === 4 ? 92 : 78 - index * 8,
    createdAt: stamp,
    updatedAt: stamp,
  }),
);

const taskTitles = [
  "Set up 2 factor authentication on iPhone",
  "Prepare the customer onboarding document",
  "Confirm settlement value with the client",
  "Schedule payment follow-up call",
  "Review hosting renewal requirements",
  "Send the revised project proposal",
  "Update lead qualification notes",
  "Share monthly performance summary",
] as const;

export const demoTasks: Task[] = Array.from({ length: 12 }, (_, index) => ({
  id: `task-${index + 1}`,
  companyId: "demo-company",
  title: taskTitles[index % taskTitles.length],
  description:
    "Coordinate the next step, record the outcome and keep the assigned team informed.",
  status: (["TODO", "OVERDUE", "DOING", "DONE"] as const)[index % 4],
  priority: (["LOW", "MEDIUM", "HIGH"] as const)[index % 3],
  createdById: index % 2 ? "agent-2" : "demo-admin",
  allowReminder: true,
  linkedLeadId: `lead-${(index % 5) + 1}`,
  linkedDealId: null,
  dueDate:
    index % 4 === 1
      ? "2026-08-09T12:00:00.000Z"
      : `2026-08-${String(12 + (index % 5)).padStart(2, "0")}T12:00:00.000Z`,
  assigneeIds: index % 3 === 0 ? ["agent-1", "agent-2"] : ["agent-1"],
  completionReason:
    index % 4 === 1 ? "Waiting for customer confirmation." : null,
  version: 1,
  createdAt: stamp,
  updatedAt: stamp,
}));

const dealStages: DealStage[] = [
  "PROSPECTING",
  "NEGOTIATION",
  "NEGOTIATION",
  "SETTLEMENT",
  "PAYMENT",
  "PAYMENT",
  "CLIENT_RETENTION",
  "CLIENT_RETENTION",
];

export const demoDeals: Deal[] = dealStages.map((stage, index) => ({
  id: `deal-${index + 1}`,
  companyId: "demo-company",
  leadId: `lead-${(index % 5) + 1}`,
  createdById: "demo-admin",
  assignedToId: index % 2 ? "agent-2" : "agent-1",
  title: index % 2 ? "Mobile app development" : "Web app development",
  stage,
  priority: index % 3 === 0 ? "HIGH" : index % 3 === 1 ? "MEDIUM" : "LOW",
  contractValue: 4568 + index * 2400,
  totalPaid:
    stage === "CLIENT_RETENTION"
      ? 4568 + index * 2400
      : stage === "PAYMENT"
        ? 5000
        : 0,
  arrears: stage === "PAYMENT" && index % 2 === 0 ? 4500 : 0,
  paidInFull:
    stage === "CLIENT_RETENTION" || (stage === "PAYMENT" && index % 2 === 1),
  hostingExpiry: stage === "CLIENT_RETENTION" ? "2027-06-02" : null,
  domainExpiry: stage === "CLIENT_RETENTION" ? "2027-06-05" : null,
  maintenanceExpiry: stage === "CLIENT_RETENTION" ? "2027-06-05" : null,
  hostingCost: stage === "CLIENT_RETENTION" ? 3000 : 0,
  domainCost: stage === "CLIENT_RETENTION" ? 4000 : 0,
  maintenanceCost: stage === "CLIENT_RETENTION" ? 4000 : 0,
  notes: index % 2 ? "Follow up today" : null,
  version: 1,
  createdAt: stamp,
  updatedAt: stamp,
}));

export const demoPipeline = Object.fromEntries(
  (
    [
      "PROSPECTING",
      "NEGOTIATION",
      "SETTLEMENT",
      "PAYMENT",
      "CLIENT_RETENTION",
    ] as DealStage[]
  ).map((stage) => [stage, demoDeals.filter((deal) => deal.stage === stage)]),
) as Record<DealStage, Deal[]>;

export const demoLeadStats: LeadStats = {
  total: 3456,
  countsByStatus: {
    NEW: 986,
    CONTACTED: 842,
    QUALIFIED: 710,
    CONVERTED: 623,
    LOST: 295,
  },
  sourceBreakdown: {
    SMS: 820,
    EMAIL: 684,
    BANNER: 442,
    META_ADS: 610,
    GOOGLE: 900,
  },
  averageConversionScore: 78,
};

export const demoTaskStats: TaskStats = { total: 56, done: 18, overdue: 9 };

export const demoDashboard: DashboardOverview = {
  outgoingCalls: {
    total: 567,
    nonResponses: 34,
    networkInterruptions: 34,
    customerHungUp: 34,
    avgDuration: 3418,
    successRate: 65,
  },
  incomingCalls: {
    total: 567,
    nonResponses: 34,
    networkInterruptions: 34,
    customerHungUp: 34,
    avgDuration: 3418,
    successRate: 65,
  },
  topRevenuePerAgent: demoUsers.map((user, index) => ({
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    revenue: 480000 - index * 85000,
  })),
  executivePerformance: demoUsers.map((user, index) => ({
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    profilePhotoUrl: user.profilePhotoUrl,
    closedDeals: [67, 42, 35, 28][index],
    revenue: 100000 - index * 12000,
    conversionRate: [60, 90, 74, 68][index],
    rating: [4, 2, 5, 4][index],
    rank: index + 1,
    score: [92, 84, 79, 74][index],
  })),
  followUpReminders: demoDeals.slice(0, 4).map((deal, index) => ({
    dealId: deal.id,
    dealTitle: deal.title,
    followUpAt: `2026-08-${12 + index}T12:00:00.000Z`,
    type: index % 2 ? "SETTLEMENT" : "NEGOTIATION",
  })),
  recentPayments: [],
  agentRank: {
    rank: 1,
    totalAgents: 12,
    loggedCallSeconds: 28_080,
    activeSessionSeconds: 52_200,
    targetAchievement: 86,
    salesRevenue: 92,
  },
};

export const demoCalendar: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Client planning meeting",
    description: "Review scope and launch dates.",
    ownerId: "demo-admin",
    linkedLeadId: "lead-1",
    linkedDealId: "deal-1",
    startTime: "2026-08-12T10:00:00.000Z",
    endTime: "2026-08-12T11:00:00.000Z",
    eventType: "MEETING",
    assignees: ["agent-1", "agent-2"],
    createdAt: stamp,
  },
  {
    id: "event-2",
    title: "Payment follow-up",
    description: "Confirm invoice receipt.",
    ownerId: "agent-1",
    linkedLeadId: "lead-4",
    linkedDealId: "deal-5",
    startTime: "2026-08-13T14:00:00.000Z",
    endTime: "2026-08-13T14:30:00.000Z",
    eventType: "PAYMENT_DUE",
    assignees: ["agent-1"],
    createdAt: stamp,
  },
];

export const demoUserPerformance: UserPerformance = {
  rank: 1,
  closedDeals: 18,
  revenue: 89000,
  loggedCallSeconds: 28_080,
  activeSessionSeconds: 52_200,
  byMonth: { January: 18000, February: 24500, March: 21000, April: 25500 },
};

export const demoSegments: ContactSegments = {
  all: 3456,
  byStage: { NEGOTIATION: 56, SETTLEMENT: 78, PAYMENT: 67 },
};

export const demoBroadcasts: Broadcast[] = [
  {
    id: "broadcast-1",
    name: "August payment reminder",
    messageContent: "A friendly reminder that your upcoming payment is due.",
    channel: "SMS",
    status: "SENT",
    recipientCount: 34,
    segmentFilter: { stages: ["PAYMENT"] },
    createdById: "demo-admin",
    scheduledAt: null,
    sentAt: stamp,
    createdAt: stamp,
  },
  {
    id: "broadcast-2",
    name: "Negotiation follow-up",
    messageContent:
      "We would love to continue our conversation about your project.",
    channel: "SMS",
    status: "WAITING",
    recipientCount: 56,
    segmentFilter: { stages: ["NEGOTIATION"] },
    createdById: "demo-admin",
    scheduledAt: "2026-08-13T09:00:00.000Z",
    sentAt: null,
    createdAt: stamp,
  },
  {
    id: "broadcast-3",
    name: "Service update",
    messageContent: "Your service update is now available.",
    channel: "EMAIL",
    status: "FAILED",
    recipientCount: 12,
    segmentFilter: { leadIds: ["lead-1"] },
    createdById: "demo-admin",
    scheduledAt: null,
    sentAt: null,
    createdAt: stamp,
  },
];

export const demoInvoices: Invoice[] = [
  {
    id: "invoice-1",
    companyId: "demo-company",
    dealId: "deal-5",
    createdById: "demo-admin",
    invoiceNumber: "567878987",
    status: "SENT",
    recipientName: "Daniel Agblo",
    recipientCompany: "Aisle Logistics",
    recipientEmail: "daniel@example.com",
    recipientAddress: "Osu, Accra",
    dueDate: "2026-08-25",
    issueDate: "2026-08-11",
    currency: "GHS",
    taxRate: 0,
    discountAmount: 0,
    subtotal: 14168,
    taxAmount: 0,
    total: 14168,
    amountPaid: 5000,
    balanceDue: 9168,
    notes: "Thank you for your business.",
    terms: "Payment is due within 14 days.",
    version: 2,
    issuedAt: stamp,
    sentAt: stamp,
    receptionConfirmed: true,
    receptionConfirmedAt: stamp,
    receptionConfirmedById: "agent-1",
    lastSendError: null,
    items: [
      {
        id: "line-1",
        description: "Web application development",
        quantity: 1,
        unitPrice: 14168,
        lineTotal: 14168,
        subLines: ["Design and implementation"],
      },
    ],
    payments: [],
    createdAt: stamp,
    updatedAt: stamp,
  },
];

export const demoAutomations: Automation[] = [
  {
    id: "automation-1",
    automationType: "BIRTHDAY",
    name: "Customer birthdays",
    active: true,
    triggerConfig: { date: "2026-08-18", contactIds: ["lead-1", "lead-2"] },
    steps: [
      {
        channel: "BOTH",
        message: "Happy birthday! Wishing you a wonderful day.",
        label: "Birthday greeting",
      },
    ],
    createdById: "demo-admin",
    createdAt: stamp,
  },
  {
    id: "automation-2",
    automationType: "PUBLIC_HOLIDAY",
    name: "Independence Day",
    active: true,
    triggerConfig: { date: "2027-03-06" },
    steps: [
      {
        channel: "SMS",
        message: "Happy Independence Day from Skytech.",
        waitDays: 0,
      },
    ],
    createdById: "demo-admin",
    createdAt: stamp,
  },
  {
    id: "automation-3",
    automationType: "PAYMENT_RECEIVED",
    name: "Payment acknowledgement",
    active: true,
    triggerConfig: {},
    steps: [
      {
        channel: "EMAIL",
        subject: "Payment received",
        message: "Thank you. Your payment has been recorded.",
        label: "Email acknowledgement",
      },
      {
        channel: "SMS",
        message: "Thank you. We have recorded your payment.",
        label: "SMS confirmation",
      },
    ],
    createdById: "demo-admin",
    createdAt: stamp,
  },
  {
    id: "automation-4",
    automationType: "PERSONAL",
    name: "John's client follow-up",
    active: true,
    triggerConfig: { date: "2026-08-15" },
    contactIds: ["lead-3", "lead-4"],
    executionState: "WAITING",
    nextRunAt: "2026-08-15T07:00:00Z",
    lastExecutedAt: null,
    failureReason: null,
    recipientCount: 2,
    steps: [
      {
        channel: "SMS",
        message: "Checking in on your upcoming project.",
        waitDays: 0,
      },
    ],
    createdById: "agent-1",
    createdAt: stamp,
  },
];

export const demoAutomationOptions: AutomationOptions = {
  types: [
    "BIRTHDAY",
    "PUBLIC_HOLIDAY",
    "PAYMENT_RECEIVED",
    "PAYMENT_DUE",
    "PAYMENT_OVERDUE",
    "PAYMENT_RECOVERY",
    "PERSONAL",
  ],
  channels: ["SMS", "EMAIL", "BOTH"],
};
