import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// `prepare: false` is required for Supabase's transaction pooler (Supavisor)
// used in serverless environments like Vercel. Prepared statements are not
// supported in transaction mode pooling.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
export * from "./schema";
export * from "drizzle-orm";
