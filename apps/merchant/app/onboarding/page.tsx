"use client";

import { useState } from "react";
import { OnboardingStepper } from "@/components/onboarding/stepper";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { BusinessStep } from "@/components/onboarding/business-step";
import { StoreStep } from "@/components/onboarding/store-step";
import { WhatsappStep } from "@/components/onboarding/whatsapp-step";
import { completeOnboarding } from "../actions/onboarding";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    businessName: "",
    businessLogo: null as string | null,
    storeName: "",
    storeSlug: "",
    storePhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleBusinessUpdate = (businessData: {
    name: string;
    logo: string | null;
  }) => {
    setData((prev) => ({
      ...prev,
      businessName: businessData.name,
      businessLogo: businessData.logo,
    }));
    handleNext();
  };

  const handleStoreUpdate = (storeData: {
    name: string;
    slug: string;
    phone: string;
  }) => {
    setData((prev) => ({
      ...prev,
      storeName: storeData.name,
      storeSlug: storeData.slug,
      storePhone: storeData.phone,
    }));
    handleNext();
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(data);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10 space-y-8">
      <OnboardingStepper currentStep={step} totalSteps={4} />

      <div className="mt-8">
        {step === 1 && <WelcomeStep onNext={handleNext} />}
        {step === 2 && (
          <BusinessStep
            initialData={{ name: data.businessName, logo: data.businessLogo }}
            onUpdate={handleBusinessUpdate}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <StoreStep
            initialData={{
              name: data.storeName,
              slug: data.storeSlug,
              phone: data.storePhone,
            }}
            onUpdate={handleStoreUpdate}
            onBack={handleBack}
          />
        )}
        {step === 4 && (
          <WhatsappStep
            storeData={{
              name: data.storeName,
              slug: data.storeSlug,
              phone: data.storePhone,
            }}
            onBack={handleBack}
            onNext={handleComplete}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
