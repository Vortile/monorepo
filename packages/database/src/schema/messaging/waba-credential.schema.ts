import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { waba } from "./waba.schema";

/** Credentials used to access provider APIs for a WABA. */
export const wabaCredential = pgTable("waba_credential", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  wabaId: text("waba_id")
    .notNull()
    .references(() => waba.id),

  /** Provider identifier (e.g. "gupshup", "meta"). */
  provider: text("provider").notNull(),

  /** Credential type (e.g. "business_token", "access_token", "api_key"). */
  type: text("type").notNull(),

  /** Store encrypted value or a reference to secrets manager. */
  value: text("value"),

  /** Additional metadata (e.g., token scope, permissions). */
  metadata: text("metadata"), // JSON string

  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
