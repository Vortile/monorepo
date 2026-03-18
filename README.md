# Vortile Delivery Monorepo

## Apps & Port Allocation

- **`apps/server`** (API): Hono + TypeScript backend server.
  - **Port**: `3000`
  - **Dev**: `pnpm dev:api`
  - **Purpose**: Handles all business logic, database interactions, and API requests.
  
- **`apps/admin`**: Admin Dashboard (Next.js 16).
  - **Port**: `3001`
  - **Dev**: `pnpm dev:admin`
  - **Purpose**: Internal tool for Vortile owners to manage the platform.
  
- **`apps/merchant-expo`**: React Native (Expo) app for merchants.
  - **Purpose**: Mobile app for restaurant owners to manage their store, menu, and orders.
  
- **`apps/storefront`**: Next.js 16 customer-facing store.
  - **Port**: `3003`
  - **Dev**: `pnpm dev:storefront`
  - **Purpose**: Dynamic online store for end-customers to place orders.

## Architecture

- **apps/storefront**: Next.js application for customers (Client).
- **apps/server**: Hono application for backend services and Authentication (Server).
- **packages/database**: Shared Drizzle ORM + Neon DB package.

## Authentication

Authentication is handled centrally by `apps/server` using **Better Auth**.

- The server exposes auth endpoints at `/api/auth/*`.
- The Storefront uses the Better Auth client to communicate with the server.

## Database

The project uses **Neon** (Serverless Postgres) and **Drizzle ORM**.
Schema definitions are in `packages/database/src/schema.ts`.

### ID System

We use **UUID v7** for all primary keys. This ensures:

- **Time-sortability**: Records are naturally ordered by creation time.
- **Performance**: Better indexing than random UUIDs.
- **Uniqueness**: Globally unique identifiers.

Use the `generateId()` utility from `@vortile/database` when you need to generate an ID manually.

## Tech Stack & Rules

- **Package Manager**: `pnpm` ONLY.
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4 (no config file).
- **Admin**: Next.js 16 (App Router), shadcn/ui, Clerk Auth.
- **Backend**: Hono.js, TypeScript.
- **Linting**: Global ESLint configuration (root `eslint.config.mjs`).
- **Formatting**: Prettier with Tailwind plugin.
- **Boilerplate**: Minimal. No unnecessary files.

## Development

Run all applications:

```bash
pnpm dev
```

Run specific applications:

```bash
pnpm dev:api
pnpm dev:storefront
```
