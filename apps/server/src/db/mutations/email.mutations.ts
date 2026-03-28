import { db, eq } from "@vortile/database";
import { email, emailAttachment } from "@vortile/database";
import { generateId } from "../../lib/id-generator";

export type CreateEmailInput = {
  resendId: string;
  direction: "received" | "sent";
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, unknown>;
  lastEvent?: string;
  scheduledAt?: Date;
  resendCreatedAt: Date;
};

export type CreateEmailAttachmentInput = {
  emailId: string;
  resendAttachmentId?: string;
  filename: string;
  contentType: string;
  size: number;
  content: string; // Base64 encoded
};

/**
 * Create a new email record in the database.
 * Returns the created email ID.
 */
export const createEmail = async (input: CreateEmailInput) => {
  const id = generateId();
  const now = new Date();

  await db.insert(email).values({
    id,
    resendId: input.resendId,
    direction: input.direction,
    from: input.from,
    to: input.to,
    cc: input.cc ?? null,
    bcc: input.bcc ?? null,
    replyTo: input.replyTo ?? null,
    subject: input.subject,
    text: input.text ?? null,
    html: input.html ?? null,
    headers: input.headers ?? null,
    lastEvent: input.lastEvent ?? null,
    scheduledAt: input.scheduledAt ?? null,
    resendCreatedAt: input.resendCreatedAt,
    createdAt: now,
    updatedAt: now,
  });

  return id;
};

/**
 * Create email attachments in the database.
 * Returns an array of created attachment IDs.
 */
export const createEmailAttachments = async (
  attachments: CreateEmailAttachmentInput[],
) => {
  if (attachments.length === 0) return [];

  const now = new Date();
  const values = attachments.map((att) => ({
    id: generateId(),
    emailId: att.emailId,
    resendAttachmentId: att.resendAttachmentId ?? null,
    filename: att.filename,
    contentType: att.contentType,
    size: att.size,
    content: att.content,
    createdAt: now,
  }));

  await db.insert(emailAttachment).values(values);

  return values.map((v) => v.id);
};

/**
 * Create an email with attachments in a single transaction.
 */
export const createEmailWithAttachments = async (
  emailInput: CreateEmailInput,
  attachmentsInput: Omit<CreateEmailAttachmentInput, "emailId">[],
) => {
  const emailId = await createEmail(emailInput);

  if (attachmentsInput.length > 0) {
    const attachmentsWithEmailId = attachmentsInput.map((att) => ({
      ...att,
      emailId,
    }));
    await createEmailAttachments(attachmentsWithEmailId);
  }

  return emailId;
};

/**
 * Update the status (lastEvent) of an existing email
 */
export const updateEmailStatus = async (resendId: string, status: string) => {
  await db
    .update(email)
    .set({ lastEvent: status, updatedAt: new Date() })
    .where(eq(email.resendId, resendId));
};
