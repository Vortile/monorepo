import { db, eq } from "@vortile/database";
import { waba, wabaCredential, wabaPhoneNumber } from "@vortile/database";
import { generateId } from "../../lib/id-generator";

export type CreateWabaInput = {
  merchantId: string;
  provider: string;
  providerAccountId: string;
  providerAppId?: string;
  businessPortfolioId?: string;
  coexistEnabled: boolean;
  onboardingMethod?: string;
  name?: string;
  isPrimary?: boolean;
};

export type CreateWabaCredentialInput = {
  wabaId: string;
  provider: string;
  type: string;
  value: string;
  metadata?: string;
  expiresAt?: Date;
};

export type CreateWabaPhoneNumberInput = {
  wabaId: string;
  merchantId: string;
  providerPhoneNumberId: string;
  phoneNumber: string;
  displayName?: string;
  isPrimary?: boolean;
};

/**
 * Create a new WABA record in the database.
 */
export const createWaba = async (input: CreateWabaInput) => {
  const now = new Date();
  const id = generateId();

  await db.insert(waba).values({
    id,
    merchantId: input.merchantId,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
    providerAppId: input.providerAppId ?? null,
    businessPortfolioId: input.businessPortfolioId ?? null,
    coexistEnabled: input.coexistEnabled,
    onboardingMethod: input.onboardingMethod ?? "embedded_signup",
    name: input.name ?? null,
    status: "active",
    isPrimary: input.isPrimary ?? false,
    createdAt: now,
    updatedAt: now,
  });

  return id;
};

/**
 * Create a credential for a WABA (e.g., business token).
 */
export const createWabaCredential = async (
  input: CreateWabaCredentialInput,
) => {
  const now = new Date();
  const id = generateId();

  await db.insert(wabaCredential).values({
    id,
    wabaId: input.wabaId,
    provider: input.provider,
    type: input.type,
    value: input.value,
    metadata: input.metadata ?? null,
    expiresAt: input.expiresAt ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return id;
};

/**
 * Create a phone number for a WABA.
 */
export const createWabaPhoneNumber = async (
  input: CreateWabaPhoneNumberInput,
) => {
  const now = new Date();
  const id = generateId();

  await db.insert(wabaPhoneNumber).values({
    id,
    wabaId: input.wabaId,
    merchantId: input.merchantId,
    providerPhoneNumberId: input.providerPhoneNumberId,
    phoneNumber: input.phoneNumber,
    displayName: input.displayName ?? null,
    status: "active",
    isPrimary: input.isPrimary ?? false,
    createdAt: now,
    updatedAt: now,
  });

  return id;
};

/**
 * Update WABA status.
 */
export const updateWabaStatus = async (wabaId: string, status: string) => {
  const now = new Date();

  await db
    .update(waba)
    .set({
      status,
      updatedAt: now,
    })
    .where(eq(waba.id, wabaId));
};
