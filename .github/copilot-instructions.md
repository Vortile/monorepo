# Project Instructions

## Monorepo Structure

- This is a monorepo using `pnpm` workspaces and `turborepo`.
- **Apps**: Located in `apps/`.
  - Next.js applications do **not** use a `src` directory. The `app` directory is at the root of the package (e.g., `apps/merchant/app`).
- **Packages**: Located in `packages/`.
  - **Database**: Located in `packages/database`.

## Database & Schemas

- All database schemas are located in `packages/database/src/schema`.
- **Naming Convention**: Schema files must be named `[table-name].schema.ts`.
- Use `drizzle-orm` for schema definitions.

## Coding Style

- **Arrow Functions**: ALWAYS use arrow functions. Do not use the `function` keyword.
- **Implicit Returns**: Use implicit returns for arrow functions whenever possible (e.g., `const add = (a, b) => a + b`).
- **Imports**: Use absolute imports with `@/` where configured, or package names for monorepo dependencies (e.g., `@vortile/database`).
