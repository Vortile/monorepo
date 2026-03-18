import { config } from "dotenv";
import { z } from "zod";

// Load .env.local first (preferred), then fall back to .env/PROCESS env
config({ path: ".env.local", override: true });
config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().email().optional(),
  ADMIN_ORIGIN: z.string().url().optional(),
  META_WABA_ACCESS_TOKEN: z
    .string()
    .min(1, "META_WABA_ACCESS_TOKEN is required"),
  META_WABA_PHONE_NUMBER_ID: z
    .string()
    .min(1, "META_WABA_PHONE_NUMBER_ID is required"),
  META_WABA_ID: z.string().min(1, "META_WABA_ID is required"),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_ORIGIN: process.env.ADMIN_ORIGIN,
  META_WABA_ACCESS_TOKEN: process.env.META_WABA_ACCESS_TOKEN,
  META_WABA_PHONE_NUMBER_ID: process.env.META_WABA_PHONE_NUMBER_ID,
  META_WABA_ID: process.env.META_WABA_ID,
});

if (!parsed.success) {
  console.error(
    "Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration for API");
}

export const env = parsed.data;
export type Env = typeof env;
