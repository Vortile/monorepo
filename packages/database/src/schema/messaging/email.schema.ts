import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";

/**
 * Internal Vortile email system - stores all inbound/outbound emails.
 * Not customer-facing, used only for Vortile's internal communication.
 */
export const email = pgTable("email", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),

  resendId: text("resend_id").notNull().unique(),
  direction: text("direction").notNull(),
  from: text("from").notNull(),
  to: jsonb("to").notNull().$type<string[]>(),
  cc: jsonb("cc").$type<string[]>(),
  bcc: jsonb("bcc").$type<string[]>(),
  replyTo: jsonb("reply_to").$type<string[]>(),
  subject: text("subject").notNull(),
  text: text("text"),
  html: text("html"),
  headers: jsonb("headers"),
  lastEvent: text("last_event"),
  scheduledAt: timestamp("scheduled_at"),
  resendCreatedAt: timestamp("resend_created_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
