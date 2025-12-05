import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";

/**
 * Merchants are the businesses using the platform (WABA customers).
 */
export const merchant = pgTable("merchant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
