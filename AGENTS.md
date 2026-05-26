# Agent instructions (Lead Generation Agent)

Read [PROTOCOL.md](./PROTOCOL.md) before making changes.

## Scope (MVP)

- One Telegram command: `/find-leads <query>`
- One Trigger.dev task: `find-leads`
- One agent: `agents/lead-generation/run.ts`
- Tavily research + OpenRouter structured extraction + Postgres persistence

## Do not add (Phase 8 — out of scope)

- WhatsApp, dashboard UI, CRM, automated email outreach
- Multi-agent orchestration, cron scraping, lead scoring
- Stripe, NextAuth, Composio (unless explicitly requested later)

## Required environment

See [.env.example](./.env.example). Production needs all keys; local dev may use `SKIP_ENV_VALIDATION=true` only for Next.js boot — Trigger tasks still need real API keys to run end-to-end.

## Conventions

- Keep webhook route thin: validate, parse, ack, `tasks.trigger`.
- Heavy work runs in `trigger/find-leads.ts`.
- Agent skill lives in `skills/agent_skill.md` — update there, not inline in code.
- Never invent contact data in prompts; sources required per lead.

## Verification

`/find-leads SaaS companies in Chennai` → ack → Trigger run → Telegram formatted leads → rows in `leads` table.
