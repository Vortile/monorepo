import { Hono } from "hono";
import {
  getAllWabas,
  getWabasByMerchantId,
  getWabaCredentialByType,
} from "../../db/queries/waba.queries";
import { sendTextMessage } from "../../services/waba/waba-onboarding.service";

const wabaRoute = new Hono();

// Get all WABAs (admin view)
// Optional query param: ?merchantId=xxx to filter by merchant
wabaRoute.get("/", async (c) => {
  try {
    const merchantId = c.req.query("merchantId");

    const wabas = merchantId
      ? await getWabasByMerchantId(merchantId)
      : await getAllWabas();

    return c.json({
      success: true,
      data: wabas,
    });
  } catch (error) {
    console.error("Error fetching WABAs:", error);
    return c.json({ error: "Failed to fetch WABAs" }, 500);
  }
});

wabaRoute.post("/send-message", async (c) => {
  // V3 API: Send a text message via Gupshup Partner API
  const { wabaId, phoneNumber, messageBody } = await c.req.json();

  if (!wabaId || !phoneNumber || !messageBody) {
    return c.json(
      { error: "wabaId, phoneNumber and messageBody are required" },
      400,
    );
  }

  console.log(
    `[V3] Sending WhatsApp text to ${phoneNumber} via WABA ${wabaId}`,
  );

  try {
    // Get WABA metadata to find the Gupshup app ID
    const appMetadata = await getWabaCredentialByType(wabaId, "app_metadata");

    if (!appMetadata || !appMetadata.metadata) {
      return c.json(
        { error: "WABA not properly configured. Missing app metadata." },
        400,
      );
    }

    const metadata = JSON.parse(appMetadata.metadata);
    const gupshupAppId = metadata.gupshupAppId;

    if (!gupshupAppId) {
      return c.json(
        { error: "WABA not properly configured. Missing Gupshup App ID." },
        400,
      );
    }

    // Send message via Gupshup V3 API (Meta Cloud API format)
    const result = await sendTextMessage({
      appId: gupshupAppId,
      to: phoneNumber,
      body: messageBody,
    });

    return c.json({
      success: true,
      messageId: result.messageId,
      status: result.status,
      contacts: result.contacts,
    });
  } catch (error) {
    console.error("Error sending message via Gupshup V3:", error);
    return c.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

wabaRoute.post("/create-template", async (c) => {
  const {
    wabaId,
    templateName,
    category,
    bodyText,
    language = "en",
  } = await c.req.json();

  if (!wabaId || !templateName || !category || !bodyText) {
    return c.json(
      { error: "wabaId, templateName, category, and bodyText are required" },
      400,
    );
  }

  console.log(`Creating template ${templateName} for WABA ${wabaId}`);

  try {
    // Get WABA metadata to find the Gupshup app ID
    const appMetadata = await getWabaCredentialByType(wabaId, "app_metadata");

    if (!appMetadata || !appMetadata.metadata) {
      return c.json(
        { error: "WABA not properly configured. Missing app metadata." },
        400,
      );
    }

    const metadata = JSON.parse(appMetadata.metadata);
    const gupshupAppId = metadata.gupshupAppId;

    if (!gupshupAppId) {
      return c.json(
        { error: "WABA not properly configured. Missing Gupshup App ID." },
        400,
      );
    }

    // TODO: Implement template creation via Gupshup Partner API
    // For now, return a message that templates should be created via Gupshup Partner Portal
    return c.json(
      {
        message: "Template creation should be done via Gupshup Partner Portal",
        partnerPortalUrl: "https://partner.gupshup.io",
        templateData: {
          appId: gupshupAppId,
          templateName,
          category,
          bodyText,
          language,
        },
      },
      501, // Not Implemented
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return c.json(
      {
        error: "Failed to create template",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

export default wabaRoute;
