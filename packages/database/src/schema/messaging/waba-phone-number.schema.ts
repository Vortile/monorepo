import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { merchant } from "../merchants/merchant.schema";
import { waba } from "./waba.schema";

/** Phone numbers assigned to a WABA. */
export const wabaPhoneNumber = pgTable("waba_phone_number", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  wabaId: text("waba_id")
    .notNull()
    .references(() => waba.id),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),

  /** Provider phone number identifier. */
  providerPhoneNumberId: text("provider_phone_number_id"),
  phoneNumber: text("phone_number").notNull(),
  displayName: text("display_name"),
  status: text("status").notNull().default("active"),
  isPrimary: boolean("is_primary").notNull().default(false),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
