export const getSeenLeads = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("seenLeads") ?? "[]");
  } catch {
    return [];
  }
};

export const isLeadSeen = (id: string) => getSeenLeads().includes(id);

import { leadsService } from "@/services/leads.service";

export const markLeadSeen = (id: string) => {
  if (typeof window === "undefined") return;
  try {
    const current = new Set(getSeenLeads());
    if (!current.has(id)) {
      current.add(id);
      localStorage.setItem("seenLeads", JSON.stringify(Array.from(current)));
      window.dispatchEvent(new CustomEvent("seenLeadsChanged", { detail: id }));
    }
    // fire-and-forget server persistence; ignore errors
    try {
      leadsService.markSeen(id).catch(() => {
        /* ignore */
      });
    } catch {
      /* ignore */
    }
  } catch {
    // ignore
  }
};

export const syncSeenFor = async (leadIds: string[]) => {
  if (typeof window === "undefined" || !leadIds || leadIds.length === 0) return;
  try {
    const response = await leadsService.getSeen(leadIds);
    const seen = response.data?.data ?? [];
    if (!seen || seen.length === 0) return;
    const current = new Set(getSeenLeads());
    let changed = false;
    for (const id of seen) {
      if (!current.has(id)) {
        current.add(id);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem("seenLeads", JSON.stringify(Array.from(current)));
      // dispatch for each id for simplicity
      for (const id of seen) window.dispatchEvent(new CustomEvent("seenLeadsChanged", { detail: id }));
    }
  } catch {
    // ignore network errors
  }
};
