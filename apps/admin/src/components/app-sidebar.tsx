"use client";

import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconMessageCircle,
  IconPlus,
  IconDeviceMobile,
  IconApps,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navMain = [
  { title: "Dashboard", url: "/", icon: IconDashboard },
  { title: "Compose Email", url: "/compose", icon: IconPlus },
  { title: "WhatsApp Templates", url: "/send", icon: IconMessageCircle },
  { title: "WABA Connections", url: "/waba", icon: IconDeviceMobile },
  { title: "Partner Apps", url: "/waba/partner-apps", icon: IconApps },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => (
  <Sidebar collapsible="icon" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<a href="/" />}
            className="data-[slot=sidebar-menu-button]:p-1.5!"
            tooltip="Vortile Admin"
          >
            <IconInnerShadowTop className="size-5!" />
            <span className="text-base font-semibold">Vortile Admin</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain items={navMain} />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
);
