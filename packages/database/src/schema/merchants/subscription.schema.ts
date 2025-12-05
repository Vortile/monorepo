import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { merchant } from "./merchant.schema";

/**
 * The "Menu" of subscription options available to merchants.
 * Defines limits and pricing for each tier.
 */
export const plans = pgTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name").notNull(), // "Free", "Starter", "Pro"
  slug: text("slug").notNull().unique(), // "free-tier-v1", "starter-2025"

  // The Limits & Pricing Logic
  monthlyPriceCents: integer("monthly_price_cents").notNull(), // 0, 9700, 29700
  includedOrders: integer("included_orders").notNull(), // 30, 150, 600
  overagePriceCents: integer("overage_price_cents").notNull(), // 100, 80, 50 (per extra order)

  isActive: boolean("is_active").default(true).notNull(), // If false, new users can't select this
  externalProductId: text("external_product_id"), // ID in Asaas/Stripe

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * The link between a Merchant and a Plan.
 * Tracks the current status and billing cycle.
 */
export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),

  status: text("status").notNull(), // "active", "past_due", "canceled", "trialing"

  // Billing Cycle (Crucial for resetting counters)
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),

  externalSubscriptionId: text("external_subscription_id"), // ID in Asaas/Stripe

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
