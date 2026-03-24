# Resend Webhook Setup Guide

## Overview

The Resend webhook endpoint allows your application to automatically receive and store emails in real-time as they arrive, instead of polling the API.

**Webhook Endpoint:** `POST /api/emails/webhook`

## Features

- ✅ Automatic email storage in database
- ✅ Attachment handling (base64 encoded)
- ✅ Webhook signature verification
- ✅ Email status tracking (sent, delivered, bounced, etc.)
- ✅ Email engagement tracking (opens, clicks)

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Required: Your Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional but recommended: Webhook signing secret
# Get this from your Resend dashboard after creating the webhook
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Run Database Migration

The webhook requires two new database tables:

```bash
# Generate migration
pnpm --filter database db:generate

# Run migration
pnpm --filter database db:migrate
```

**Tables created:**

- `email` - Stores email metadata and content
- `email_attachment` - Stores email attachments

### 3. Configure Webhook in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/webhooks)
2. Click "Add Webhook"
3. Enter your webhook URL:

   ```
   https://your-domain.com/api/emails/webhook
   ```

   For local development with tunneling (e.g., ngrok):

   ```
   https://your-ngrok-url.ngrok.io/api/emails/webhook
   ```

4. Select events to subscribe to:
   - **Inbound Emails:**
     - ✅ `email.received` (Required for storing incoming emails)
   - **Outbound Email Status:**
     - ✅ `email.sent`
     - ✅ `email.delivered`
     - ✅ `email.bounced`
     - ✅ `email.complained`
     - ✅ `email.delivery_delayed`
   - **Email Engagement (Optional):**
     - `email.opened`
     - `email.clicked`

5. Copy the **Signing Secret** and add it to your `.env.local` as `RESEND_WEBHOOK_SECRET`

### 4. Configure Inbound Email Routing

To receive emails:

1. Go to [Resend Domains](https://resend.com/domains)
2. Select your domain
3. Click "Inbound Rules"
4. Add a new rule:
   - **Match:** `*@yourdomain.com` (catch-all) or specific addresses
   - **Forward to:** Your webhook endpoint (configured in step 3)

### 5. Test the Webhook

#### Local Development Testing

For local development, use a tunneling service:

```bash
# Install ngrok (if not already installed)
brew install ngrok

# Start your server
pnpm --filter server dev

# In another terminal, create tunnel
ngrok http 3000

# Use the ngrok URL in Resend webhook config
# Example: https://abc123.ngrok.io/api/emails/webhook
```

#### Send Test Email

Send a test email to your configured address:

```bash
# From another email account
echo "Test email body" | mail -s "Test Subject" test@yourdomain.com
```

Check your server logs:

```
Received Resend webhook: email.received { emailId: 're_...', from: '...', to: [...] }
Stored inbound email: <uuid> (Resend ID: re_...)
```

## Webhook Payload Examples

### Inbound Email (`email.received`)

```json
{
  "type": "email.received",
  "data": {
    "id": "re_abc123def456",
    "from": "sender@example.com",
    "to": ["support@yourdomain.com"],
    "subject": "Help with my order",
    "text": "Plain text content",
    "html": "<p>HTML content</p>",
    "created_at": "2024-03-23T10:30:00Z",
    "attachments": [
      {
        "id": "att_xyz789",
        "filename": "invoice.pdf",
        "content_type": "application/pdf",
        "size": 12345,
        "content": "base64EncodedContent..."
      }
    ]
  }
}
```

### Email Status Update (`email.delivered`)

```json
{
  "type": "email.delivered",
  "data": {
    "id": "re_abc123def456",
    "from": "noreply@yourdomain.com",
    "to": ["customer@example.com"],
    "subject": "Order confirmation"
  }
}
```

## Database Schema

### `email` Table

| Column              | Type               | Description                      |
| ------------------- | ------------------ | -------------------------------- |
| `id`                | text (primary key) | UUID v7                          |
| `resend_id`         | text (unique)      | Resend email ID                  |
| `merchant_id`       | text               | Reference to merchant (optional) |
| `direction`         | text               | 'received' or 'sent'             |
| `from`              | text               | Sender email address             |
| `to`                | jsonb              | Array of recipient emails        |
| `cc`                | jsonb              | Array of CC emails               |
| `bcc`               | jsonb              | Array of BCC emails              |
| `reply_to`          | jsonb              | Array of reply-to emails         |
| `subject`           | text               | Email subject                    |
| `text`              | text               | Plain text content               |
| `html`              | text               | HTML content                     |
| `headers`           | jsonb              | Email headers                    |
| `last_event`        | text               | Latest status                    |
| `resend_created_at` | timestamp          | When email was created in Resend |

### `email_attachment` Table

| Column                 | Type               | Description            |
| ---------------------- | ------------------ | ---------------------- |
| `id`                   | text (primary key) | UUID v7                |
| `email_id`             | text (foreign key) | Reference to email     |
| `resend_attachment_id` | text               | Resend attachment ID   |
| `filename`             | text               | File name              |
| `content_type`         | text               | MIME type              |
| `size`                 | integer            | File size in bytes     |
| `content`              | text               | Base64 encoded content |

## Security

### Webhook Signature Verification

All webhooks are verified using HMAC SHA256 signatures:

```typescript
// Automatic verification in webhook handler
const signature = request.headers["resend-signature"];
const isValid = verifyWebhookSignature(
  rawBody,
  signature,
  RESEND_WEBHOOK_SECRET,
);
```

⚠️ **Important:** Always set `RESEND_WEBHOOK_SECRET` in production to prevent unauthorized webhook calls.

## Troubleshooting

### Webhook not receiving events

1. Check your webhook URL is publicly accessible
2. Verify SSL certificate is valid (Resend requires HTTPS in production)
3. Check Resend webhook logs in dashboard
4. Verify your inbound rules are configured correctly

### Signature verification failing

1. Ensure `RESEND_WEBHOOK_SECRET` matches the one in Resend dashboard
2. Make sure you're using the raw request body for verification
3. Check that the request is actually from Resend

### Emails not being stored

1. Check server logs for errors
2. Verify database connection
3. Ensure migrations have run successfully
4. Check that the `email` and `email_attachment` tables exist

### Local development webhook not working

1. Use ngrok or similar tunneling service
2. Update webhook URL in Resend dashboard with tunnel URL
3. Keep tunnel session active while testing

## API Endpoints

### Get Stored Emails

```bash
GET /api/emails?direction=received&limit=10
```

### Get Email Details

```bash
GET /api/emails/:emailId
```

### Download Attachment

```bash
GET /api/emails/:emailId/attachments/:attachmentId
```

## Next Steps

- [ ] Set up monitoring for webhook failures
- [ ] Implement retry logic for failed database writes
- [ ] Add email parsing for structured data extraction
- [ ] Configure email forwarding rules
- [ ] Set up alerting for bounced/complained emails
- [ ] Implement merchant association logic
- [ ] Add full-text search for emails

## Resources

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks)
- [Resend Inbound Email Guide](https://resend.com/docs/inbound-email)
- [Resend Dashboard](https://resend.com/webhooks)
