/**
 * Register Telegram webhook. Usage:
 *   node scripts/set-telegram-webhook.mjs https://YOUR-NGROK-OR-RAILWAY-URL
 *
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in .env
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const baseUrl = process.argv[2]?.replace(/\/$/, "");

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}
if (!baseUrl) {
  console.error("Usage: node scripts/set-telegram-webhook.mjs <public-base-url>");
  console.error("Example: node scripts/set-telegram-webhook.mjs https://abc123.ngrok-free.app");
  process.exit(1);
}

const webhookUrl = `${baseUrl}/api/telegram/webhook`;

const body = {
  url: webhookUrl,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
};
if (secret) {
  body.secret_token = secret;
}

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await res.json();
if (!data.ok) {
  console.error("setWebhook failed:", data);
  process.exit(1);
}

const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then(
  (r) => r.json()
);

console.log("Webhook registered:", webhookUrl);
console.log("Secret token:", secret ? "(set)" : "(none)");
console.log("Pending updates dropped. Info:", {
  url: info.result?.url,
  pending: info.result?.pending_update_count,
  last_error: info.result?.last_error_message ?? "none",
});
