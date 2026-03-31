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
import { createEmailWithAttachments } from "../../db/mutations/email.mutations";

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
    const { to, subject, message, from, attachments } = await c.req.json();

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

    // Validate and normalize attachments
    type AttachmentInput = {
      filename: string;
      content: string; // base64
      contentType: string;
    };
    const parsedAttachments: AttachmentInput[] = Array.isArray(attachments)
      ? attachments.filter(
          (a) =>
            a &&
            typeof a.filename === "string" &&
            typeof a.content === "string" &&
            typeof a.contentType === "string",
        )
      : [];

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toArray,
      subject,
      text: message,
      attachments: parsedAttachments.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "base64"),
      })),
    });

    if (error) {
      console.error("Resend send error:", error);
      return c.json(
        { error: error.message || "Failed to send email via Resend" },
        500,
      );
    }

    if (data?.id) {
      // Store email + attachments in DB
      await createEmailWithAttachments(
        {
          resendId: data.id,
          direction: "sent",
          from: fromAddress,
          to: toArray,
          subject,
          text: message,
          lastEvent: "sent",
          resendCreatedAt: new Date(),
        },
        parsedAttachments.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          size: Buffer.byteLength(a.content, "base64"),
          content: a.content,
        })),
      ).catch((dbError) => {
        console.error("Failed to store sent email in database:", dbError);
      });
    }

    return c.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.post("/forward/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { to, from, message } = await c.req.json();

    if (!to) {
      return c.json({ error: "Missing required field: to" }, 400);
    }

    const originalEmail = await getEmailByResendIdOrId(id);
    if (!originalEmail) {
      return c.json({ error: "Email not found" }, 404);
    }

    const originalAttachments = await getEmailAttachmentsByEmailId(
      originalEmail.id,
    );

    const fromAddress =
      typeof from === "string" && from.trim()
        ? from.trim()
        : env.EMAIL_FROM || "onboarding@resend.dev";

    const toArray = Array.isArray(to)
      ? to
      : typeof to === "string"
        ? to.split(",").map((e: string) => e.trim())
        : [to];

    const forwardSubject = originalEmail.subject.startsWith("Fwd:")
      ? originalEmail.subject
      : `Fwd: ${originalEmail.subject}`;

    const originalDate = originalEmail.resendCreatedAt.toLocaleString();
    const originalFrom = originalEmail.from;
    const originalTo = originalEmail.to.join(", ");
    const originalSubject = originalEmail.subject;

    const separator = `\n\n---------- Forwarded message ----------\nFrom: ${originalFrom}\nDate: ${originalDate}\nSubject: ${originalSubject}\nTo: ${originalTo}\n\n`;

    const textBody = message
      ? `${message}${separator}${originalEmail.text ?? ""}`
      : `${separator}${originalEmail.text ?? ""}`;

    let htmlBody: string | undefined;
    if (originalEmail.html) {
      const userNote = message ? `<p>${message}</p><hr/>` : "";
      htmlBody = `${userNote}<blockquote style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><p><b>From:</b> ${originalFrom}<br/><b>Date:</b> ${originalDate}<br/><b>Subject:</b> ${originalSubject}<br/><b>To:</b> ${originalTo}</p>${originalEmail.html}</blockquote>`;
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toArray,
      subject: forwardSubject,
      text: textBody,
      ...(htmlBody ? { html: htmlBody } : {}),
      attachments: originalAttachments.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
      })),
    });

    if (error) {
      console.error("Resend forward error:", error);
      return c.json(
        { error: error.message || "Failed to forward email via Resend" },
        500,
      );
    }

    if (data?.id) {
      await createEmailWithAttachments(
        {
          resendId: data.id,
          direction: "sent",
          from: fromAddress,
          to: toArray,
          subject: forwardSubject,
          text: textBody,
          html: htmlBody,
          lastEvent: "sent",
          resendCreatedAt: new Date(),
        },
        originalAttachments.map((att) => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size,
          content: att.content,
        })),
      ).catch((dbError) => {
        console.error("Failed to store forwarded email in database:", dbError);
      });
    }

    return c.json(data);
  } catch (error) {
    console.error("Error forwarding email:", error);
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
