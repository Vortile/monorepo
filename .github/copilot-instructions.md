# Project Instructions

## Monorepo Structure

- This is a monorepo using `pnpm` workspaces and `turborepo`.
- **Apps**: Located in `apps/`.
  - Next.js applications do **not** use a `src` directory. The `app` directory is at the root of the package (e.g., `apps/merchant/app`).
- **Packages**: Located in `packages/`.
  - **Database**: Located in `packages/database`.

## WhatsApp / Meta Integration - CRITICAL

⚠️ **ALWAYS use Gupshup Partner APIs. NEVER call Meta Graph API directly.**

- **ALL** WhatsApp operations (send messages, templates, WABA management) **MUST** use Gupshup Partner APIs
- **Base URL**: `https://partner.gupshup.io` (NOT `graph.facebook.com`)
- **Auth**: Use `GUPSHUP_PARTNER_TOKEN` (NOT `META_WABA_ACCESS_TOKEN`)
- **Legacy Warning**: Files calling `graph.facebook.com` are deprecated - do NOT copy that pattern

### Documentation Resources

- **Official Postman Collection**: https://documenter.getpostman.com/view/27893553/2sAXqy1dtP (MAIN REFERENCE)
- **Partner Portal**: https://partner.gupshup.io (Admin console)
- **Partner API Docs**: https://partner-docs.gupshup.io/docs/gupshup-partner-eco-system
- **Partner API Reference**: https://partner-docs.gupshup.io/reference
- **General WhatsApp Docs**: https://docs.gupshup.io/docs
- **General API Reference**: https://docs.gupshup.io/reference
- **Internal Memory**: `/memories/repo/gupshup-partner-api.md`
- **Implementation Guide**: `apps/server/docs/GUPSHUP_WABA_ONBOARDING.md`

## Database & Schemas

- All database schemas are located in `packages/database/src/schema`.
- **Naming Convention**: Schema files must be named `[table-name].schema.ts`.
- Use `drizzle-orm` for schema definitions.

## Coding Style

- **Arrow Functions**: ALWAYS use arrow functions. Do not use the `function` keyword.
- **Implicit Returns**: Use implicit returns for arrow functions whenever possible (e.g., `const add = (a, b) => a + b`).
- **Imports**: Use absolute imports with `@/` where configured, or package names for monorepo dependencies (e.g., `@vortile/database`).
- **Backend placement**: Put server/API logic in `apps/api` (Hono). Avoid adding new Next.js API routes inside app folders; have the admin UI call the `apps/api` endpoints instead.
