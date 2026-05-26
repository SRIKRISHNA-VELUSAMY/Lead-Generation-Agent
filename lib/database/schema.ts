import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  telegramUserId: text("telegram_user_id").notNull(),
  query: text("query").notNull(),
  company: text("company").notNull(),
  founder: text("founder"),
  website: text("website"),
  email: text("email"),
  linkedin: text("linkedin"),
  industry: text("industry"),
  location: text("location"),
  summary: text("summary").notNull(),
  outreachAngle: text("outreach_angle"),
  leadScore: text("lead_score"),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type LeadRow = typeof leads.$inferSelect;
export type NewLeadRow = typeof leads.$inferInsert;
