import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Supabase requires two connection strings:
// - DATABASE_URL: Transaction pooler (port 6543) — used by the app at runtime
// - DIRECT_URL:   Direct connection (port 5432)  — used by drizzle-kit for migrations/push
//
// Get both from: Supabase Dashboard → Project Settings → Database → Connection string
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set for drizzle-kit");
}

export default {
  // Point to directory to automatically include all grouped schema files.
  schema: "./src/schema",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: url,
  },
} satisfies Config;
