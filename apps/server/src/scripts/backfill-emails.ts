import { config } from "dotenv";
import { join } from "path";

// Load env vars FIRST before importing anything that uses them
config({ path: join(__dirname, "../../.env.local") });

import { Resend } from "resend";
import { createEmailWithAttachments } from "../db/mutations/email.mutations";

const resend = new Resend(process.env.RESEND_API_KEY);

const backfillEmails = async () => {
  console.log("Starting email backfill for last 30 days...\n");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    console.log("Fetching received emails from Resend...");
    const { data: receivedList, error: receivedError } =
      await resend.emails.receiving.list({ limit: 100 });

    if (receivedError) {
      console.error("Error fetching received emails:", receivedError);
      return;
    }

    const receivedEmails = receivedList?.data || [];
    console.log(`Found ${receivedEmails.length} received emails\n`);

    let stored = 0;
    let skipped = 0;
    let failed = 0;

    for (const email of receivedEmails) {
      const emailDate = new Date(email.created_at);

      if (emailDate < thirtyDaysAgo) {
        skipped++;
        continue;
      }

      try {
        console.log(`Processing email: ${email.id} - ${email.subject}`);

        const { data: emailDetails, error: detailError } =
          await resend.emails.receiving.get(email.id);

        if (detailError || !emailDetails) {
          console.error(`  ✗ Failed to fetch details: ${detailError}`);
          failed++;
          continue;
        }

        const emailInput = {
          resendId: emailDetails.id,
          direction: "received" as const,
          from: emailDetails.from,
          to: Array.isArray(emailDetails.to)
            ? emailDetails.to
            : [emailDetails.to],
          cc: emailDetails.cc || [],
          bcc: emailDetails.bcc || [],
          replyTo: emailDetails.reply_to || [],
          subject: emailDetails.subject || "(No Subject)",
          text: emailDetails.text ?? undefined,
          html: emailDetails.html ?? undefined,
          headers: emailDetails.headers || {},
          resendCreatedAt: new Date(emailDetails.created_at),
        };

        // Note: Resend API doesn't provide attachment content in received emails
        // Only metadata is available. Content is only in webhook payloads.
        const attachmentsInput =
          emailDetails.attachments?.map((att) => ({
            resendAttachmentId: att.id,
            filename: att.filename || "attachment",
            contentType: att.content_type || "application/octet-stream",
            size: att.size || 0,
            content: "", // Content not available via API, only in webhooks
          })) || [];

        await createEmailWithAttachments(emailInput, attachmentsInput);

        console.log(
          `  ✓ Stored with ${attachmentsInput.length} attachment(s)`,
        );
        stored++;
      } catch (err) {
        console.error(
          `  ✗ Failed to store email:`,
          err instanceof Error ? err.message : err,
        );
        failed++;
      }
    }

    console.log("\n=== Backfill Complete ===");
    console.log(`Stored: ${stored} emails`);
    console.log(`Skipped (older than 30 days): ${skipped}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    console.error("Fatal error during backfill:", error);
    process.exit(1);
  }
};

backfillEmails()
  .then(() => {
    console.log("\nBackfill completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nBackfill failed:", error);
    process.exit(1);
  });
