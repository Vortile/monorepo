import { db, eq, and } from "@vortile/database";
import { waba, wabaCredential, wabaPhoneNumber } from "@vortile/database";

/**
 * Get all WABAs for a merchant.
 */
export const getWabasByMerchantId = async (merchantId: string) =>
  await db.select().from(waba).where(eq(waba.merchantId, merchantId));

/**
 * Get a specific WABA by ID.
 */
export const getWabaById = async (wabaId: string) => {
  const result = await db.select().from(waba).where(eq(waba.id, wabaId));
  return result[0] ?? null;
};

/**
 * Get WABA by provider account ID.
 */
export const getWabaByProviderAccountId = async (
  providerAccountId: string,
  provider: string,
) => {
  const result = await db
    .select()
    .from(waba)
    .where(
      and(
        eq(waba.providerAccountId, providerAccountId),
        eq(waba.provider, provider),
      ),
    );
  return result[0] ?? null;
};

/**
 * Get credentials for a WABA.
 */
export const getWabaCredentials = async (wabaId: string) =>
  await db
    .select()
    .from(wabaCredential)
    .where(eq(wabaCredential.wabaId, wabaId));

/**
 * Get a specific credential by type.
 */
export const getWabaCredentialByType = async (wabaId: string, type: string) => {
  const result = await db
    .select()
    .from(wabaCredential)
    .where(
      and(eq(wabaCredential.wabaId, wabaId), eq(wabaCredential.type, type)),
    );
  return result[0] ?? null;
};

/**
 * Get all phone numbers for a WABA.
 */
export const getWabaPhoneNumbers = async (wabaId: string) =>
  await db
    .select()
    .from(wabaPhoneNumber)
    .where(eq(wabaPhoneNumber.wabaId, wabaId));

/**
 * Get primary phone number for a WABA.
 */
export const getWabaPrimaryPhoneNumber = async (wabaId: string) => {
  const result = await db
    .select()
    .from(wabaPhoneNumber)
    .where(
      and(
        eq(wabaPhoneNumber.wabaId, wabaId),
        eq(wabaPhoneNumber.isPrimary, true),
      ),
    );
  return result[0] ?? null;
};
