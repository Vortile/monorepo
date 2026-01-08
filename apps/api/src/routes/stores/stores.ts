// apps/api/src/routes/stores/stores.ts
import { Hono } from "hono";
import { db } from "@vortile/database";
import { store } from "@vortile/database/src/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono()
  .get("/", async (c) => {
    const merchantId = c.req.query("merchantId");
    if (!merchantId) {
      return c.json({ error: "merchantId is required" }, 400);
    }

    const allStores = await db.query.store.findMany({
      where: eq(store.merchantId, merchantId),
    });
    return c.json(allStores);
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        merchantId: z.string(),
        name: z.string(),
        slug: z.string().optional(),
      })
    ),
    async (c) => {
      const { merchantId, name, slug } = c.req.valid("json");
      const storeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      try {
        const [newStore] = await db
          .insert(store)
          .values({
            merchantId,
            name,
            slug: storeSlug,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return c.json(newStore, 201);
      } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to create store" }, 500);
      }
    }
  );

export default app;
