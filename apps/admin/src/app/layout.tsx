import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Vortile Solutions - Live Chat Debugger",
  description:
    "Minimal interface to trigger WhatsApp Cloud API messages and template submissions for Meta review.",
};

const RootLayout = async ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en">
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
