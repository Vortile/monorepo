"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => (
  // @ts-expect-error — @clerk/nextjs types lag behind React 19 ReactNode changes
  <ClerkProvider>{children}</ClerkProvider>
);
