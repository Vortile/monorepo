// apps/api/src/routes/merchants/merchants.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createMerchant } from "../../db/mutations";
import { getMerchantByClerkId } from "../../db/queries";

const app = new Hono()
  .get("/:clerkId", async (c) => {
    const clerkId = c.req.param("clerkId");
    try {
      const existing = await getMerchantByClerkId(clerkId);

      if (!existing) {
        return c.json({ error: "Merchant not found" }, 404);
      }

      return c.json(existing);
    } catch (e) {
      console.error(e);
      return c.json({ error: "Failed to fetch merchant" }, 500);
    }
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        clerkId: z.string(),
        businessName: z.string(),
        email: z.string().optional(),
      }),
    ),
    async (c) => {
      const { clerkId, businessName, email } = c.req.valid("json");

      try {
        const existing = await getMerchantByClerkId(clerkId);

        if (existing) {
          return c.json(existing);
        }

        const [newMerchant] = await createMerchant({
          clerkId,
          businessName,
          email,
        });

        return c.json(newMerchant, 201);
      } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to create merchant" }, 500);
      }
    },
  );

export default app;
