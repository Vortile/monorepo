"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { NavigationButtons } from "./navigation-buttons";
import Image from "next/image";

interface BusinessStepProps {
  initialData: {
    name: string;
    logo: string | null;
  };
  onUpdate: (data: { name: string; logo: string | null }) => void;
  onBack: () => void;
}

export const BusinessStep = ({
  initialData,
  onUpdate,
  onBack,
}: BusinessStepProps) => {
  const [name, setName] = useState(initialData.name);
  const [logo, setLogo] = useState<string | null>(initialData.logo);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      onUpdate({ name, logo });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Configure seu Negócio
        </h2>
        <p className="text-muted-foreground">
          Essas informações serão sincronizadas com sua organização
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Logotipo da Empresa</Label>
        <div className="flex items-center gap-6">
          {logo ? (
            <div className="w-24 h-24 rounded-lg bg-muted border-2 border-primary/20 overflow-hidden flex items-center justify-center">
              <Image
                src={logo || "/placeholder.svg"}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <label className="relative cursor-pointer">
              <span className="inline-flex items-center justify-center px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Escolher arquivo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              PNG ou JPG, máx. 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Business Name */}
      <div className="space-y-3">
        <Label htmlFor="business-name" className="text-base font-semibold">
          Nome da Empresa
        </Label>
        <Input
          id="business-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Pizzaria do João"
          className="text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          Este é o nome principal da sua empresa
        </p>
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={handleNext}
        isNextDisabled={!name}
        isNextLoading={isLoading}
      />
    </div>
  );
};
