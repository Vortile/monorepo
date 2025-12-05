# Vortile Delivery Monorepo

## Architecture

- **apps/storefront**: Next.js application for customers (Client).
- **apps/api**: Express application for backend services and Authentication (Server).
- **packages/database**: Shared Drizzle ORM + Neon DB package.

## Authentication

Authentication is handled centrally by `apps/api` using **Better Auth**.

- The API exposes auth endpoints at `/api/auth/*`.
- The Storefront uses the Better Auth client to communicate with the API.

## Database

The project uses **Neon** (Serverless Postgres) and **Drizzle ORM**.
Schema definitions are in `packages/database/src/schema.ts`.

### ID System

We use **UUID v7** for all primary keys. This ensures:

- **Time-sortability**: Records are naturally ordered by creation time.
- **Performance**: Better indexing than random UUIDs.
- **Uniqueness**: Globally unique identifiers.

Use the `generateId()` utility from `@vortile/database` when you need to generate an ID manually.

- **`apps/api`**: Express.js + TypeScript backend server.
  - **Port**: 3000
  - **Purpose**: Handles all business logic, database interactions, and API requests.
- **`apps/admin`**: (Future) Super Admin Panel.
  - **Port**: 3001
  - **Purpose**: Internal tool for Vortile owners to manage the platform.
- **`apps/merchant`**: (Future) Client Admin Panel.
  - **Port**: 3002
  - **Purpose**: Dashboard for restaurant owners to manage their store, menu, and orders.
- **`apps/storefront`**: Next.js 16 + HeroUI.
  - **Port**: 3003
  - **Purpose**: Dynamic online store for end-customers to place orders.

## Tech Stack & Rules

- **Package Manager**: `pnpm` ONLY.
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4 (no config file), HeroUI.
- **Backend**: Express.js, TypeScript.
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
