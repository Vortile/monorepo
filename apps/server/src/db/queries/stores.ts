import { db } from "@vortile/database";
import { store } from "@vortile/database/src/schema";
import { eq } from "drizzle-orm";

export const listStoresByMerchantId = (merchantId: string) =>
  db.query.store.findMany({
    where: eq(store.merchantId, merchantId),
  });
