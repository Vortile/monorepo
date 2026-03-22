# WhatsApp Business API (WABA) Onboarding with Coexist Mode

## Overview

This implementation provides a complete solution for onboarding WhatsApp Business Accounts (WABAs) using Meta's Embedded Signup flow with support for **Coexist Mode**.

### What is Coexist Mode?

Coexist mode allows merchants to use **both** the WhatsApp Business App (on their mobile device) **and** the Cloud API simultaneously. Previously, connecting a WhatsApp number to the Cloud API would prevent the user from accessing the Business App. With coexist mode, merchants get the best of both worlds:

- ✅ Use the WhatsApp Business App for quick manual responses
- ✅ Use the Cloud API for automated messages, integrations, and bulk messaging
- ✅ All messages stay in sync across both platforms

## Architecture

### Tech Stack

- **Meta WhatsApp Cloud API** (v25.0)
- **Meta Embedded Signup** for seamless merchant onboarding
- **Drizzle ORM** for database operations
- **Hono** for API routing
- **TypeScript** for type safety

### Database Schema

#### `waba` Table

Stores WhatsApp Business Account information.

| Field                 | Type    | Description                       |
| --------------------- | ------- | --------------------------------- |
| `id`                  | text    | Internal WABA ID                  |
| `merchantId`          | text    | Associated merchant               |
| `provider`            | text    | "meta" or "gupshup"               |
| `providerAccountId`   | text    | Meta WABA ID                      |
| `businessPortfolioId` | text    | Meta Business Portfolio ID        |
| `coexistEnabled`      | boolean | Whether coexist mode is active    |
| `onboardingMethod`    | text    | "embedded_signup", "manual", etc. |
| `status`              | text    | "active", "suspended", etc.       |

#### `waba_credential` Table

Stores API credentials securely.

| Field       | Type      | Description                             |
| ----------- | --------- | --------------------------------------- |
| `wabaId`    | text      | Associated WABA                         |
| `type`      | text      | "business_token", "phone_2fa_pin", etc. |
| `value`     | text      | Encrypted credential value              |
| `metadata`  | text      | JSON metadata                           |
| `expiresAt` | timestamp | Token expiration (if applicable)        |

#### `waba_phone_number` Table

Stores phone numbers associated with WABAs.

| Field                   | Type    | Description                 |
| ----------------------- | ------- | --------------------------- |
| `wabaId`                | text    | Associated WABA             |
| `providerPhoneNumberId` | text    | Meta phone number ID        |
| `phoneNumber`           | text    | E.164 format phone number   |
| `displayName`           | text    | Business display name       |
| `isPrimary`             | boolean | Primary number for the WABA |

## API Endpoints

### 1. Embedded Signup Callback

**Endpoint:** `POST /api/waba/onboarding/embedded-signup-callback`

This endpoint receives the callback from Meta's Embedded Signup flow after a merchant completes onboarding.

**Request Body:**

```json
{
  "sessionData": {
    "data": {
      "phone_number_id": "106540352242922",
      "waba_id": "524126980791429",
      "business_id": "2729063490586005"
    },
    "type": "WA_EMBEDDED_SIGNUP",
    "event": "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
  },
  "tokenCode": "AQBhlXsctMxJYbwbrpybxlo9tLP...",
  "merchantId": "merchant_123"
}
```

**Event Types:**

- `FINISH` - Standard Cloud API onboarding (coexist disabled)
- `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING` - Coexist mode enabled ✨
- `FINISH_ONLY_WABA` - WABA created without phone number
- `CANCEL` - User cancelled the flow

**Response:**

```json
{
  "success": true,
  "data": {
    "wabaId": "waba_internal_id",
    "phoneNumberId": "106540352242922",
    "providerAccountId": "524126980791429",
    "businessPortfolioId": "2729063490586005",
    "coexistEnabled": true,
    "onboardingMethod": "embedded_signup"
  }
}
```

**What Happens Internally:**

1. ✅ Validates session data
2. ✅ Exchanges token code for long-lived business token
3. ✅ Creates WABA record in database
4. ✅ Stores business token securely
5. ✅ Subscribes to webhooks
6. ✅ Registers phone number with 2FA PIN
7. ✅ Stores phone number in database

### 2. Webhook Verification

**Endpoint:** `GET /api/waba/onboarding/webhook`

Meta uses this to verify your webhook endpoint during setup.

**Query Parameters:**

- `hub.mode=subscribe`
- `hub.verify_token=YOUR_VERIFY_TOKEN`
- `hub.challenge=random_string`

**Response:** Returns the `hub.challenge` value.

### 3. Webhook Events

