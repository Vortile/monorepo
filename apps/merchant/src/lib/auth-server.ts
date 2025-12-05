import { headers } from "next/headers";
import { authClient } from "./auth-client";

export const getSession = async () => {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  return session;
};
