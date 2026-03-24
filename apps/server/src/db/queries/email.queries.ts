import { db, eq } from "@vortile/database";
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
