# Gupshup V3 API Implementation Summary

## Date: March 23, 2026

## What Was Implemented

### ✅ Server-Side (Hono API)

#### 1. Core Service Functions (`apps/server/src/services/waba/waba-onboarding.service.ts`)

- **`sendMessageV3()`**: Main function to send messages using Meta Cloud API format via Gupshup Partner API
- **`sendTextMessage()`**: Convenience wrapper for sending text messages
- **`sendTemplateMessage()`**: Convenience wrapper for sending template messages
- **Type Definitions**: Exported TypeScript types for all message types (text, image, document, template)

**Key Features:**
- Uses Meta Cloud API-compatible message format
- Endpoint: `POST /partner/app/{appId}/v3/message`
- Authentication: `Authorization` header with `GUPSHUP_PARTNER_TOKEN`
- Returns message ID, status, and contact information

#### 2. Route Handlers

**`apps/server/src/routes/waba/waba.ts`**:
- Updated `POST /api/waba/send-message` to use `sendTextMessage()`
- Expects: `wabaId`, `phoneNumber`, `messageBody`
- Returns: `messageId`, `status`, `contacts`

**`apps/server/src/routes/waba/waba-onboarding.route.ts`**:
- Updated `POST /api/waba/onboarding/send-message` to support full V3 API
- Accepts multiple message types (text, template, image, document)
- Uses Meta Cloud API format directly

### ✅ Dashboard UI (`apps/admin`)

#### Updated Send Page (`apps/admin/src/app/(dashboard)/send/page.tsx`)

**Changes:**
- Added WABA ID input field with description
- Updated phone number field with E.164 format guidance
- Modified success message to show message ID returned from API
- Updated UI text to reference "Gupshup V3 API" instead of generic "WhatsApp Cloud API"
- Template section now notes that creation should be done via Partner Portal

**New Fields:**
- WABA ID (with placeholder `waba_test_001`)
- Phone number with E.164 format hint
- Enhanced success/error feedback

### ✅ Documentation

#### 1. New Documentation Files

**`apps/server/docs/GUPSHUP_V3_API.md`** (NEW):
- Comprehensive V3 API guide
- Message type examples (text, template, image, document)
- Implementation details with code snippets
- Phone number format guidelines
- Error handling documentation
- Testing instructions
- Migration guide from V2 to V3

**Updated Files:**
- **`apps/server/docs/GUPSHUP_WABA_ONBOARDING.md`**: Added notice about V3 implementation
- **`apps/server/README.md`**: Updated endpoints list and added V3 reference
- **`/memories/repo/gupshup-quick-reference.md`**: Added V3 code patterns, deprecated V2 section

### ✅ API Contract

#### Request Format (App-Level Route)
```json
POST /api/waba/send-message
{
  "wabaId": "waba_test_001",
  "phoneNumber": "5511999887766",
  "messageBody": "Hello from Vortile!"
}
```

#### Response Format
```json
{
  "success": true,
  "messageId": "wamid.HBgLNTUxMTk5OTg4Nzc2...",
  "status": "sent",
  "contacts": [
    {
      "input": "5511999887766",
      "wa_id": "5511999887766"
    }
  ]
}
```

#### Low-Level API Format (Onboarding Route)
```json
POST /api/waba/onboarding/send-message
{
  "appId": "gupshup-app-id",
  "to": "5511999887766",
  "text": {
    "body": "Hello from Vortile!"
  }
}
```

## Architecture

### Message Flow

```
Dashboard
  ↓ [wabaId, phoneNumber, messageBody]
Route Handler (/api/waba/send-message)
  ↓ [Lookup Gupshup App ID from WABA credentials]
Service (sendTextMessage)
  ↓ [Build Meta Cloud API format]
Gupshup V3 API
  ↓ [POST /partner/app/{appId}/v3/message]
WhatsApp
```

### Data Structure

```typescript
// Send Message Input (V3)
{
  appId: string;           // Gupshup App ID
  to: string;              // E.164 format (no + sign)
  text: {
    body: string;
    preview_url?: boolean;
  }
}

// Send Message Result
{
  messageId: string;       // Meta message ID
  status?: string;         // Delivery status
  contacts?: Array<{       // Contact info
    input: string;
    wa_id: string;
  }>;
}
```

