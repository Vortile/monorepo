// apps/api/src/routes/stores/stores.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { listStoresByMerchantId } from "../../db/queries";
import { createStore } from "../../db/mutations";

const app = new Hono()
  .get("/", async (c) => {
    const merchantId = c.req.query("merchantId");
    if (!merchantId) {
      return c.json({ error: "merchantId is required" }, 400);
    }

    const allStores = await listStoresByMerchantId(merchantId);
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
      }),
    ),
    async (c) => {
      const { merchantId, name, slug } = c.req.valid("json");

      try {
        const [newStore] = await createStore({
          merchantId,
          name,
          slug,
        });

        return c.json(newStore, 201);
      } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to create store" }, 500);
      }
    },
  );

export default app;
