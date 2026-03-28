import { Hono } from "hono";
import { Resend } from "resend";
import { env } from "../../config/env";
import emailWebhookRoute from "./email-webhook.route";
import {
  getEmailAttachmentById,
  getEmails,
  getEmailByResendIdOrId,
  getEmailAttachmentsByEmailId,
} from "../../db/queries/email.queries";
import { createEmail } from "../../db/mutations/email.mutations";

const emailsRoute = new Hono();

const getResend = () => new Resend(env.RESEND_API_KEY);

// Mount webhook route
emailsRoute.route("/webhook", emailWebhookRoute);

emailsRoute.get("/", async (c) => {
  const parsedLimit = Number(c.req.query("limit"));
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.floor(parsedLimit), 1), 50)
    : 10;

  const direction = c.req.query("direction");

  try {
    const emails = await getEmails(
      limit,
      direction === "sent" || direction === "received" ? direction : undefined,
    );

    const formatted = emails.map((email) => ({
      id: email.resendId,
      object: "email",
      from: email.from,
      to: email.to,
      subject: email.subject,
      created_at: email.resendCreatedAt.toISOString(),
      direction: email.direction,
      last_event: email.lastEvent ?? "delivered",
    }));

    return c.json({ data: formatted });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.post("/send", async (c) => {
  try {
    const { to, subject, message, from } = await c.req.json();

    const fromAddress =
      typeof from === "string" && from.trim()
        ? from.trim()
        : env.EMAIL_FROM || "onboarding@resend.dev";

    if (!to || !subject || !message) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const toArray = Array.isArray(to)
      ? to
      : typeof to === "string"
        ? to.split(",").map((e) => e.trim())
        : [to];

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toArray,
      subject,
      text: message,
    });

    if (error) {
      console.error("Resend send error:", error);
      return c.json(
        { error: error.message || "Failed to send email via Resend" },
        500,
      );
    }

    if (data?.id) {
      // Create the email in the DB since sent emails don't come through the inbound webhook
      await createEmail({
        resendId: data.id,
        direction: "sent",
        from: fromAddress,
        to: toArray,
        subject,
        text: message,
        lastEvent: "sent",
        resendCreatedAt: new Date(),
      }).catch((dbError) => {
        console.error("Failed to store sent email in database:", dbError);
        // We don't fail the request if DB insertion fails since the email was sent
      });
    }

    return c.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Missing id" }, 400);
  }

  try {
    const email = await getEmailByResendIdOrId(id);

    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }

    const attachments = await getEmailAttachmentsByEmailId(email.id);

    const formatted = {
      id: email.resendId,
      object: "email",
      from: email.from,
      to: email.to,
      cc: email.cc ?? [],
      bcc: email.bcc ?? [],
      reply_to: email.replyTo ?? [],
      subject: email.subject,
      text: email.text ?? "",
      html: email.html ?? "",
      headers: email.headers,
      created_at: email.resendCreatedAt.toISOString(),
      direction: email.direction,
      last_event: email.lastEvent ?? "delivered",
      attachments: attachments.map((att) => ({
        id: att.id,
        filename: att.filename,
        content_type: att.contentType,
        size: att.size,
      })),
    };

    return c.json({ data: formatted });
  } catch (error) {
    console.error("Error fetching email details:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Missing id" }, 400);
  }

  try {
    const resend = getResend();

    // Resend only allows canceling scheduled emails
    const { data, error } = await resend.emails.cancel(id);

    if (error) {
      console.error("Resend cancel error:", error);
      return c.json(
        { error: error.message || "Failed to cancel email via Resend" },
        500,
      );
    }

    return c.json({ data });
  } catch (error) {
    console.error("Error canceling email:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.get("/:emailId/attachments/:id", async (c) => {
  const emailId = c.req.param("emailId");
  const id = c.req.param("id");

  if (!emailId || !id) {
    return c.json({ error: "Missing emailId or attachment id" }, 400);
  }

  try {
    console.log(
      `Fetching attachment from database - emailId: ${emailId}, attachmentId: ${id}`,
    );

    const attachment = await getEmailAttachmentById(id);

    if (!attachment) {
      console.error("Attachment not found in database:", id);
      return c.json({ error: "Attachment not found" }, 404);
    }

    if (attachment.emailId !== emailId) {
      console.error("Attachment does not belong to this email");
      return c.json({ error: "Attachment not found" }, 404);
    }

    const buffer = Buffer.from(attachment.content, "base64");

    c.header(
      "Content-Type",
      attachment.contentType || "application/octet-stream",
    );
    c.header(
      "Content-Disposition",
      `inline; filename="${attachment.filename}"`,
    );
    c.header("Content-Length", String(buffer.length));

    return c.body(buffer as unknown as ArrayBuffer);
  } catch (error) {
    console.error("Error fetching attachment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return c.json({ error: errorMessage }, 500);
  }
});

export default emailsRoute;
