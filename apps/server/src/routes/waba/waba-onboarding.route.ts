import { Hono } from "hono";
import {
  registerManualOnboarding,
  getAppDetails,
  sendMessage,
} from "../../services/waba/waba-onboarding.service";
import { env } from "../../config/env";

const wabaOnboardingRoute = new Hono();

/**
 * POST /waba/onboarding/register
 *
 * Register a manually onboarded WABA from Gupshup.
 * Creates merchant AND WABA automatically.
 *
 * Flow:
 * 1. Admin manually onboards merchant through Gupshup Partner Portal UI
 * 2. Admin obtains: brandName, gupshupAppName, gupshupAppId
 * 3. Admin calls this endpoint - merchant is created automatically
 *
 * Request body:
 * {
 *   "brandName": "McDonald's",
 *   "gupshupAppName": "mcdonalds_app",
 *   "gupshupAppId": "abc123-def456"
 * }
 */
wabaOnboardingRoute.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { brandName, gupshupAppName, gupshupAppId } = body;

    // Validate required fields
    if (!brandName || !gupshupAppName || !gupshupAppId) {
      return c.json(
        {
          error:
            "Missing required fields: brandName, gupshupAppName, gupshupAppId",
        },
        400,
      );
    }

    // Register the manually onboarded app (creates merchant automatically)
    const result = await registerManualOnboarding({
      brandName,
      gupshupAppName,
      gupshupAppId,
    });

    return c.json({
      success: true,
      data: result,
      message: `Successfully registered ${brandName} with Gupshup app ${gupshupAppName}`,
    });
  } catch (error) {
    console.error("Error registering manual onboarding:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

/**
 * GET /waba/onboarding/app-details/:appId
 *
 * Get details of a specific Gupshup app.
 * Useful for validating appId before registration.
 */
wabaOnboardingRoute.get("/app-details/:appId", async (c) => {
  try {
    const appId = c.req.param("appId");

    if (!appId) {
      return c.json({ error: "Missing appId parameter" }, 400);
    }

    const details = await getAppDetails(appId);

    return c.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error("Error fetching app details:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

/**
 * POST /waba/onboarding/send-message
 *
 * Send a message using Gupshup's native Partner API.
 *
 * Request body:
 * {
 *   "appId": "abc123-def456",
 *   "phoneNumber": "+1234567890",
 *   "message": {
 *     "type": "text",
 *     "text": "Hello from our system!"
 *   }
 * }
 */
wabaOnboardingRoute.post("/send-message", async (c) => {
  try {
    const body = await c.req.json();
    const { appId, phoneNumber, message } = body;

    // Validate required fields
    if (!appId || !phoneNumber || !message) {
      return c.json(
        {
          error: "Missing required fields: appId, phoneNumber, message",
        },
        400,
      );
    }

    // Send the message
    const result = await sendMessage({
      appId,
      phoneNumber,
      message,
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

/**
 * GET/POST /waba/webhook
 *
 * Webhook endpoint for receiving notifications from Gupshup.
 * Handles both verification (GET) and incoming events (POST).
 *
 * Gupshup sends webhooks for:
 * - Inbound messages (version 2 & 3)
 * - System events (go-live-event, template updates, account events)
 * - User events
 * - Message events
 *
 * See: https://partner-docs.gupshup.io/docs/inbound-events
 */
wabaOnboardingRoute.get("/webhook", async (c) => {
  // Webhook verification (if Gupshup supports it)
  // Note: Gupshup Partner API docs don't explicitly mention verification like Meta does
  // This may need to be configured in the Partner Portal instead
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === env.GUPSHUP_WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return c.text(challenge || "");
  }

  return c.json({ error: "Verification failed" }, 403);
});

wabaOnboardingRoute.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();

    // Log the webhook payload for debugging
    console.log("Gupshup webhook received:", JSON.stringify(body, null, 2));

    // Determine webhook version and type
    const version = body.version || (body.object ? 3 : 2);

    if (version === 3) {
      // V3 Webhook Format (Meta passthrough style)
      await handleV3Webhook(body);
    } else {
      // V2 Webhook Format (Gupshup native)
      await handleV2Webhook(body);
    }

    return c.json({ status: "ok" });
  } catch (error) {
    console.error("Error processing Gupshup webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

/**
 * Handle V2 (Gupshup native) webhook format
 */
const handleV2Webhook = async (body: Record<string, unknown>) => {
  const { type, app, appId, payload } = body;

  console.log(`Processing V2 webhook: ${type} for app ${app} (${appId})`);

  switch (type) {
    case "message-event":
      await handleV2MessageEvent(payload as Record<string, unknown>);
      break;
    case "user-event":
      await handleV2UserEvent(payload as Record<string, unknown>);
      break;
    case "template-event":
      await handleV2TemplateEvent(payload as Record<string, unknown>);
      break;
    case "account-event":
      await handleV2AccountEvent(payload as Record<string, unknown>);
      break;
    default:
      console.log(`Unhandled V2 webhook type: ${type}`);
  }
};

/**
 * Handle V3 (Meta passthrough) webhook format
 */
const handleV3Webhook = async (body: Record<string, unknown>) => {
  const { object, entry } = body;

  console.log(`Processing V3 webhook for object: ${object}`);

  if (object !== "whatsapp_business_account") {
    console.log("Ignoring non-WABA webhook");
    return;
  }

  // Process each entry
  for (const item of (entry || []) as Array<Record<string, unknown>>) {
    const changes = (item.changes || []) as Array<Record<string, unknown>>;

    for (const change of changes) {
      const { value, field } = change;

      // Handle different webhook fields
      switch (field) {
        case "messages":
          await handleV3MessagesWebhook(value as Record<string, unknown>);
          break;
        case "account_update":
          await handleV3AccountUpdateWebhook(value as Record<string, unknown>);
          break;
        case "message_template_status_update":
          await handleV3TemplateStatusUpdateWebhook(
            value as Record<string, unknown>,
          );
          break;
        default:
          console.log(`Unhandled V3 webhook field: ${field}`);
      }
    }
  }
};

/**
 * Handle V2 message events
 */
const handleV2MessageEvent = async (payload: Record<string, unknown>) => {
  console.log("Processing V2 message event:", payload);
  // TODO: Process inbound messages, delivery receipts, read receipts
};

/**
 * Handle V2 user events (optin/optout)
 */
const handleV2UserEvent = async (payload: Record<string, unknown>) => {
  console.log("Processing V2 user event:", payload);
  // TODO: Handle user optin/optout events
};

/**
 * Handle V2 template events
 */
const handleV2TemplateEvent = async (payload: Record<string, unknown>) => {
  console.log("Processing V2 template event:", payload);
  // TODO: Update template status in database
};

/**
 * Handle V2 account events
 */
const handleV2AccountEvent = async (payload: Record<string, unknown>) => {
  console.log("Processing V2 account event:", payload);
  // TODO: Handle tier updates, quality rating changes, etc.
};

/**
 * Handle V3 incoming messages from WhatsApp users.
 */
const handleV3MessagesWebhook = async (value: Record<string, unknown>) => {
  console.log("Processing V3 messages webhook:", value);

  const messages = (value.messages as Array<Record<string, unknown>>) || [];

  for (const message of messages) {
    const { from, id, type, text, interactive } = message;

    console.log(`Received ${type} message from ${from}: ${id}`);

    // Handle different message types
    switch (type) {
      case "text":
        console.log(`Text message: ${(text as Record<string, unknown>)?.body}`);
        // TODO: Process text message
        break;
      case "interactive":
        console.log(
          `Interactive response: ${(interactive as Record<string, unknown>)?.type}`,
        );
        // TODO: Process interactive message (button click, list selection)
        break;
      default:
        console.log(`Unhandled message type: ${type}`);
    }
  }

  // Handle message statuses (delivered, read, etc.)
  const statuses = (value.statuses as Array<Record<string, unknown>>) || [];
  for (const status of statuses) {
    const { id, status: messageStatus, timestamp } = status;
    console.log(`Message ${id} status: ${messageStatus} at ${timestamp}`);
    // TODO: Update message status in database
  }
};

/**
 * Handle V3 account_update webhooks.
 * These notify of changes to the WABA (sharing, verification, etc.)
 */
const handleV3AccountUpdateWebhook = async (value: Record<string, unknown>) => {
  console.log("Processing V3 account_update webhook:", value);
  // TODO: Handle account updates (business verification, sharing, etc.)
};

/**
 * Handle V3 template status updates.
 */
const handleV3TemplateStatusUpdateWebhook = async (
  value: Record<string, unknown>,
) => {
  console.log("Processing V3 template status update webhook:", value);
  // TODO: Update template status in database
};

export default wabaOnboardingRoute;
