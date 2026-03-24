import { db, eq, desc, and, or } from "@vortile/database";
import { email, emailAttachment } from "@vortile/database";

export const getEmailByResendId = async (resendId: string) => {
  const result = await db
    .select()
    .from(email)
    .where(eq(email.resendId, resendId));
  return result[0] ?? null;
};

export const getEmailById = async (id: string) => {
  const result = await db.select().from(email).where(eq(email.id, id));
  return result[0] ?? null;
};

export const getEmailByResendIdOrId = async (idOrResendId: string) => {
  const result = await db
    .select()
    .from(email)
    .where(or(eq(email.id, idOrResendId), eq(email.resendId, idOrResendId)));
  return result[0] ?? null;
};

export const getEmails = async (
  limit: number = 10,
  direction?: "received" | "sent",
) => {
  const query = db.select().from(email);

  if (direction) {
    query.where(eq(email.direction, direction));
  }

  return await query.orderBy(desc(email.resendCreatedAt)).limit(limit);
};

export const getEmailAttachmentById = async (attachmentId: string) => {
  const result = await db
    .select()
    .from(emailAttachment)
    .where(eq(emailAttachment.id, attachmentId));
  return result[0] ?? null;
};

export const getEmailAttachmentsByEmailId = async (emailId: string) =>
  await db
    .select()
    .from(emailAttachment)
    .where(eq(emailAttachment.emailId, emailId));
