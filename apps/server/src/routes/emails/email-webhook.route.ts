import { Hono } from "hono";
import crypto from "crypto";
import { env } from "../../config/env";
import {
  createEmailWithAttachments,
  type CreateEmailInput,
  type CreateEmailAttachmentInput,
} from "../../db/mutations/email.mutations";

const emailWebhookRoute = new Hono();

/**
 * Resend webhook payload types
 */
type ResendAttachment = {
  id?: string;
  filename: string;
  content_type: string;
  size: number;
  content: string; // Base64 encoded
};

type ResendEmailData = {
  id: string;
  from: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  reply_to?: string[];
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, unknown>;
  created_at?: string;
  attachments?: ResendAttachment[];
};

type ResendWebhookPayload = {
  type: string;
  data: ResendEmailData;
};

/**
 * Verify Resend webhook signature.
 * Resend signs webhooks with HMAC SHA256.
 */
const verifyWebhookSignature = (
  payload: string,
  signature: string | undefined,
  secret: string,
): boolean => {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
};

/**
 * Resend Inbound Email Webhook Handler
 *
 * This endpoint receives POST requests from Resend when:
 * - A new email is received in your domain
 * - Email delivery status changes (sent, delivered, bounced, etc.)
 *
 * Configure this endpoint in your Resend dashboard:
 * https://resend.com/domains -> Your Domain -> Inbound Rules
 *
 * Webhook URL: https://your-domain.com/api/emails/webhook
 */
emailWebhookRoute.post("/", async (c) => {
  try {
    // Get the raw body as text for signature verification
    const rawBody = await c.req.text();
    const signature = c.req.header("resend-signature");

    // Verify webhook signature
    if (env.RESEND_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        rawBody,
        signature,
        env.RESEND_WEBHOOK_SECRET,
      );

      if (!isValid) {
        console.error("Invalid webhook signature");
        return c.json({ error: "Invalid signature" }, 401);
      }
    } else {
      console.warn(
        "RESEND_WEBHOOK_SECRET not set - skipping signature verification",
      );
    }

    // Parse the webhook payload
    const payload: ResendWebhookPayload = JSON.parse(rawBody);
    const { type, data } = payload;

    console.log(`Received Resend webhook: ${type}`, {
      emailId: data?.id,
      from: data?.from,
      to: data?.to,
    });

    // Handle inbound email events
    if (type === "email.received") {
      await handleInboundEmail(data);
    }

    // Handle email delivery events (for sent/outbound emails)
    else if (
      [
        "email.sent",
        "email.delivered",
        "email.delivery_delayed",
        "email.bounced",
        "email.complained",
      ].includes(type)
    ) {
      await handleEmailStatusUpdate(type, data);
    }

    // Handle email engagement events
    else if (["email.opened", "email.clicked"].includes(type)) {
      console.log(`Email ${type}:`, data);
      // You can add analytics tracking here
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500,
    );
  }
});

/**
 * Handle inbound email webhook
 */
const handleInboundEmail = async (data: ResendEmailData) => {
  try {
    // Prepare email input
    const emailInput: CreateEmailInput = {
      resendId: data.id,
      direction: "received",
      from: data.from,
      to: Array.isArray(data.to) ? data.to : [data.to],
      cc: data.cc || [],
      bcc: data.bcc || [],
      replyTo: data.reply_to || [],
      subject: data.subject || "(No Subject)",
      text: data.text || undefined,
      html: data.html || undefined,
      headers: data.headers || {},
      resendCreatedAt: new Date(data.created_at || Date.now()),
    };

    // Prepare attachments if present
    const attachmentsInput: Omit<CreateEmailAttachmentInput, "emailId">[] = [];

    if (data.attachments && Array.isArray(data.attachments)) {
      for (const att of data.attachments) {
        attachmentsInput.push({
          resendAttachmentId: att.id,
          filename: att.filename || "attachment",
          contentType: att.content_type || "application/octet-stream",
          size: att.size || 0,
          // Resend sends content as base64
          content: att.content || "",
        });
      }
    }

    // Store email and attachments in database
    const emailId = await createEmailWithAttachments(
      emailInput,
      attachmentsInput,
    );

    console.log(`Stored inbound email: ${emailId} (Resend ID: ${data.id})`);
  } catch (error) {
    console.error("Error storing inbound email:", error);
    throw error;
  }
};

/**
 * Handle email status update webhooks
 */
const handleEmailStatusUpdate = async (type: string, data: ResendEmailData) => {
  try {
    // Extract status from webhook type
    const statusMap: Record<string, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "delivery_delayed",
      "email.bounced": "bounced",
      "email.complained": "complained",
    };

    const status = statusMap[type];

    console.log(`Email status update: ${data.id} -> ${status}`);

    // TODO: Update email status in database
    // You can implement this by:
    // 1. Finding the email by resendId
    // 2. Updating the lastEvent field
    // For now, we just log it
  } catch (error) {
    console.error("Error handling email status update:", error);
    throw error;
  }
};

export default emailWebhookRoute;
