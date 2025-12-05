"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Check, Store } from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  slug: string;
}

interface StoreSwitcherProps {
  currentStore: StoreData | null;
  stores: StoreData[];
  onSelectStore: (store: StoreData) => void;
  onCreateStore: () => void;
}

export const StoreSwitcher = ({
  currentStore,
  stores,
  onSelectStore,
  onCreateStore,
}: StoreSwitcherProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between text-left font-normal bg-transparent"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Store className="w-4 h-4 shrink-0 text-sidebar-accent" />
            <span className="truncate text-sidebar-foreground text-sm">
              {currentStore ? currentStore.name : "Selecione uma loja"}
            </span>
          </div>
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground tracking-wider">
          Suas Lojas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {stores.length > 0 ? (
          <>
            {stores.map((store) => (
              <DropdownMenuItem
                key={store.id}
                onClick={() => {
                  onSelectStore(store);
                  setOpen(false);
                }}
                className="cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Store className="w-4 h-4" />
                  <span className="flex-1">{store.name}</span>
                </div>
                {currentStore?.id === store.id && (
                  <Check className="w-4 h-4 text-primary ml-2" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}

        <DropdownMenuItem onClick={onCreateStore} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          <span>Nova Loja</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
