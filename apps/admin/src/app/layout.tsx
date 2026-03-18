import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Vortile Solutions - Admin Dashboard",
  description: "Admin interface for managing emails, WhatsApp, and more.",
};

const RootLayout = async ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en" className={cn("font-sans", geist.variable)}>
    <body>
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </body>
  </html>
);

export default RootLayout;
