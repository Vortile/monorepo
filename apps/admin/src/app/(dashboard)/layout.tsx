import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </SidebarInset>
  </SidebarProvider>
);

export default DashboardLayout;
