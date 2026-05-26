import type { Lead } from "@/tools/lead-schema";
import type { LeadRow } from "@/lib/database/schema";

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function formatLeadBlock(lead: Lead, index: number): string {
  const lines = [
    `*${index}\\. ${escapeMarkdown(lead.company)}*`,
    lead.founder ? `• Founder: ${escapeMarkdown(lead.founder)}` : null,
    lead.website ? `• Website: ${escapeMarkdown(lead.website)}` : null,
    lead.email ? `• Email: ${escapeMarkdown(lead.email)}` : null,
    lead.linkedin ? `• LinkedIn: ${escapeMarkdown(lead.linkedin)}` : null,
    lead.industry ? `• Industry: ${escapeMarkdown(lead.industry)}` : null,
    lead.location ? `• Location: ${escapeMarkdown(lead.location)}` : null,
    `• Summary: ${escapeMarkdown(lead.summary)}`,
    lead.outreachAngle
      ? `• Outreach: ${escapeMarkdown(lead.outreachAngle)}`
      : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function formatLeadsForTelegram(leads: Lead[], query: string): string[] {
  const header = `*Leads for:* ${escapeMarkdown(query)}\n_Found ${leads.length} companies_\n`;
  const blocks = leads.map((lead, i) => formatLeadBlock(lead, i + 1));
  const full = [header, ...blocks].join("\n\n");

  const messages: string[] = [];
  const maxLen = 4000;

  if (full.length <= maxLen) {
    messages.push(full);
    return messages;
  }

  let current = header;
  for (const block of blocks) {
    if ((current + "\n\n" + block).length > maxLen) {
      if (current.trim()) messages.push(current.trim());
      current = block;
    } else {
      current = current ? `${current}\n\n${block}` : block;
    }
  }
  if (current.trim()) messages.push(current.trim());
  return messages;
}

export function formatHistoryForTelegram(rows: LeadRow[]): string {
  if (rows.length === 0) {
    return "No saved leads yet\\. Run /find\\-leads to discover companies\\.";
  }

  const lines = rows.map((row, i) => {
    const date = row.createdAt.toISOString().slice(0, 10);
    return `${i + 1}\\. *${escapeMarkdown(row.company)}* \\(${date}\\)\n   Query: ${escapeMarkdown(row.query)}`;
  });

  return `*Recent leads*\n\n${lines.join("\n\n")}`;
}
