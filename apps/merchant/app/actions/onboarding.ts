"use server";

import { db, merchant, store } from "@vortile/database";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const completeOnboarding = async (data: {
  businessName: string;
  businessLogo: string | null;
  storeName: string;
  storeSlug: string;
  storePhone: string;
}) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Create merchant
  const [newMerchant] = await db
    .insert(merchant)
    .values({
      name: data.businessName,
      slug: data.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      clerkId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create store
  await db.insert(store).values({
    merchantId: newMerchant.id,
    name: data.storeName,
    slug: data.storeSlug,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  redirect("/dashboard");
};
