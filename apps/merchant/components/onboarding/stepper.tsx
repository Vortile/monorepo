"use client";

import { Stepper, StepperItem, StepperLabel } from "@/components/ui/stepper";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

const steps = ["Bem-vindo", "Negócio", "Loja", "WhatsApp"];

export const OnboardingStepper = ({
  currentStep,
  totalSteps,
}: StepperProps) => (
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
