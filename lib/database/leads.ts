import { desc, eq } from "drizzle-orm";
import type { Lead } from "@/tools/lead-schema";
import { resolveLeadScore } from "@/lib/telegram/csv";
import { requireDb } from "./index";
import { leads } from "./schema";

export async function saveLeads(params: {
  telegramUserId: string;
  query: string;
  items: Lead[];
}) {
  const db = requireDb();
  if (params.items.length === 0) return [];

  const rows = await db
    .insert(leads)
    .values(
      params.items.map((item) => ({
        telegramUserId: params.telegramUserId,
        query: params.query,
        company: item.company,
        founder: item.founder ?? null,
        website: item.website ?? null,
        email: item.email ?? null,
        linkedin: item.linkedin ?? null,
        industry: item.industry ?? null,
        location: item.location ?? null,
        summary: item.summary,
        outreachAngle: item.outreachAngle ?? null,
        leadScore: String(resolveLeadScore(item)),
        rawJson: item,
      }))
    )
    .returning();

  return rows;
}

export async function listLeadsByUser(telegramUserId: string, limit = 10) {
  const db = requireDb();
  return db
    .select()
    .from(leads)
    .where(eq(leads.telegramUserId, telegramUserId))
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}
