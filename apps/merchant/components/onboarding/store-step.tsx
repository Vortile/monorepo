"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepLayout } from "./step-layout";

interface StoreStepProps {
  initialData: {
    name: string;
    slug: string;
    phone: string;
  };
  onUpdate: (data: { name: string; slug: string; phone: string }) => void;
  onBack: () => void;
}

export const StoreStep = ({
  initialData,
  onUpdate,
  onBack,
}: StoreStepProps) => {
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone);
  const [isLoading, setIsLoading] = useState(false);

  const slug = useMemo(
    () =>
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    [name]
  );

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      onUpdate({ name, slug, phone });
      setIsLoading(false);
    }, 500);
  };

  return (
    <StepLayout
      title="Sua Primeira Loja"
      description="Esta será a localização onde seus clientes interagirão com você"
      onBack={onBack}
      onNext={handleNext}
      isNextDisabled={!name || !phone}
      isNextLoading={isLoading}
    >
      {/* Store Name */}
      <div className="space-y-3">
        <Label htmlFor="store-name" className="text-base font-semibold">
          Nome da Loja
        </Label>
        <Input
          id="store-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Filial Centro"
          className="text-base"
          required
        />
        <p className="text-xs text-muted-foreground">
          Digite o nome do seu local de negócio
        </p>
      </div>

      {/* Slug Preview */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">URL da Loja</Label>
        <div className="p-3 bg-muted rounded-lg border border-border text-sm text-muted-foreground font-mono">
          vortile.com/loja/<strong>{slug || "sua-loja"}</strong>
        </div>
        <p className="text-xs text-muted-foreground">
          Gerado automaticamente do nome da loja
        </p>
      </div>

      {/* Support Phone */}
      <div className="space-y-3">
        <Label htmlFor="support-phone" className="text-base font-semibold">
          Número de Suporte
        </Label>
        <Input
          id="support-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          className="text-base"
          type="tel"
          required
        />
        <p className="text-xs text-muted-foreground">
          O número que seus clientes usarão para entrar em contato
        </p>
      </div>
    </StepLayout>
  );
};
