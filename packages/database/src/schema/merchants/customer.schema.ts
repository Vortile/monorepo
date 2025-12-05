import { pgTable, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { merchant } from "./merchant.schema";
import { generateId } from "../../ids";

/** End customers who purchase from merchants. Scoped to a specific merchant. */
export const customer = pgTable("customer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  name: text("name"),
  phone: text("phone").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

/** Delivery addresses for customers. */
export const address = pgTable("address", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  label: text("label"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
