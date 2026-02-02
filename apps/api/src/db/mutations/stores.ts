import { db } from "@vortile/database";
import { store } from "@vortile/database/src/schema";
import { slugify } from "../utils/slug";

type CreateStoreInput = {
  merchantId: string;
  name: string;
  slug?: string;
};

export const createStore = ({ merchantId, name, slug }: CreateStoreInput) =>
  db
    .insert(store)
    .values({
      merchantId,
      name,
      slug: slug ?? slugify(name),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
