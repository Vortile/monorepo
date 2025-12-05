"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  AtSignIcon as WhatsappIcon,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreSwitcher } from "@/components/store-switcher";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Catálogo",
    href: "/dashboard/catalog",
    icon: Package,
  },
  {
    label: "Equipe",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    label: "Configurações",
    href: "/dashboard/profile",
    icon: Settings,
  },
];

// Mock data - in a real app, this would come from context or API
const mockStores = [
  { id: "1", name: "Filial Centro", slug: "filial-centro" },
  { id: "2", name: "Filial Zona Leste", slug: "filial-zona-leste" },
];

const mockCurrentStore = mockStores[0];

export const Sidebar = () => {
  const pathname = usePathname();

  const handleSelectStore = (store: (typeof mockStores)[0]) => {
    // In a real app, this would update context/state
    console.log("Selected store:", store);
  };

  const handleCreateStore = () => {
    // In a real app, this would open a modal to create a new store
    console.log("Create new store");
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <WhatsappIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-lg">Vortile</h1>
        </div>
      </div>

      {/* Store Switcher */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="mb-3 flex items-center gap-2 px-2">
          <Building2 className="w-4 h-4 text-sidebar-accent" />
          <p className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
            Seu Negócio
          </p>
        </div>
        <StoreSwitcher
          currentStore={mockCurrentStore}
          stores={mockStores}
          onSelectStore={handleSelectStore}
          onCreateStore={handleCreateStore}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/60">v1.0.0</p>
      </div>
    </aside>
  );
};
