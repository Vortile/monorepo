import { env } from "../../config/env";
import {
  createWaba,
  createWabaCredential,
  createWabaPhoneNumber,
} from "../../db/mutations/waba.mutations";
import { getWabaByProviderAccountId } from "../../db/queries/waba.queries";
import { createMerchant } from "../../db/mutations/merchants.mutations";
import { db, waba } from "@vortile/database";
import { eq } from "drizzle-orm";

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

type SendMessageInput = {
  appId: string;
  phoneNumber: string; // Recipient's phone number
  message: {
    type: "text" | "image" | "document" | "template";
    text?: string;
    templateId?: string;
    templateParams?: string[];
    mediaUrl?: string;
    caption?: string;
  };
};

type SendMessageResult = {
  messageId: string;
  status: string;
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
 * Send a message using Gupshup's native Partner API (v2).
 * This uses Gupshup's native format, NOT Meta passthrough.
 * See: https://partner-docs.gupshup.io/reference/post_partner-app-appid-template-msg
 *
 * Why native API over passthrough:
 * - Simpler (one abstraction layer)
 * - Partner-optimized features
 * - Consistent with webhook format
 * - Better error handling
 */
export const sendMessage = async (
  input: SendMessageInput,
): Promise<SendMessageResult> => {
  const { appId, phoneNumber, message } = input;

  let endpoint = "";
  let body: Record<string, unknown> = {};

  switch (message.type) {
    case "text":
      // For simple text messages, use session message API
      endpoint = `/partner/app/${appId}/msg`;
      body = {
        channel: "whatsapp",
        destination: phoneNumber,
        message: message.text,
        "src.name": appId,
      };
      break;

    case "template":
      // For template messages with ID
      endpoint = `/partner/app/${appId}/template/msg`;
      body = {
        destination: phoneNumber,
        template: JSON.stringify({
          id: message.templateId,
          params: message.templateParams || [],
        }),
      };
      break;

    case "image":
    case "document":
      // For media messages
      endpoint = `/partner/app/${appId}/msg`;
      body = {
        channel: "whatsapp",
        destination: phoneNumber,
        message: {
          type: message.type,
          url: message.mediaUrl,
          caption: message.caption,
        },
        "src.name": appId,
      };
      break;

    default:
      throw new Error(`Unsupported message type: ${message.type}`);
  }

  const response = await fetch(`${env.GUPSHUP_PARTNER_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      token: env.GUPSHUP_PARTNER_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send message: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();
  return {
    messageId: data.messageId || data.response?.id,
    status: data.status,
  };
};

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
