# Gupshup Partner API V3 - Message Sending Guide

## Overview

This implementation uses **Gupshup Partner API V3**, which provides a Meta Cloud API-compatible interface for sending WhatsApp messages. V3 API uses the same message format as Meta's Cloud API but is accessed through Gupshup's Partner Portal infrastructure.

## Why V3 API?

- **Meta Cloud API Format**: Uses the same message structure as Meta's official Cloud API
- **Partner Integration**: Accessed through Gupshup Partner Portal with Partner Token authentication
- **Future-Proof**: Aligns with Meta's official API structure for easier future migrations
- **Comprehensive**: Supports all message types (text, image, document, template, etc.)

## API Endpoint

```
POST https://partner.gupshup.io/partner/app/{APP_ID}/v3/message
```

## Authentication

```http
Authorization: {GUPSHUP_PARTNER_TOKEN}
Content-Type: application/json
```

## Message Types

### 1. Text Message

**Request:**

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5511999887766",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Hello! This is a test message."
  }
}
```

**Response:**

```json
{
  "messages": [
    {
      "id": "wamid.HBgLNTUxMTk5OTg4Nzc2..."
    }
  ],
  "contacts": [
    {
      "input": "5511999887766",
      "wa_id": "5511999887766"
    }
  ]
}
```

### 2. Template Message

**Request:**

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5511999887766",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "John Doe"
          }
        ]
      }
    ]
  }
}
```

### 3. Image Message

**Request:**

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5511999887766",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Check out this image!"
  }
}
```

### 4. Document Message

**Request:**

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5511999887766",
  "type": "document",
  "document": {
    "link": "https://example.com/document.pdf",
    "caption": "Your invoice",
    "filename": "invoice-2024.pdf"
  }
}
```

## Implementation

### Server Service

File: `apps/server/src/services/waba/waba-onboarding.service.ts`

```typescript
import { env } from "../../config/env";

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

  // Add message type-specific fields
  if ("text" in input) {
    body.type = "text";
    body.text = input.text;
  } else if ("template" in input) {
    body.type = "template";
    body.template = input.template;
  }
  // ... other message types

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
  const messages = Array.isArray(data.messages) ? data.messages : [];
  const messageId = messages[0]?.id || "unknown";

  return {
    messageId,
    status: data.status,
    contacts: data.contacts,
  };
};
```

### Convenience Functions

```typescript
// Send text message
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

// Send template message
export const sendTemplateMessage = async (params: {
  appId: string;
  to: string;
  templateName: string;
  languageCode: string;
  components?: Array<{...}>;
}): Promise<SendMessageResult> =>
  sendMessageV3({
    appId: params.appId,
    to: params.to,
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      components: params.components,
    },
  });
```

### Route Handler

File: `apps/server/src/routes/waba/waba.ts`

```typescript
import { sendTextMessage } from "../../services/waba/waba-onboarding.service";

wabaRoute.post("/send-message", async (c) => {
  const { wabaId, phoneNumber, messageBody } = await c.req.json();

  // Validation
  if (!wabaId || !phoneNumber || !messageBody) {
    return c.json(
      { error: "wabaId, phoneNumber and messageBody are required" },
      400,
    );
  }

  // Get Gupshup App ID from WABA metadata
  const appMetadata = await getWabaCredentialByType(wabaId, "app_metadata");
  const metadata = JSON.parse(appMetadata.metadata);
  const gupshupAppId = metadata.gupshupAppId;

  // Send message via Gupshup V3 API
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
});
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Gupshup Partner API Configuration
GUPSHUP_PARTNER_ID=your_partner_id
GUPSHUP_PARTNER_TOKEN=your_jwt_partner_token
GUPSHUP_PARTNER_API_URL=https://partner.gupshup.io
GUPSHUP_WEBHOOK_VERIFY_TOKEN=your_webhook_secret
```

## Phone Number Format

Always use **E.164 format without the + sign**:

- ✅ Correct: `5511999887766` (Brazil)
- ✅ Correct: `14155552671` (USA)
- ❌ Wrong: `+55 11 99988-7766`
- ❌ Wrong: `+1 (415) 555-2671`

## Error Handling

Common error responses:

### Invalid Phone Number

```json
{
  "error": {
    "message": "Invalid phone number",
    "code": 100
  }
}
```

### Template Not Found

```json
{
  "error": {
    "message": "Template not found or not approved",
    "code": 132000
  }
}
```

### Rate Limit

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "code": 131048
  }
}
```

## Dashboard Integration

File: `apps/admin/src/app/(dashboard)/send/page.tsx`

The dashboard send page now includes:

- **WABA ID field**: Internal database identifier
- **Phone number field**: E.164 format recipient
- **Message body**: Text content to send
- **Success feedback**: Shows message ID on successful send

## Testing

### Using Dashboard

1. Navigate to `/send` in the admin dashboard
2. Enter WABA ID (e.g., `waba_test_001`)
3. Enter phone number in E.164 format (e.g., `5511999887766`)
4. Type your message
5. Click "Send Message"
6. Check response for message ID

### Using API Directly

```bash
curl -X POST http://localhost:3000/api/waba/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "wabaId": "waba_test_001",
    "phoneNumber": "5511999887766",
    "messageBody": "Hello from Gupshup V3!"
  }'
```

### Using Onboarding Route (Advanced)

```bash
curl -X POST http://localhost:3000/api/waba/onboarding/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "your-gupshup-app-id",
    "to": "5511999887766",
    "text": {
      "body": "Hello from V3 API!"
    }
  }'
```

## Migration from V2

If you were using the old V2 API format:

### Old V2 Format

```typescript
await sendMessage({
  appId: "app-id",
  phoneNumber: "+1234567890",
  message: {
    type: "text",
    text: "Hello",
  },
});
```

### New V3 Format

```typescript
await sendTextMessage({
  appId: "app-id",
  to: "1234567890", // No + sign
  body: "Hello",
});
```

## Resources

- **Postman Collection**: https://documenter.getpostman.com/view/27893553/2sAXqy1dtP
- **Gupshup Partner Docs**: https://partner-docs.gupshup.io/docs
- **Meta Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Internal Memory**: `/memories/repo/gupshup-partner-api.md`

## Troubleshooting

### "App not found" error

- Verify `GUPSHUP_PARTNER_TOKEN` is valid
- Check that App ID exists in Partner Portal
- Ensure App ID is correctly stored in WABA credentials

### "Invalid phone number" error

- Remove all formatting (spaces, dashes, parentheses)
- Remove + sign from beginning
- Use country code (e.g., 55 for Brazil, 1 for USA)

### "unauthorized" error

- Check `GUPSHUP_PARTNER_TOKEN` environment variable
- Regenerate token in Partner Portal if expired
- Use `Authorization` header (not `token` like V2)

## Next Steps

1. **Message Tracking**: Store sent messages in database
2. **Webhook Processing**: Handle delivery receipts and inbound messages
3. **Template Management**: Implement template creation/listing
4. **Media Upload**: Support image/document uploads
5. **Batch Sending**: Send messages to multiple recipients
