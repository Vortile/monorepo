import { env } from "../../config/env";
import {
  createWaba,
  createWabaCredential,
  createWabaPhoneNumber,
} from "../../db/mutations/waba.mutations";
import { getWabaByProviderAccountId } from "../../db/queries/waba.queries";
import { createMerchant } from "../../db/mutations/merchants.mutations";
import { db, waba } from "@vortile/database";
import { eq } from "@vortile/database";

/**
 * Gupshup Partner API Types
 * See: https://partner-docs.gupshup.io/
 */

type RegisterManualOnboardingInput = {
  brandName: string; // e.g., "McDonald's" - will be used to create merchant
  gupshupAppName: string; // e.g., "mcdonalds_app" (from Gupshup)
  gupshupAppId: string; // Gupshup app ID after manual onboarding
};

type RegisterManualOnboardingResult = {
  wabaId: string; // Internal database ID
  providerAccountId: string; // Gupshup appId
  appName: string;
  phoneNumber: string | null;
};

type GupshupAppDetails = {
  appId: string;
  appName: string;
  phone: string | null;
  status: string;
  wabaId: string;
  namespace: string;
};

/**
 * V3 API Input Types - Meta Cloud API Format via Gupshup Partner API
 */
export type SendTextMessageInput = {
  appId: string;
  to: string; // Recipient's phone number in E.164 format
  text: {
    preview_url?: boolean;
    body: string;
  };
};

export type SendImageMessageInput = {
  appId: string;
  to: string;
  image: {
    link?: string;
    id?: string;
    caption?: string;
  };
};

export type SendDocumentMessageInput = {
  appId: string;
  to: string;
  document: {
    link?: string;
    id?: string;
    caption?: string;
    filename?: string;
  };
};

export type SendTemplateMessageInput = {
  appId: string;
  to: string;
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
        image?: { link: string };
        document?: { link: string };
      }>;
    }>;
  };
};

export type SendMessageInput =
  | SendTextMessageInput
  | SendImageMessageInput
  | SendDocumentMessageInput
  | SendTemplateMessageInput;

export type SendMessageResult = {
  messageId: string;
  status?: string;
  contacts?: Array<{ input: string; wa_id: string }>;
};

/**
 * Register a manually onboarded WABA from Gupshup.
 * This assumes the merchant has already completed Gupshup's embedded signup
 * and you have their app ID.
 *
 * Flow:
 * 1. Admin manually onboards merchant through Gupshup UI
 * 2. Admin gets appId, appName from Gupshup
 * 3. Admin calls this function with brandName, appName, appId
 * 4. System creates merchant AND WABA automatically
 */
export const registerManualOnboarding = async (
  input: RegisterManualOnboardingInput,
): Promise<RegisterManualOnboardingResult> => {
  const { brandName, gupshupAppName, gupshupAppId } = input;

  // 1. Validate app exists in Gupshup
  const appDetails = await getAppDetails(gupshupAppId);

  if (!appDetails.appId) {
    throw new Error(`App ${gupshupAppId} not found in Gupshup`);
  }

  // 2. Check if already registered
  const existingWaba = await getWabaByProviderAccountId(
    gupshupAppId,
    "gupshup",
  );

  if (existingWaba) {
    throw new Error(
      `App ${gupshupAppId} is already registered for merchant ${existingWaba.merchantId}`,
    );
  }

  // 3. Create merchant (clerkId will be added later when they authenticate)
  const merchants = await createMerchant({
    businessName: brandName,
    // clerkId omitted - will be linked later when merchant signs up
  });

  const merchant = merchants[0];
  if (!merchant) {
    throw new Error("Failed to create merchant");
  }

  const merchantId = merchant.id;

  // 4. Create WABA record in our database
  const internalWabaId = await createWaba({
    merchantId,
    provider: "gupshup",
    providerAccountId: gupshupAppId,
    businessPortfolioId: appDetails.wabaId, // Meta WABA ID
    coexistEnabled: false, // Coexist not auto-detectable, set via UI if needed
    onboardingMethod: "manual_gupshup",
    name: brandName,
    isPrimary: true,
  });

  // 5. Store app metadata
  await createWabaCredential({
    wabaId: internalWabaId,
    provider: "gupshup",
    type: "app_metadata",
    value: gupshupAppName,
    metadata: JSON.stringify({
      gupshupAppId,
      gupshupAppName,
      metaWabaId: appDetails.wabaId,
      namespace: appDetails.namespace,
      brandName,
    }),
  });

  // 6. Subscribe to webhooks for this app
  await subscribeToWebhooks({
    appId: gupshupAppId,
    mode: "MESSAGE", // Subscribe to message events
  });

  // 7. Store phone number if present
  if (appDetails.phone) {
    await createWabaPhoneNumber({
      wabaId: internalWabaId,
      merchantId,
      providerPhoneNumberId: appDetails.phone,
      phoneNumber: appDetails.phone,
      isPrimary: true,
    });
  }

  return {
    wabaId: internalWabaId,
    providerAccountId: gupshupAppId,
    appName: gupshupAppName,
    phoneNumber: appDetails.phone,
  };
};

/**
 * Send a message using Gupshup Partner API v3.
 * This uses Meta Cloud API format (passthrough) via Gupshup Partner Portal.
 *
 * API Documentation:
 * - Endpoint: POST /partner/app/{APP_ID}/v3/message
 * - Postman: https://documenter.getpostman.com/view/27893553/2sAXqy1dtP
 * - Uses Meta Cloud API message format
 * - Authentication via Partner Token in Authorization header
 *
 * @param input - Message data in Meta Cloud API format
 * @returns Message ID and delivery status
 */
