import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { env } from "../../config/env";

const GRAPH_API_VERSION = "v24.0";
const META_WABA_ACCESS_TOKEN = env.META_WABA_ACCESS_TOKEN;
const META_WABA_PHONE_NUMBER_ID = env.META_WABA_PHONE_NUMBER_ID;
const META_WABA_ID = env.META_WABA_ID;

type MessageType = "text" | "interactive" | "reaction" | "template";
type MessageInteractionType =
  | "text"
  | "location_request_message"
  | "address_message";

type MessageBasePayload = {
  to: string;
  type: MessageType;
  messaging_product: "whatsapp";
};
type MessagePayload = MessageBasePayload &
  (
    | {
        type: "text";
        text: {
          preview_url?: boolean;
          body: string;
        };
      }
    | {
        type: "interactive";
        interactive: {
          type: MessageInteractionType;
          body: {
            text: string;
          };
        };
      }
  );

const wabaRoute = new Hono();

wabaRoute.post("/send-message", async (c) => {
  const { phoneNumber, messageBody } = await c.req.json();

  if (!phoneNumber || !messageBody) {
    return c.json({ error: "phoneNumber and messageBody are required" }, 400);
  }

  console.log(`Sending WhatsApp text to ${phoneNumber}`);

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_WABA_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${META_WABA_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: messageBody },
      } satisfies MessagePayload),
    });
    console.log("Response from meta:", response);

    const data = await response.json();
    c.status(response.status as StatusCode);
    return c.json(data);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

wabaRoute.post("/create-template", async (c) => {
  const { templateName, category, bodyText } = await c.req.json();

  if (!templateName || !category || !bodyText) {
    return c.json(
      { error: "templateName, category, and bodyText are required" },
      400,
    );
  }

  console.log(`Creating template ${templateName}`);

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_WABA_ID}/message_templates`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${META_WABA_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        name: templateName,
        category,
        language: "pt_BR",
        components: [
          {
            type: "BODY",
            text: bodyText,
          },
        ],
      }),
    });
    console.log("Response from meta:", response);

    const data = await response.json();
    c.status(response.status as StatusCode);
    return c.json(data);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create template" }, 500);
  }
});

export default wabaRoute;
