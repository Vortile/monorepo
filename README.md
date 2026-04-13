# Vortile Monorepo

A pnpm + Turborepo monorepo for managing merchant communications through WhatsApp Business API (WABA) and email.

## Applications

### apps/server

**Hono.js API Server** - Port `3000`

The backend API server that handles all business logic, database interactions, and third-party integrations.

**Key Features:**

- RESTful API endpoints for all client apps
- WABA (WhatsApp Business API) integration and management
- Email handling via Resend
- Merchant and account management
- Better Auth authentication (future)

**Main Routes:**

- `/api/health` - Health check
- `/api/merchants` - Merchant CRUD operations
- `/api/waba` - WABA messaging and management
- `/api/waba/onboarding` - WABA account onboarding flow
- `/api/emails` - Email operations

**Run:**

```bash
pnpm dev:server
```

### apps/admin

**Next.js 16 Admin Dashboard** - Port `3001`

Internal dashboard for Vortile platform administrators to manage merchants, WABA accounts, email campaigns, and view analytics.

**Key Features:**

- Merchant account management
- WABA registration and configuration
- Email composition and sending
- Message history and analytics
- Dashboard with statistics

**Tech Stack:**

- Next.js 16 (App Router, no `src` directory)
- shadcn/ui components
- Tailwind CSS v4
- React Hook Form + Zod validation

**Run:**

```bash
pnpm dev:admin
```

## Packages

### packages/database

**Shared Drizzle ORM Package**

Centralized database schema definitions and utilities using Drizzle ORM with Supabase (Postgres).

**Connection Setup (Supabase):**

Two env vars are required — get both from Supabase Dashboard → Project Settings → Database:

- `DATABASE_URL` — Transaction pooler (port `6543`). Used by the app at runtime. Required in production/Vercel.
- `DIRECT_URL` — Direct connection (port `5432`). Used **only** by `drizzle-kit` for push/migrate. Never use the pooler for schema migrations.

**Schema Organization:**

All schemas are located in `packages/database/src/schema/` and organized by domain:

**`merchants/`**

- `merchant.schema.ts` - Business entities and profiles

**`messaging/`**

- `waba.schema.ts` - WhatsApp Business Accounts
- `waba-phone-number.schema.ts` - Phone numbers associated with WABA accounts
- `waba-template.schema.ts` - Message templates for WABA
- `waba-webhook.schema.ts` - Webhook configurations for WABA events
- `waba-credential.schema.ts` - API credentials and tokens for WABA providers

**Naming Convention:**
Schema files must be named `[table-name].schema.ts`

**ID System:**
All tables use **UUID v7** for primary keys, providing:

- Time-based sortability
- Better index performance than random UUIDs
- Global uniqueness

Use `generateId()` from `@vortile/database/ids` to manually generate IDs.

**Database Commands:**

```bash
pnpm db:generate  # Generate migrations
pnpm db:push      # Push schema to database
```

## Tech Stack

- **Package Manager**: pnpm (workspaces) + Turborepo
- **Backend**: Hono.js, TypeScript
- **Frontend**: Next.js 16 (App Router), shadcn/ui
- **Database**: Supabase (Postgres) + Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint (root `eslint.config.mjs`)
- **Formatting**: Prettier with Tailwind plugin

## Development

Run all applications:

```bash
pnpm dev
```

Run specific applications:

```bash
pnpm dev:server
pnpm dev:admin
```

Build all:

```bash
pnpm build
```

Build specific apps:

```bash
pnpm build:server
pnpm build:admin
```
