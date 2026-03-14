"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (

  <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex bg-background border-b h-14 items-center px-4 shrink-0">
            <SidebarTrigger />
            <div className="ml-auto flex items-center space-x-4">
              {/* Additional header items could go here */}
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
);
export default DashboardLayout;
