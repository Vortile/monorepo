import { db } from "@vortile/database";
import { merchant } from "@vortile/database/src/schema";
import { slugify } from "../utils/slug";

type CreateMerchantInput = {
  clerkId?: string; // Optional - for manual onboarding without auth
  businessName: string;
  email?: string;
};

export const createMerchant = ({
  clerkId,
  businessName,
}: CreateMerchantInput) =>
  db
    .insert(merchant)
    .values({
      clerkId: clerkId || null, // Allow null for manual onboarding
      name: businessName,
      slug: slugify(businessName),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
