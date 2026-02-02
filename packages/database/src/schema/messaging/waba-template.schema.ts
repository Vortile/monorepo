import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { waba } from "./waba.schema";

/** Message templates registered with the provider. */
export const wabaTemplate = pgTable("waba_template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  wabaId: text("waba_id")
    .notNull()
    .references(() => waba.id),

  name: text("name").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull(),
  status: text("status").notNull().default("pending"),
  providerTemplateId: text("provider_template_id"),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
