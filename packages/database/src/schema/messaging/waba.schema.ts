import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { merchant } from "../merchants/merchant.schema";

/**
 * WhatsApp Business Accounts (WABAs) connected to Vortile.
 * One Merchant can have many WABAs (e.g. multiple brands or regions).
 */
export const waba = pgTable("waba", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),

  /** Provider identifier (e.g. "gupshup", "meta"). */
  provider: text("provider").notNull(),

  /** Provider account identifier (e.g. Meta WABA ID). */
  providerAccountId: text("provider_account_id"),

  /** Provider app identifier (e.g. GupShup App ID). */
  providerAppId: text("provider_app_id"),

  /** Business portfolio ID from Meta (for embedded signup). */
  businessPortfolioId: text("business_portfolio_id"),

  /** Coexist mode enabled - user can use both Business App and Cloud API. */
  coexistEnabled: boolean("coexist_enabled").notNull().default(false),

  /** Onboarding method (embedded_signup, manual, etc.) */
  onboardingMethod: text("onboarding_method"),

  name: text("name"),
  status: text("status").notNull().default("active"),
  isPrimary: boolean("is_primary").notNull().default(false),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
