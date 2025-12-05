"use client";

import { Bell, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  storeName?: string;
}

export const Header = ({ storeName = "Downtown Branch" }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Gerenciando
          </p>
          <p className="text-xs font-semibold text-foreground">{storeName}</p>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Bem-vindo de volta
        </h2>
        <p className="text-sm text-muted-foreground">
          Aqui está o que está acontecendo com sua loja
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
