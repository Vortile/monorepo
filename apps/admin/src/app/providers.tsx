"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => (
  <ClerkProvider>{children}</ClerkProvider>
);
