import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { merchant } from "./merchant.schema";

/**
 * Stores represent individual physical or digital locations of a Merchant.
 * Each store has its own WABA configuration and catalog.
 */
export const store = pgTable("store", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  /** WhatsApp Business Account ID specific to this store's phone number. */
  wabaId: text("waba_id"),
  phoneNumberId: text("phone_number_id"),
  accessToken: text("access_token"),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
