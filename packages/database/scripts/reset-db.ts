/**
 * Reset database — drops the entire public schema and recreates it clean.
 * Run ONCE before db:push when you want a fresh slate.
 *
 * Usage (from monorepo root):
 *   cd packages/database
 *   npx tsx scripts/reset-db.ts
 */
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set");

const sql = postgres(url, { prepare: false });

async function reset() {
  console.log("⚠️  Dropping entire public schema...");
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql`GRANT ALL ON SCHEMA public TO postgres`;
  await sql`GRANT ALL ON SCHEMA public TO public`;
  console.log("✓ Schema clean. Run pnpm db:push to recreate tables.");
  await sql.end();
}

reset().catch((err) => {
  console.error("Reset failed:", err.message);
  process.exit(1);
});
