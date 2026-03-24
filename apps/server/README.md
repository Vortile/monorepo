# Vortile API

Vortile’s API is a standalone Hono server. All clients (Admin, Storefront, Mobile) must fetch data through this API. Direct database access from clients is not allowed.

## Principles

- Client ⇄ API ⇄ DB only. No client-side DB access.
- Keep business logic in the API.
- Use Drizzle through a query/mutation layer.

## Structure

- src/index.ts — Hono server setup and routing.
- src/routes/\* — HTTP handlers only.
- src/db/queries/\* — read-only DB access.
- src/db/mutations/\* — writes/commands.
- src/db/utils/\* — shared helpers for DB operations.

## Environment

Set these in apps/api/.env.local:

- PORT
- ADMIN_ORIGIN
- RESEND_API_KEY
- EMAIL_FROM

## Endpoints (current)

### Core
- GET /api/health
- GET /api/merchants/:clerkId
- POST /api/merchants
- GET /api/stores?merchantId=...
- POST /api/stores

### WhatsApp (Gupshup V3 API)
- POST /api/waba/send-message — Send text messages via Gupshup Partner API V3
- POST /api/waba/create-template — Template creation (placeholder)
- POST /api/waba/onboarding/register — Register manually onboarded WABA
- GET /api/waba/onboarding/app-details/:appId — Get Gupshup app details
- POST /api/waba/onboarding/send-message — V3 API with full message type support
- POST /api/waba/onboarding/webhook — Webhook receiver

**See**: [docs/GUPSHUP_V3_API.md](./docs/GUPSHUP_V3_API.md) for V3 API documentation

### Email
- Email endpoints under /api/emails

## Data Model (high-level)

- Merchant: restaurant business profile.
- Store: physical/digital locations per merchant.
- WABA: WhatsApp Business Accounts per merchant.
- WABA Phone Numbers: sender numbers for a WABA.
- WABA Templates: provider templates.
- WABA Webhooks: event delivery endpoints.
- WABA Credentials: access tokens or secret references.

## Notes

- GupShup maps each “App” to a WABA. We store that in the WABA record (providerAppId) without using “app” as a first-class table name.
- If you need new DB access, add it to src/db/queries or src/db/mutations and call from routes.
