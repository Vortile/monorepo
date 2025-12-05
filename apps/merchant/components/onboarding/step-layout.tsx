import { ReactNode } from "react";
import { NavigationButtons } from "./navigation-buttons";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";

interface StepLayoutProps {
  title: string;
  description?: string | ReactNode;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  centerHeader?: boolean;
}

export const StepLayout = ({
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel,
  backLabel,
  isNextDisabled,
  isNextLoading,
  showBack = true,
  showNext = true,
  centerHeader = false,
}: StepLayoutProps) => (
  <div className="space-y-6">
    <div className={cn("space-y-2", centerHeader && "text-center")}>
      <Typography variant="h2" className="border-none pb-0">
        {title}
      </Typography>
      {description && (
        <div className="text-muted-foreground">
          {typeof description === "string" ? (
            <Typography variant="muted">{description}</Typography>
          ) : (
            description
          )}
        </div>
      )}
    </div>

    <div className="space-y-6">{children}</div>

    {showNext && (
      <NavigationButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={nextLabel}
        backLabel={backLabel}
        isNextDisabled={isNextDisabled}
        isNextLoading={isNextLoading}
        showBack={showBack}
      />
    )}
  </div>
);
