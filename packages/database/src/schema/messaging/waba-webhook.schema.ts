import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { waba } from "./waba.schema";

/** Webhooks configured for WABA events. */
export const wabaWebhook = pgTable("waba_webhook", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  wabaId: text("waba_id")
    .notNull()
    .references(() => waba.id),

  url: text("url").notNull(),
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