## Environment Variables Required

```bash
# Gupshup Partner API Configuration
GUPSHUP_PARTNER_ID=your_partner_id
GUPSHUP_PARTNER_TOKEN=your_jwt_partner_token
GUPSHUP_PARTNER_API_URL=https://partner.gupshup.io
GUPSHUP_WEBHOOK_VERIFY_TOKEN=your_webhook_secret
```

## Phone Number Format

**Critical**: Phone numbers MUST be in E.164 format **without the + sign**

✅ Correct:
- `5511999887766` (Brazil)
- `14155552671` (USA)
- `919876543210` (India)

❌ Wrong:
- `+55 11 99988-7766`
- `+1 (415) 555-2671`
- `+91 98765 43210`

## Testing

### 1. Using Dashboard
1. Navigate to `/send` in admin panel
2. Enter WABA ID: `waba_test_001` (or your actual WABA ID)
3. Enter phone number: `5511999887766` (your test number in E.164 format)
4. Type message
5. Click "Send Message"
6. Check response for message ID

### 2. Using cURL
```bash
curl -X POST http://localhost:3000/api/waba/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "wabaId": "waba_test_001",
    "phoneNumber": "5511999887766",
    "messageBody": "Hello from Gupshup V3!"
  }'
```

### 3. Using Advanced API
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

## Migration from V2 API

### Old Code (V2 - Deprecated)
```typescript
await sendMessage({
  appId: "app-id",
  phoneNumber: "+1234567890",
  message: {
    type: "text",
    text: "Hello"
  }
});
```

### New Code (V3 - Current)
```typescript
await sendTextMessage({
  appId: "app-id",
  to: "1234567890",  // No + sign
  body: "Hello"
});
```

## What's NOT Implemented (Future Work)

### 1. Message Persistence
- No database table for tracking sent messages
- No message history
- No status tracking (sent, delivered, read, failed)

**Recommendation**: Create `messages` table to store all sent/received messages

### 2. Webhook Processing
- Webhook endpoints exist but handlers are stubs
- No delivery receipt processing
- No inbound message handling
- No interactive message responses

**Recommendation**: Implement webhook handlers in `waba-onboarding.route.ts`

### 3. Template Management
- Template creation endpoint is a placeholder
- No template listing API
- No template approval status tracking
- No template parameter validation

**Recommendation**: Templates should be managed via Gupshup Partner Portal UI for now

### 4. Media Upload
- No media upload endpoints
- Images/documents must be hosted externally
- No temporary file storage

**Recommendation**: Implement media upload service with cloud storage (S3, R2, etc.)

### 5. Phone Number Management
- No source phone number specification in API
- Assumes single phone number per WABA
- No phone number discovery/listing

**Recommendation**: Add phone number selection to send message API

### 6. Advanced Features
- No batch sending
- No message scheduling
- No rate limiting
- No retry logic
- No message analytics

## Known Limitations

1. **WABA Selection**: Dashboard uses hardcoded `waba_test_001`. Production needs proper WABA picker.
2. **Error Feedback**: Basic error messages. Could be more descriptive.
3. **Phone Validation**: No client-side phone number format validation.
4. **Message Types**: Only text messages implemented in main route. Template/media need UI.

## Success Criteria

✅ V3 API integration complete
✅ Server can send text messages via Gupshup
✅ Dashboard can trigger message sending
✅ Comprehensive documentation created
✅ Code follows Meta Cloud API format
✅ TypeScript types properly defined
✅ Error handling in place

## References

- **Official Postman Collection**: https://documenter.getpostman.com/view/27893553/2sAXqy1dtP
- **Gupshup Partner Docs**: https://partner-docs.gupshup.io/docs
- **Meta Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **V3 API Guide**: `apps/server/docs/GUPSHUP_V3_API.md`
- **Quick Reference**: `/memories/repo/gupshup-quick-reference.md`

## Next Sprint Recommendations

1. **High Priority**: Implement message persistence (database tracking)
2. **High Priority**: Implement webhook handlers for delivery tracking
3. **Medium Priority**: Add WABA selector to dashboard
4. **Medium Priority**: Implement template message UI
5. **Low Priority**: Add media upload support
6. **Low Priority**: Implement batch sending
