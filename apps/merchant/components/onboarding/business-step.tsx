"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepLayout } from "./step-layout";
import { FileUploader } from "@/components/ui/file-uploader";
import { Typography } from "@/components/ui/typography";

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

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      onUpdate({ name, logo });
      setIsLoading(false);
    }, 500);
  };

  return (
    <StepLayout
      title="Configure seu Negócio"
      description="Essas informações serão sincronizadas com sua organização"
      onBack={onBack}
      onNext={handleNext}
      isNextDisabled={!name}
      isNextLoading={isLoading}
    >
      {/* Logo Upload */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Logotipo da Empresa</Label>
        <FileUploader value={logo} onChange={setLogo} />
        <Typography variant="muted" className="text-xs mt-2">
          PNG ou JPG, máx. 2MB
        </Typography>
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
        <Typography variant="muted" className="text-xs">
          Este é o nome principal da sua empresa
        </Typography>
      </div>
    </StepLayout>
  );
};
