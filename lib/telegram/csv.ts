import type { Lead } from "@/tools/lead-schema";

export const LEAD_CSV_HEADERS = [
  "Company Name",
  "Industry",
  "Location",
  "Website",
  "LinkedIn",
  "Email",
  "Founder Name",
  "AI Summary",
  "Outreach Angle",
  "Lead Score",
] as const;

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function resolveLeadScore(lead: Lead): number {
  if (typeof lead.leadScore === "number" && !Number.isNaN(lead.leadScore)) {
    return Math.min(100, Math.max(0, Math.round(lead.leadScore)));
  }
  let score = 35;
  if (lead.website) score += 12;
  if (lead.email) score += 18;
  if (lead.linkedin) score += 12;
  if (lead.founder) score += 10;
  if (lead.industry) score += 5;
  if (lead.location) score += 5;
  if (lead.outreachAngle && lead.outreachAngle.length > 20) score += 8;
  if (lead.summary.length > 40) score += 5;
  return Math.min(100, score);
}

export function leadToCsvRow(lead: Lead): string[] {
  return [
    lead.company,
    lead.industry ?? "",
    lead.location ?? "",
    lead.website ?? "",
    lead.linkedin ?? "",
    lead.email ?? "",
    lead.founder ?? "",
    lead.summary,
    lead.outreachAngle ?? "",
    String(resolveLeadScore(lead)),
  ];
}

export function buildLeadsCsv(leads: Lead[]): Buffer {
  const lines = [
    LEAD_CSV_HEADERS.join(","),
    ...leads.map((lead) => leadToCsvRow(lead).map(escapeCsvCell).join(",")),
  ];
  const body = "\uFEFF" + lines.join("\r\n");
  return Buffer.from(body, "utf-8");
}

export function buildLeadsCsvFilename(query: string): string {
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const date = new Date().toISOString().slice(0, 10);
  return `leads-${slug || "export"}-${date}.csv`;
}
