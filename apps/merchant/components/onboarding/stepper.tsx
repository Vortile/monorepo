"use client";

import { Stepper, StepperItem, StepperLabel } from "@/components/ui/stepper";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingStepper = ({
  currentStep,
  totalSteps,
}: StepperProps) => {
  // Generate steps dynamically based on totalSteps
  // If totalSteps is 5, it means we have the User step
  const steps =
    totalSteps === 5
      ? ["Bem-vindo", "Negócio", "Loja", "Conta", "WhatsApp"]
      : ["Bem-vindo", "Negócio", "Loja", "WhatsApp"];

  return (
    <Stepper value={`step-${currentStep}`} orientation="horizontal">
      {steps.map((stepName, index) => {
        const stepNum = index + 1;
        const isCompleted = currentStep > stepNum;

        return (
          <StepperItem
            key={stepNum}
            value={`step-${stepNum}`}
            completed={isCompleted}
            className="flex-1"
          >
            <StepperLabel className="hidden sm:block text-xs md:text-sm font-bold">
              {stepNum}
            </StepperLabel>
          </StepperItem>
        );
      })}
    </Stepper>
  );
};
