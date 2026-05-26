import { requireEnv } from "@/lib/env";

const TELEGRAM_API = "https://api.telegram.org/bot";

export function validateTelegramSecret(header: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;
  return header === secret;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: {
    parseMode?: "MarkdownV2" | "HTML";
    disableWebPagePreview?: boolean;
  }
): Promise<boolean> {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text.slice(0, 4096),
  };
  if (options?.parseMode) {
    body.parse_mode = options.parseMode;
  }
  if (options?.disableWebPagePreview) {
    body.disable_web_page_preview = true;
  }

  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[telegram] send failed:", err);
    return false;
  }
  return true;
}

export async function sendTelegramMessages(
  chatId: string | number,
  texts: string[],
  options?: {
    parseMode?: "MarkdownV2" | "HTML";
    disableWebPagePreview?: boolean;
  }
): Promise<void> {
  for (const text of texts) {
    await sendTelegramMessage(chatId, text, options);
  }
}

export async function sendTelegramDocument(
  chatId: string | number,
  file: Buffer,
  filename: string,
  caption?: string
): Promise<boolean> {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(
    "document",
    new Blob([new Uint8Array(file)], { type: "text/csv;charset=utf-8" }),
    filename
  );
  if (caption) {
    form.append("caption", caption.slice(0, 1024));
  }

  const res = await fetch(`${TELEGRAM_API}${token}/sendDocument`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[telegram] sendDocument failed:", err);
    return false;
  }
  return true;
}
