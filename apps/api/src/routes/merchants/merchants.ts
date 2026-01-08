// apps/api/src/routes/merchants/merchants.ts
import { Hono } from "hono";
import { db } from "@vortile/database";
import { merchant } from "@vortile/database/src/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono()
  .get("/:clerkId", async (c) => {
    const clerkId = c.req.param("clerkId");
    try {
      const existing = await db.query.merchant.findFirst({
        where: eq(merchant.clerkId, clerkId),
      });

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
      })
    ),
    async (c) => {
      const { clerkId, businessName, email } = c.req.valid("json");

      try {
        const [existing] = await db
          .select()
          .from(merchant)
          .where(eq(merchant.clerkId, clerkId))
          .limit(1);

        if (existing) {
          return c.json(existing);
        }

        const [newMerchant] = await db
          .insert(merchant)
          .values({
            clerkId,
            name: businessName,
            slug: businessName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
            // email, // Check if email is in the schema? onboarding.ts didn't use it.
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return c.json(newMerchant, 201);
      } catch (e) {
        console.error(e);
        return c.json({ error: "Failed to create merchant" }, 500);
      }
    }
  );

export default app;
