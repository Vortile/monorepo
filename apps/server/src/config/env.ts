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
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  ADMIN_ORIGIN: z.string().url().optional(),

  // Gupshup Partner API Configuration for WABA Onboarding
  GUPSHUP_PARTNER_ID: z.string().min(1, "GUPSHUP_PARTNER_ID is required"),
  GUPSHUP_PARTNER_TOKEN: z.string().min(1, "GUPSHUP_PARTNER_TOKEN is required"),
  GUPSHUP_PARTNER_API_URL: z
    .string()
    .url()
    .default("https://partner.gupshup.io"),
  GUPSHUP_WEBHOOK_VERIFY_TOKEN: z
    .string()
    .min(1, "GUPSHUP_WEBHOOK_VERIFY_TOKEN is required"),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_ORIGIN: process.env.ADMIN_ORIGIN,

  // Gupshup Partner API Configuration
  GUPSHUP_PARTNER_ID: process.env.GUPSHUP_PARTNER_ID,
  GUPSHUP_PARTNER_TOKEN: process.env.GUPSHUP_PARTNER_TOKEN,
  GUPSHUP_PARTNER_API_URL: process.env.GUPSHUP_PARTNER_API_URL,
  GUPSHUP_WEBHOOK_VERIFY_TOKEN: process.env.GUPSHUP_WEBHOOK_VERIFY_TOKEN,
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
