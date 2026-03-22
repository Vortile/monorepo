# Removed Schemas (Historical Record)

This document preserves schemas that were removed during MVP simplification on March 21, 2026.

**Context:** The initial database design included full e-commerce capabilities (stores, customers, product catalogs, orders, subscriptions) and Better Auth tables. For the WABA MVP (onboard WABAs, send/receive messages), these features added unnecessary complexity and were removed. Authentication is handled by Clerk instead.

---

## Authentication Tables (Better Auth)

**Removed:** March 21, 2026 (later same day)

**Reason:** Switched to Clerk for authentication instead of Better Auth.

**Tables removed:**

- `user` - Dashboard users (admins and merchant staff)
- `account` - Social login providers (OAuth)
- `session` - User sessions
- `verification` - Email/phone verification tokens

**Decision:** Using Clerk for all authentication needs. Clerk manages users, sessions, and OAuth providers externally.

**Files deleted:**

- `packages/database/src/schema/auth.schema.ts`
- `apps/server/src/auth.ts` (Better Auth configuration)

---

## Stores

**Purpose:** Multi-location support for merchants (e.g., multiple physical locations).

**Decision:** Removed - merchants can link WABA directly without intermediate store entities.

**Schema:**

```typescript
export const store = pgTable("store", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  wabaId: text("waba_id").references(() => waba.id),
  wabaPhoneNumberId: text("waba_phone_number_id").references(
    () => wabaPhoneNumber.id,
  ),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
```

---

## Customers & Addresses

**Purpose:** CRM functionality - track end customers who purchase from merchants.

**Decision:** Removed - not needed for WABA messaging MVP.

**Schemas:**

```typescript
export const customer = pgTable("customer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  name: text("name"),
  phone: text("phone").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const address = pgTable("address", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  label: text("label"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
```

---

## Product Catalog

**Purpose:** E-commerce product catalog with categories and items.

**Decision:** Removed - not needed for WABA messaging MVP.

**Schemas:**

```typescript
export const category = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  storeId: text("store_id")
    .notNull()
    .references(() => store.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const product = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  storeId: text("store_id")
    .notNull()
    .references(() => store.id),
  categoryId: text("category_id").references(() => category.id),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
```

---

## Orders

**Purpose:** E-commerce order management.

**Decision:** Removed - not needed for WABA messaging MVP.

**Schemas:**

```typescript
export const order = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  storeId: text("store_id")
    .notNull()
    .references(() => store.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  status: text("status").notNull().default("pending"),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const orderItem = pgTable("order_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  orderId: text("order_id")
    .notNull()
    .references(() => order.id),
  productId: text("product_id")
    .notNull()
    .references(() => product.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});
```

---

## Subscriptions & Plans

**Purpose:** SaaS monetization - subscription tiers with usage limits and billing.

**Decision:** Removed - focus on MVP first, add monetization later.

**Schemas:**

```typescript
export const plans = pgTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name").notNull(), // "Free", "Starter", "Pro"
  slug: text("slug").notNull().unique(),
  monthlyPriceCents: integer("monthly_price_cents").notNull(),
  includedOrders: integer("included_orders").notNull(),
  overagePriceCents: integer("overage_price_cents").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  externalProductId: text("external_product_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchant.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  status: text("status").notNull(), // "active", "past_due", "canceled", "trialing"
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  externalSubscriptionId: text("external_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

---

## Removed API Endpoints

**Server routes removed:**

- `GET /api/stores?merchantId={id}` - List stores for a merchant

**Queries removed:**

- `listStoresByMerchantId()`

**Mutations removed:**

- `createStore()`

---

## Future Considerations

These schemas can be re-added in future iterations when:

1. **Stores** - Multi-location support becomes a requirement
2. **Customers** - CRM features are needed
3. **Catalog** - Product management is needed
4. **Orders** - Transaction tracking is needed
5. **Subscriptions** - Monetization strategy is finalized

For now, the MVP focuses on core WABA functionality:

- ✅ Merchant management
- ✅ WABA onboarding
- ✅ Message sending/receiving
- ✅ Webhook handling
