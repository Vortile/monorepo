import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { email } from "./email.schema";

export const emailAttachment = pgTable("email_attachment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),

  emailId: text("email_id")
    .notNull()
    .references(() => email.id, { onDelete: "cascade" }),

  resendAttachmentId: text("resend_attachment_id"),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  // Base64-encoded file content
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
