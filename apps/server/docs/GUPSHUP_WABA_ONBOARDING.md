# Gupshup WABA Onboarding Guide

> **⚠️ IMPLEMENTATION UPDATE (March 2024)**:
> We have implemented **Gupshup Partner API V3**, which uses Meta Cloud API format via Gupshup's passthrough layer.
> See [GUPSHUP_V3_API.md](./GUPSHUP_V3_API.md) for the current V3 implementation guide.
> This document provides historical context and general WABA onboarding information.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decision: Native API vs Passthrough](#architecture-decision)
3. [Manual Onboarding Flow](#manual-onboarding-flow)
4. [API Endpoints](#api-endpoints)
5. [Environment Configuration](#environment-configuration)
6. [Coexist Mode](#coexist-mode)
7. [Sending Messages](#sending-messages)
8. [Webhooks](#webhooks)
9. [Testing](#testing)

---

## Overview

This system integrates with **Gupshup Partner Portal** to enable WhatsApp Business API (WABA) messaging for merchants. As a Tech Provider/ISV, we use Gupshup as our BSP (Business Solution Provider) to access Meta's WhatsApp Business Platform.

### Why Gupshup?

- **BSP Requirement**: We cannot directly integrate with Meta's Cloud API; we must work through a BSP
- **Partner APIs**: Gupshup provides specialized Partner Portal APIs for Tech Providers
- **Wallet Management**: Centralized billing and commission management
- **Support**: Gupshup handles Meta API updates and provides dedicated support

---

## Architecture Decision: Native API vs Passthrough

### The Question

Should we use **Gupshup Native Partner APIs** or **Gupshup's Meta Passthrough APIs v3**?

### Decision: Use Native Partner APIs

### Rationale

#### ✅ Advantages of Native Partner APIs

1. **Simpler Architecture**
   - ONE abstraction layer (Your App → Gupshup → Meta)
   - Passthrough would be: Your App → Gupshup API → Gupshup Internal → Meta
   - Less latency, fewer failure points

2. **Partner-Optimized Features**
   - Designed specifically for Tech Providers/ISVs
   - Partner Token authentication (simpler than per-customer tokens)
   - Wallet and commission management built-in
   - Bulk operations for multi-tenant scenarios

3. **Consistent Webhook Format**
   - Webhooks use Gupshup's v2/v3 format
   - Using native APIs keeps request/response consistent
   - Less context switching between formats

4. **Better Error Handling**
   - Errors are Gupshup-native, not wrapped Meta errors
   - Clearer debugging and support path
   - Gupshup support owns the full stack

5. **No Vendor Lock-In Benefit from Passthrough**
   - You're locked into Gupshup either way (BSP requirement)
   - Passthrough doesn't give you portability
   - If you need to switch BSPs, you'll rewrite regardless

#### ❌ Why NOT Passthrough APIs

1. **Double Abstraction**
   - Gupshup wraps Meta API responses
   - Errors get double-wrapped
   - Harder to debug

2. **Feature Lag Risk**
   - Gupshup may not immediately support new Meta features in passthrough
   - Native APIs get partner-specific features first

3. **Inconsistent Ecosystem**
   - Your requests use Meta format
   - Your webhooks use Gupshup format
   - Constant mental model switching

4. **No Direct Benefit**
   - Can't bypass Gupshup anyway
   - Still need Partner Token
   - No cost savings

### When to Consider Passthrough

- **Only if** you have existing Meta Cloud API code you want to reuse quickly
- **Only for** gradual migration (but expect to refactor anyway)
- **NOT recommended** for new development

---

## Manual Onboarding Flow

### Why Manual?

There is **no automatic API** for onboarding WABAs. Merchants must complete Gupshup's embedded signup flow through their UI. This is intentional:

1. **Security**: Meta requires explicit merchant consent
2. **Verification**: Business verification happens during signup
3. **Coexist Mode**: User chooses during signup (cannot be forced via API)

### Step-by-Step Process

#### Step 1: Admin Manually Onboards Merchant (Gupshup Portal)

1. Log in to [Gupshup Partner Portal](https://partner.gupshup.io)
2. Create new app OR use embedded signup link
3. Merchant completes Meta's embedded signup flow
4. Merchant's WABA is linked to app

**Outputs from this step:**

- `gupshupAppId`: Unique app identifier (e.g., `abc123-def456`)
- `gupshupAppName`: App name in Gupshup (e.g., `mcdonalds_app`)
- WABA is now live and ready to send messages

#### Step 2: Register the Onboarded App in Your System

Call the registration API with app details:

```bash
POST /waba/onboarding/register
Content-Type: application/json

{
  "brandName": "McDonald's",
  "gupshupAppName": "mcdonalds_app",
  "gupshupAppId": "abc123-def456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "wabaId": "internal-waba-id",
    "providerAccountId": "abc123-def456",
    "appName": "mcdonalds_app",
    "phoneNumber": "+15551234567"
  },
  "message": "Successfully registered McDonald's with Gupshup app mcdonalds_app"
}
```

**What happens internally:**

1. Validates app exists in Gupshup via `GET /partner/app/{appId}/details`
2. **Auto-creates merchant** with brandName (clerkId added later when they authenticate)
3. Creates WABA record in your database linked to the new merchant
4. Subscribes to MESSAGE webhooks for the app
5. Stores phone number if available
6. Ready to send messages!

---

## API Endpoints

### 1. Register Manual Onboarding

**POST** `/waba/onboarding/register`

Register a manually onboarded WABA into your system. Creates merchant automatically.

**Request Body:**

```typescript
{
  brandName: string; // Display name (e.g., "McDonald's")
  gupshupAppName: string; // App name from Gupshup
  gupshupAppId: string; // App ID from Gupshup
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "wabaId": "uuid",
    "providerAccountId": "gupshup-app-id",
    "appName": "app_name",
    "phoneNumber": "+1234567890"
  }
}
```

**Error Response (500):**

```json
{
  "error": "App abc123 not found in Gupshup"
}
```

---

### 2. Get App Details

**GET** `/waba/onboarding/app-details/:appId`

Fetch details of a Gupshup app (useful for validation before registration).

**Parameters:**

- `appId`: Gupshup app ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "appId": "abc123-def456",
    "appName": "mcdonalds_app",
    "phone": "+15551234567",
    "status": "live",
    "wabaId": "1234567890",
    "namespace": "abc_def_ghi"
  }
}
```

---

### 3. Send Message

**POST** `/waba/onboarding/send-message`

Send a WhatsApp message using Gupshup's native Partner API.

**Request Body:**

```typescript
{
  appId: string;
  phoneNumber: string; // Recipient (e.g., "+15551234567")
  message: {
    type: "text" | "template" | "image" | "document";

    // For type: "text"
    text?: string;

    // For type: "template"
    templateId?: string;
    templateParams?: string[];

    // For type: "image" or "document"
    mediaUrl?: string;
    caption?: string;
  }
}
```

**Example: Send Text Message**

```json
{
  "appId": "abc123-def456",
  "phoneNumber": "+15551234567",
  "message": {
    "type": "text",
    "text": "Hello from our system!"
  }
}
```

**Example: Send Template Message**

```json
{
  "appId": "abc123-def456",
  "phoneNumber": "+15551234567",
  "message": {
    "type": "template",
    "templateId": "order_confirmation",
    "templateParams": ["John", "12345", "$50.00"]
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "messageId": "gupshup-message-id",
    "status": "submitted"
  }
}
```

---

## Environment Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Gupshup Partner API Configuration
GUPSHUP_PARTNER_ID=your-partner-id
GUPSHUP_PARTNER_TOKEN=your-jwt-partner-token
GUPSHUP_PARTNER_API_URL=https://partner.gupshup.io
GUPSHUP_WEBHOOK_VERIFY_TOKEN=your-random-secret-token
```

### Where to Get These Values

1. **GUPSHUP_PARTNER_ID**: Your Tech Provider/Partner ID from Gupshup Partner Portal
2. **GUPSHUP_PARTNER_TOKEN**:
   - Log in to [Gupshup Partner Portal](https://partner.gupshup.io)
   - Navigate to Settings → API Tokens
   - Generate or copy your Partner Token (JWT format)
3. **GUPSHUP_WEBHOOK_VERIFY_TOKEN**: Generate your own random string for webhook verification

---

## Coexist Mode

### What is Coexist Mode?

**Coexist Mode** (also called "Companion Mode") allows a business to use **both**:

- WhatsApp Business App (mobile app)
- WhatsApp Cloud API (your system)

**Without Coexist**: When you onboard a phone number to Cloud API, the business loses access to the WhatsApp Business App.

**With Coexist**: The business can still use the WhatsApp Business App on their phone **and** receive API messages.

### Current Status: Coexist Not Explicitly Documented

#### Research Findings

1. **Meta Documentation**: Mentions "WhatsApp Business app user onboarding" but broken links (404s)
2. **Gupshup Documentation**: No explicit "coexist" mode documentation found
3. **Embedded Signup**: Coexist option **appears during Meta's embedded signup UI**, not via API parameter

#### How Users Select Coexist

During Gupshup's embedded signup flow (which wraps Meta's flow), merchants see:

> "Do you want to keep using WhatsApp Business App?"
> ☐ Yes, enable companion mode

If they check this box, coexist mode is enabled.

### Detecting Coexist Mode

**Current Implementation**: `coexistEnabled` defaults to `false` in database.

**To Update After Onboarding**:

1. Contact Gupshup support to find the API field that indicates coexist status
2. Possible field names: `cxpEnabled`, `companionModeEnabled`, `coexistMode`
3. Query `GET /partner/app/{appId}/details` and inspect response
4. Update your database accordingly

**Alternative**: Add a manual toggle in your admin UI to set coexist status.

### Why Coexist May Not Matter for MVP

For an MVP where you're onboarding businesses **who want to use your system**, they likely:

- Don't need WhatsApp Business App anymore (using your platform instead)
- Are willing to migrate fully to API-based messaging
- Can always re-enable later if Gupshup exposes the setting

---

## Sending Messages

### Message Types Supported

#### 1. Text Messages

```typescript
await sendMessage({
  appId: "abc123-def456",
  phoneNumber: "+15551234567",
  message: {
    type: "text",
    text: "Your order #12345 is ready for pickup!",
  },
});
```

**Gupshup Endpoint Used**: `POST /partner/app/{appId}/msg`

---

#### 2. Template Messages

```typescript
await sendMessage({
  appId: "abc123-def456",
  phoneNumber: "+15551234567",
  message: {
    type: "template",
    templateId: "order_confirmation_v2",
    templateParams: ["John Doe", "12345", "$49.99"],
  },
});
```

**Gupshup Endpoint Used**: `POST /partner/app/{appId}/template/msg`

**Note**: Templates must be pre-approved in Gupshup Partner Portal.

---

#### 3. Image/Document Messages

```typescript
await sendMessage({
  appId: "abc123-def456",
  phoneNumber: "+15551234567",
  message: {
    type: "image",
    mediaUrl: "https://example.com/menu.jpg",
    caption: "Check out our new menu!",
  },
});
```

**Gupshup Endpoint Used**: `POST /partner/app/{appId}/msg`

---

## Webhooks

### Webhook Configuration

Gupshup sends webhooks for:

- Inbound messages from customers
- Message status updates (sent, delivered, read)
- Template approval/rejection
- Account tier updates

### Endpoint

**GET/POST** `/waba/webhook`

- **GET**: Webhook verification (if Gupshup supports it)
- **POST**: Receives webhook events

### Webhook Formats

Gupshup supports two webhook formats:

#### V2 Format (Gupshup Native)

```json
{
  "app": "mcdonalds_app",
  "appId": "abc123-def456",
  "timestamp": 1637012345678,
  "version": 2,
  "type": "message-event",
  "payload": {
    "type": "text",
    "payload": {
      "id": "msg-id",
      "type": "text",
      "text": "I'd like to order a burger"
    }
  }
}
```

#### V3 Format (Meta-Style)

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "waba-id",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messages": [
              {
                "from": "15551234567",
                "id": "msg-id",
                "type": "text",
                "text": {
                  "body": "I'd like to order a burger"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Automatic Detection

The route automatically detects webhook version:

```typescript
const version = body.version || (body.object ? 3 : 2);
```

### Subscribing to Webhooks

Webhooks are automatically subscribed when you register an app via `/register` endpoint.

Subscription happens in `registerManualOnboarding()`:

```typescript
await subscribeToWebhooks({
  appId: gupshupAppId,
  mode: "MESSAGE", // Subscribe to message events
});
```

---

## Testing

### Test App Registration

1. Create a test app in Gupshup Partner Portal
2. Get the appId from Gupshup
3. Call registration API:

```bash
curl -X POST http://localhost:3000/waba/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "test-merchant-123",
    "brandName": "Test Store",
    "gupshupAppName": "test_store_app",
    "gupshupAppId": "your-gupshup-app-id"
  }'
```

### Test Message Sending

```bash
curl -X POST http://localhost:3000/waba/onboarding/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "your-gupshup-app-id",
    "phoneNumber": "+15551234567",
    "message": {
      "type": "text",
      "text": "Hello from the API!"
    }
  }'
```

### Test Webhook Reception

Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

Then configure the ngrok URL in Gupshup Partner Portal webhook settings:

```
https://your-ngrok-url.ngrok.io/waba/webhook
```

---

## Troubleshooting

### Common Issues

#### 1. "App not found in Gupshup"

**Cause**: Invalid appId or app not yet created
**Solution**:

- Verify appId in Gupshup Partner Portal
- Ensure app status is "live"
- Check Partner Token has access to the app

#### 2. "Failed to subscribe to webhooks"

**Cause**: Invalid Partner Token or app permissions
**Solution**:

- Regenerate Partner Token in Gupshup Portal
- Ensure Partner ID matches your account
- Check app status is "live"

#### 3. "Authentication Failed" on message send

**Cause**: Expired or invalid Partner Token
**Solution**:

- Partner Tokens are JWTs with expiration
- Generate new token in Gupshup Partner Portal
- Update `GUPSHUP_PARTNER_TOKEN` in .env.local

---

## Next Steps

### Phase 1: MVP (Current)

- ✅ Manual onboarding via registration API
- ✅ Send text and template messages
- ✅ Receive webhooks for inbound messages
- ⏳ Store inbound messages in database
- ⏳ Build admin UI for registration

### Phase 2: Enhanced

- Template management (create, edit, approve)
- Message scheduling
- Analytics and reporting
- Rate limiting and retry logic

### Phase 3: Advanced

- Multi-app management per merchant
- Automated template creation from UI
- Customer conversation management
- Integration with CRM systems

---

## Additional Resources

- [Gupshup Partner Portal](https://partner.gupshup.io)
- [Gupshup Partner API Docs](https://partner-docs.gupshup.io/)
- [Meta WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)

---

## Support

For Gupshup-specific issues:

- Email: devsupport@gupshup.io
- Partner Portal: Support ticket system

For integration questions:

- Check this documentation
- Review code comments in service/route files
- Contact your Tech Lead