export const sendMessageV3 = async (
  input: SendMessageInput,
): Promise<SendMessageResult> => {
  const { appId, to } = input;

  // Build message body in Meta Cloud API format
  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
  };

  // Determine message type and add type-specific fields
  if ("text" in input) {
    body.type = "text";
    body.text = input.text;
  } else if ("image" in input) {
    body.type = "image";
    body.image = input.image;
  } else if ("document" in input) {
    body.type = "document";
    body.document = input.document;
  } else if ("template" in input) {
    body.type = "template";
    body.template = input.template;
  } else {
    throw new Error("Invalid message input: no message type specified");
  }

  const endpoint = `/partner/app/${appId}/v3/message`;

  const response = await fetch(`${env.GUPSHUP_PARTNER_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: env.GUPSHUP_PARTNER_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send message (v3): ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();

  // Extract message ID from response
  // Meta Cloud API format: { messages: [{ id: "..." }] }
  const messages = Array.isArray(data.messages) ? data.messages : [];
  const messageId = messages[0]?.id || data.messageId || "unknown";

  return {
    messageId,
    status: data.status,
    contacts: data.contacts,
  };
};

/**
 * Convenience function to send a text message
 */
export const sendTextMessage = async (params: {
  appId: string;
  to: string;
  body: string;
  previewUrl?: boolean;
}): Promise<SendMessageResult> =>
  sendMessageV3({
    appId: params.appId,
    to: params.to,
    text: {
      body: params.body,
      preview_url: params.previewUrl,
    },
  });

/**
 * Convenience function to send a template message
 */
export const sendTemplateMessage = async (params: {
  appId: string;
  to: string;
  templateName: string;
  languageCode: string;
  components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text?: string;
      image?: { link: string };
      document?: { link: string };
    }>;
  }>;
}): Promise<SendMessageResult> =>
  sendMessageV3({
    appId: params.appId,
    to: params.to,
    template: {
      name: params.templateName,
      language: {
        code: params.languageCode,
      },
      components: params.components,
    },
  });

/**
 * Subscribe to webhooks for a specific app.
 * This allows us to receive inbound messages, status updates, and system events.
 * See: https://partner-docs.gupshup.io/reference/setsubscription-api-v3
 */
const subscribeToWebhooks = async (input: {
  appId: string;
  mode: "ACCOUNT" | "USER" | "MESSAGE";
  version?: "v2" | "v3";
}): Promise<{ success: boolean }> => {
  const { appId, mode, version = "v3" } = input;

  const response = await fetch(
    `${env.GUPSHUP_PARTNER_API_URL}/partner/app/${appId}/subscription`,
    {
      method: "POST",
      headers: {
        token: env.GUPSHUP_PARTNER_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        version,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to subscribe to webhooks: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();
  return { success: data.status === "success" };
};

/**
 * Get app details from Gupshup to validate and fetch metadata.
 * See: https://partner-docs.gupshup.io/reference/get_partner-app-appid-details
 */
export const getAppDetails = async (
  appId: string,
): Promise<GupshupAppDetails> => {
  const response = await fetch(
    `${env.GUPSHUP_PARTNER_API_URL}/partner/app/${appId}/details`,
    {
      method: "GET",
      headers: {
        token: env.GUPSHUP_PARTNER_TOKEN,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get app details: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();

  return {
    appId: data.appId || appId,
    appName: data.appName || data.name || "",
    phone: data.phone || null,
    status: data.status || "unknown",
    wabaId: data.wabaId || data.waId || "",
    namespace: data.namespace || "",
  };
};

/**
 * List all Gupshup apps for this partner account.
 * See: https://partner-docs.gupshup.io/reference/get_partner-account-api-partnerapps
 */
export const listAllApps = async (): Promise<{
  apps: Array<{
    id: string;
    name: string;
    phone?: string;
    customerId: string;
    live: boolean;
    stopped: boolean;
    healthy: boolean;
    createdOn: number;
    modifiedOn: number;
  }>;
}> => {
  const response = await fetch(
    `${env.GUPSHUP_PARTNER_API_URL}/partner/account/api/partnerApps`,
    {
      method: "GET",
      headers: {
        Authorization: env.GUPSHUP_PARTNER_TOKEN,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list apps: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.status !== "success") {
    throw new Error(`Gupshup API error: ${JSON.stringify(data)}`);
  }

  return {
    apps: data.partnerAppsList || [],
  };
};

/**
 * Soft delete a WABA from our system.
 * Marks the WABA as deleted without removing data.
 * This allows for recovery and maintains referential integrity.
 *
 * @param appId - The Gupshup app ID (providerAccountId in our DB)
 */
export const deleteApp = async (
  appId: string,
): Promise<{ success: boolean; message: string }> => {
  // Find WABA in our database
  const existingWaba = await getWabaByProviderAccountId(appId, "gupshup");

  if (!existingWaba) {
    throw new Error(`App ${appId} not found in database`);
  }

  if (existingWaba.isDeleted) {
    throw new Error(`App ${appId} is already deleted`);
  }

  // Soft delete: just mark as deleted
  await db
    .update(waba)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(waba.providerAccountId, appId));

  return {
    success: true,
    message: `App ${appId} has been soft deleted. Data preserved for recovery.`,
  };
};
