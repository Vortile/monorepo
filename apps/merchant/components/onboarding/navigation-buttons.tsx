"use client";

import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showBack?: boolean;
}

export const NavigationButtons = ({
  onBack,
  onNext,
  isNextDisabled,
  nextLabel = "Continuar",
  backLabel = "Voltar",
  isNextLoading = false,
  showBack = true,
}: NavigationButtonsProps) => (
  <div className="flex items-center justify-between gap-3 pt-8">
    {showBack && onBack ? (
      <Button variant="outline" onClick={onBack} size="lg">
        {backLabel}
      </Button>
    ) : (
      <div />
    )}
    <Button
      onClick={onNext}
      disabled={isNextDisabled || isNextLoading}
      size="lg"
    >
      {isNextLoading ? "Salvando..." : nextLabel}
    </Button>
  </div>
);
