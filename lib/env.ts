import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  TAVILY_API_KEY: z.string().min(1).optional(),
  TRIGGER_SECRET_KEY: z.string().min(1).optional(),
  TRIGGER_PROJECT_REF: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  SKIP_ENV_VALIDATION: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success && !process.env.SKIP_ENV_VALIDATION) {
    console.warn("[env] validation warnings:", parsed.error.flatten().fieldErrors);
  }
  return parsed.success ? parsed.data : envSchema.parse({ ...process.env, SKIP_ENV_VALIDATION: true });
}

export const env = parseEnv();

export function requireEnv<K extends keyof typeof env>(
  key: K
): NonNullable<(typeof env)[K]> {
  const fromProcess = process.env[String(key)];
  const value = (fromProcess && fromProcess.length > 0 ? fromProcess : env[key]) as
    | (typeof env)[K]
    | undefined;
  if (value === undefined || value === null || value === "") {
    throw new Error(`${String(key)} is not configured`);
  }
  return value as NonNullable<(typeof env)[K]>;
}
