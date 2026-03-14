"use client";

import { Inbox, Send, Settings, MessageCircle, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Inbox",
    url: "/",
    icon: Inbox,
  },
  {
    title: "Sent",
    url: "/?direction=sent",
    icon: Send,
  },
  {
    title: "WhatsApp Send",
    url: "/send",
    icon: MessageCircle,
  },
];

export const AppSidebar = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Settings className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Vortile</span>
          <span className="truncate text-xs">Admin Console</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {user && (
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user.imageUrl} />
                 <AvatarFallback>{user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div className="grid flex-1 text-left text-sm leading-tight">
                 <span className="truncate font-medium">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>
                 <span className="truncate text-xs text-muted-foreground">Admin</span>
               </div>
             </div>
             <button onClick={() => signOut()} className="text-muted-foreground hover:text-foreground">
               <LogOut className="size-4" />
               <span className="sr-only">Log Out</span>
             </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}