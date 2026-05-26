import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { findLeadsTask } from "@/trigger/find-leads";
import { listLeadsByUser } from "@/lib/database/leads";
import {
  sendTelegramMessage,
  validateTelegramSecret,
} from "@/lib/telegram/send";
import { formatHistoryForTelegram } from "@/lib/telegram/format";
import { HELP_MESSAGE, parseTelegramCommand } from "@/telegram/commands";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    from?: { id: number; username?: string };
    text?: string;
  };
};

function escapeAck(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "lead-generation-agent",
    webhook: "/api/telegram/webhook",
    hint: "Telegram must POST updates here. Run: npm run telegram:webhook <public-url>",
  });
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!validateTelegramSecret(secret)) {
      console.error("[telegram/webhook] rejected: secret token mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = (await req.json()) as TelegramUpdate;
    const message = update.message;
    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const telegramUserId = String(message.from.id);
    const command = parseTelegramCommand(message.text);

    if (command.type === "help") {
      await sendTelegramMessage(chatId, HELP_MESSAGE, {});
      return NextResponse.json({ ok: true });
    }

    if (command.type === "history") {
      if (!process.env.DATABASE_URL) {
        await sendTelegramMessage(
          chatId,
          "Database not configured. Set DATABASE_URL to use /history.",
          {}
        );
        return NextResponse.json({ ok: true });
      }
      const rows = await listLeadsByUser(telegramUserId, 10);
      await sendTelegramMessage(chatId, formatHistoryForTelegram(rows), {
        parseMode: "MarkdownV2",
      });
      return NextResponse.json({ ok: true });
    }

    if (command.type === "unknown") {
      await sendTelegramMessage(chatId, command.text, {});
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      chatId,
      `Searching for leads: *${escapeAck(command.query)}*\nThis may take a minute\\.\\.\\.`,
      { parseMode: "MarkdownV2" }
    );

    try {
      await tasks.trigger<typeof findLeadsTask>("find-leads", {
        chatId,
        query: command.query,
        telegramUserId,
      });
    } catch (triggerErr) {
      console.error("[telegram/webhook] Trigger.dev trigger failed:", triggerErr);
      await sendTelegramMessage(
        chatId,
        "Could not start lead search. Check TRIGGER_SECRET_KEY and run npm run trigger:dev (or trigger:deploy).",
        {}
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram/webhook] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
