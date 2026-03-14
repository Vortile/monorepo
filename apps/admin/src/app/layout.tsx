import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Vortile Solutions - Admin Dashboard",
  description: "Admin interface for managing emails, WhatsApp, and more.",
};

const RootLayout = async ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en">
    <body>
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </body>
  </html>
);

export default RootLayout;
