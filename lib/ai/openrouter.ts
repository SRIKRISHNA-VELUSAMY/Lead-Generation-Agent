import OpenAI from "openai";
import { env, requireEnv } from "@/lib/env";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: requireEnv("OPENROUTER_API_KEY"),
      defaultHeaders: {
        "HTTP-Referer":
          env.NEXT_PUBLIC_APP_URL ?? "https://openrouter.ai/docs",
        "X-Title": "Lead Generation Agent",
      },
    });
  }
  return client;
}

function parseApiError(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    const body = err.error as { message?: string; metadata?: { raw?: string } };
    const detail = body?.message ?? err.message;
    if (detail.includes("Provider returned error") || err.status === 400) {
      return `OpenRouter/LLM request failed (${err.status}): ${detail}. Try OPENROUTER_MODEL=google/gemini-2.0-flash-001 or check API credits at openrouter.ai`;
    }
    return `OpenRouter error (${err.status}): ${detail}`;
  }
  if (err instanceof Error) return err.message;
  return "Unknown OpenRouter error";
}

/** Strip ```json fences if the model wraps output. */
export function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export async function chatCompletionJson(params: {
  system: string;
  user: string;
  model?: string;
}): Promise<string> {
  const model = params.model ?? env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001";

  const systemPrompt = `${params.system}

You must respond with a single JSON object only (no markdown), shaped as:
{"leads":[{"company":"...","founder":null,"website":null,"email":null,"linkedin":null,"industry":null,"location":null,"summary":"...","outreachAngle":null,"leadScore":75,"sources":["https://..."]}]}
Use null for unknown optional fields. leadScore is 0-100 (higher = more complete contact data + niche fit). Include 3-8 leads when possible.`;

  try {
    const response = await getClient().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: params.user },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter returned empty content");
    }
    return extractJsonPayload(content);
  } catch (err) {
    throw new Error(parseApiError(err));
  }
}
