export const getSeenLeads = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("seenLeads") ?? "[]");
  } catch {
    return [];
  }
};

export const isLeadSeen = (id: string) => getSeenLeads().includes(id);

export const markLeadSeen = (id: string) => {
  if (typeof window === "undefined") return;
  try {
    const current = new Set(getSeenLeads());
    if (!current.has(id)) {
      current.add(id);
      localStorage.setItem("seenLeads", JSON.stringify(Array.from(current)));
      window.dispatchEvent(new CustomEvent("seenLeadsChanged", { detail: id }));
    }
  } catch {
    // ignore
  }
};
