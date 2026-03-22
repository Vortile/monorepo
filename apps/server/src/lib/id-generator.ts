import { customAlphabet } from "nanoid";

// Use a custom alphabet without special characters
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21,
);

/**
 * Generate a unique ID for database records.
 * Uses nanoid with a URL-safe alphabet.
 */
export const generateId = () => nanoid();
