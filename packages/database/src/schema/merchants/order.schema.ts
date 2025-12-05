import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { generateId } from "../../ids";
import { merchant } from "./merchant.schema";
import { store } from "./store.schema";
import { product } from "./catalog.schema";
import { customer } from "./customer.schema";

/** Customer orders containing multiple items. */
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

/** Individual items within an order. */
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
