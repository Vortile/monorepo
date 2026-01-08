import { hc } from "hono/client";
// We would ideally import the AppType from apps/api, but for now we might need to rely on meaningful inference or loose typing until monorepo linking is perfect
// import type { AppType } from "../../../api/src/index";

// Using a generic fetch wrapper or axios is also fine if RPC types aren't shared yet.
// For this plan, we'll assume a basic fetcher for now to avoid TS errors with missing monorepo links.

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export async function fetcher<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }

  return res.json();
}
