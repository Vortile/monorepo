import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { merchant } from "./merchant.schema";
import { waba } from "../messaging/waba.schema";
import { wabaPhoneNumber } from "../messaging/waba-phone-number.schema";

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

  /** WhatsApp Business Account linked to this store. */
  wabaId: text("waba_id").references(() => waba.id),
  wabaPhoneNumberId: text("waba_phone_number_id").references(
    () => wabaPhoneNumber.id,
  ),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