**Endpoint:** `POST /api/waba/onboarding/webhook`

Receives real-time notifications from Meta for:

- 📨 **Incoming messages** (text, media, interactive)
- ✅ **Message status updates** (sent, delivered, read)
- 🏢 **Account updates** (verification, capabilities)
- 📝 **Template status changes** (approved, rejected)

**Example Webhook Payload (Incoming Message):**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "524126980791429",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550783881",
              "phone_number_id": "106540352242922"
            },
            "messages": [
              {
                "from": "16505551234",
                "id": "wamid.HBgL...",
                "timestamp": "1703091234",
                "type": "text",
                "text": {
                  "body": "Hello! I need help with my order."
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

## Frontend Integration

### Step 1: Add Meta JavaScript SDK

Add this to your HTML page:

```html
<script
  async
  defer
  crossorigin="anonymous"
  src="https://connect.facebook.net/en_US/sdk.js"
></script>
```

### Step 2: Initialize SDK

```javascript
window.fbAsyncInit = function () {
  FB.init({
    appId: "YOUR_META_APP_ID",
    autoLogAppEvents: true,
    xfbml: true,
    version: "v25.0",
  });
};
```

### Step 3: Listen for Session Data

```javascript
window.addEventListener("message", (event) => {
  if (!event.origin.endsWith("facebook.com")) return;

  try {
    const data = JSON.parse(event.data);
    if (data.type === "WA_EMBEDDED_SIGNUP") {
      console.log("Session data:", data);
      // Send to your backend
      sendToBackend(data);
    }
  } catch (e) {
    console.error(e);
  }
});
```

### Step 4: Handle Token Code

```javascript
const fbLoginCallback = (response) => {
  if (response.authResponse) {
    const tokenCode = response.authResponse.code;
    console.log("Token code:", tokenCode);
    // Send to your backend along with session data
    sendToBackend(sessionData, tokenCode);
  }
};

const launchWhatsAppSignup = () => {
  FB.login(fbLoginCallback, {
    config_id: "YOUR_CONFIGURATION_ID",
    response_type: "code",
    override_default_response_type: true,
    extras: {
      setup: {},
    },
  });
};
```

### Step 5: Send to Backend

```javascript
async function sendToBackend(sessionData, tokenCode) {
  const response = await fetch(
    "/api/waba/onboarding/embedded-signup-callback",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionData,
        tokenCode,
        merchantId: "current_merchant_id", // Get from auth context
      }),
    },
  );

  const result = await response.json();

  if (result.success) {
    console.log("WABA onboarded successfully!", result.data);
    if (result.data.coexistEnabled) {
      console.log("✨ Coexist mode is enabled!");
    }
  }
}
```

## Testing

### Run Unit Tests

```bash
pnpm test
```

### Test Webhook Locally with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your server: `pnpm dev`
3. Create tunnel: `ngrok http 3000`
4. Update webhook URL in Meta App Dashboard to: `https://your-ngrok-url.ngrok.io/api/waba/onboarding/webhook`

### Send Test Message

Once onboarded, you can send a test message:

```bash
curl -X POST https://graph.facebook.com/v25.0/PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "16505551234",
    "type": "text",
    "text": {
      "body": "Hello from Vortile!"
    }
  }'
```

## Environment Variables

See `.env.example` for required configuration.

## Common Issues & Troubleshooting

### Issue: Token exchange fails

**Solution:** Verify `META_APP_ID` and `META_APP_SECRET` are correct.

### Issue: Webhook verification fails

**Solution:** Ensure `META_WEBHOOK_VERIFY_TOKEN` matches the value in Meta App Dashboard.

### Issue: Not receiving webhooks

**Solution:**

1. Check that webhook URL is publicly accessible (use ngrok for local dev)
2. Verify webhook is subscribed to correct fields in App Dashboard
3. Check server logs for errors

### Issue: Coexist mode not working

**Solution:** Ensure user selected the option to keep Business App access during embedded signup flow. The `event` field should be `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING`.

## Security Best Practices

1. **Always validate webhook signatures** (implement X-Hub-Signature-256 verification)
2. **Encrypt credentials at rest** using a secrets manager
3. **Use HTTPS** for all webhook endpoints
4. **Rotate tokens** periodically
5. **Implement rate limiting** on your API endpoints
6. **Log all webhook events** for audit trail

## Resources

- [Meta Embedded Signup Documentation](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [WhatsApp Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Gupshup Partner Documentation](https://partner-docs.gupshup.io/docs)

## Support

For issues or questions:

1. Check the logs: `pnpm logs`
2. Review database state: `pnpm db:studio`
3. Contact: support@vortile.io
