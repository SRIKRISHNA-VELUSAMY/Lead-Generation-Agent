import { task } from "@trigger.dev/sdk/v3";
import { runLeadGeneration } from "@/agents/lead-generation/run";
import { saveLeads } from "@/lib/database/leads";
import { buildLeadsCsv, buildLeadsCsvFilename } from "@/lib/telegram/csv";
import { sendTelegramDocument, sendTelegramMessage } from "@/lib/telegram/send";

export const findLeadsTask = task({
  id: "find-leads",
  maxDuration: 300,
  run: async (payload: {
    chatId: string;
    query: string;
    telegramUserId: string;
  }) => {
    try {
      const leads = await runLeadGeneration(payload.query);

      if (process.env.DATABASE_URL) {
        await saveLeads({
          telegramUserId: payload.telegramUserId,
          query: payload.query,
          items: leads,
        });
      }

      const csv = buildLeadsCsv(leads);
      const filename = buildLeadsCsvFilename(payload.query);

      await sendTelegramMessage(
        payload.chatId,
        `Found ${leads.length} leads for: ${payload.query}\n\nCSV file attached — open in Excel or Google Sheets.`,
        { disableWebPagePreview: true }
      );

      const sent = await sendTelegramDocument(
        payload.chatId,
        csv,
        filename,
        `${leads.length} leads · ${payload.query}`
      );

      if (!sent) {
        throw new Error("Failed to send CSV file to Telegram");
      }

      return { leadCount: leads.length, filename };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lead search failed.";
      await sendTelegramMessage(
        payload.chatId,
        `Could not complete lead search: ${message}`,
        { disableWebPagePreview: true }
      );
      throw err;
    }
  },
});
