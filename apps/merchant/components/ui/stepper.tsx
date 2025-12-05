"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createContext, forwardRef, HTMLAttributes, useContext } from "react";

const StepperContext = createContext<{
  value?: string;
  orientation?: "horizontal" | "vertical";
} | null>(null);

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a Stepper component");
  }
  return context;
};

interface StepperRootProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  orientation?: "horizontal" | "vertical";
}

const Stepper = forwardRef<HTMLDivElement, StepperRootProps>(
  ({ className, value, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row items-center"
          : "flex-col items-start",
        className
      )}
      {...props}
    >
      <StepperContext.Provider value={{ value, orientation }}>
        {props.children}
      </StepperContext.Provider>
    </div>
  )
);
Stepper.displayName = "Stepper";

interface StepperItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  completed?: boolean;
  disabled?: boolean;
}

const StepperItem = forwardRef<HTMLDivElement, StepperItemProps>(
  (
    { className, value, completed = false, disabled = false, ...props },
    ref
  ) => {
    const { value: activeValue, orientation } = useStepper();
    const isActive = activeValue === value;
    const isCompleted = completed;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center",
          orientation === "horizontal" ? "flex-1" : "w-full",
          className
        )}
        {...props}
      >
        <div className="flex items-center flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
              isActive &&
                "bg-primary text-primary-foreground ring-4 ring-primary/20",
              isCompleted && "bg-primary/20 text-primary",
              !isActive && !isCompleted && "bg-muted text-muted-foreground"
            )}
          >
            {isCompleted ? <Check className="w-5 h-5" /> : props.children}
          </div>

          {orientation === "horizontal" && (
            <div
              className={cn(
                "h-1 flex-1 mx-2 rounded transition-all",
                isCompleted ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      </div>
    );
  }
);
StepperItem.displayName = "StepperItem";

type StepperLabelProps = HTMLAttributes<HTMLDivElement>;

const StepperLabel = forwardRef<HTMLDivElement, StepperLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
);
StepperLabel.displayName = "StepperLabel";

export { Stepper, StepperItem, StepperLabel, useStepper };
