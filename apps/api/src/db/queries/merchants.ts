import { db } from "@vortile/database";
import { merchant } from "@vortile/database/src/schema";
import { eq } from "drizzle-orm";

export const getMerchantByClerkId = (clerkId: string) =>
  db.query.merchant.findFirst({
    where: eq(merchant.clerkId, clerkId),
  });

export const getMerchantById = (merchantId: string) =>
  db.query.merchant.findFirst({
    where: eq(merchant.id, merchantId),
  });
