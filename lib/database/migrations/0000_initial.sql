CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "telegram_user_id" text NOT NULL,
  "query" text NOT NULL,
  "company" text NOT NULL,
  "founder" text,
  "website" text,
  "email" text,
  "linkedin" text,
  "industry" text,
  "location" text,
  "summary" text NOT NULL,
  "outreach_angle" text,
  "raw_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "leads_telegram_user_id_created_at_idx"
  ON "leads" ("telegram_user_id", "created_at" DESC);
