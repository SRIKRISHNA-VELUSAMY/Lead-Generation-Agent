export type ParsedCommand =
  | { type: "find-leads"; query: string }
  | { type: "help" }
  | { type: "history" }
  | { type: "unknown"; text: string };

/** Strip @BotName suffix Telegram adds to commands in groups and some clients. */
function normalizeCommand(text: string): string {
  return text.trim().replace(/@\w+$/i, "");
}

export function parseTelegramCommand(text: string): ParsedCommand {
  const trimmed = normalizeCommand(text.trim());

  if (trimmed === "/help" || trimmed === "/start") {
    return { type: "help" };
  }

  if (trimmed === "/history") {
    return { type: "history" };
  }

  const findMatch = trimmed.match(/^\/find-leads\s+(.+)$/i);
  if (findMatch?.[1]) {
    return { type: "find-leads", query: findMatch[1].trim() };
  }

  if (trimmed.toLowerCase().startsWith("/find-leads") || text.trim().toLowerCase().startsWith("/find-leads")) {
    return {
      type: "unknown",
      text: "Usage: /find-leads <niche and location>\nExample: /find-leads SaaS companies in Chennai",
    };
  }

  return {
    type: "unknown",
    text: "Unknown command. Try /help",
  };
}

export const HELP_MESSAGE = `Lead Generation Agent

/find-leads <niche and location>
  Example: /find-leads AI startups in Chennai

/history — Show your recently saved leads
/help — Show this message`;
