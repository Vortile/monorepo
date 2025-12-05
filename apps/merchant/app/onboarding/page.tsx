"use client";

import { useEffect, useState } from "react";
import { OnboardingStepper } from "@/components/onboarding/stepper";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { BusinessStep } from "@/components/onboarding/business-step";
import { StoreStep } from "@/components/onboarding/store-step";
import { WhatsappStep } from "@/components/onboarding/whatsapp-step";
import { UserStep } from "@/components/onboarding/user-step";
import { checkMerchantStatus, completeOnboarding } from "../actions/onboarding";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const OnboardingPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    businessName: "",
    businessLogo: null as string | null,
    storeName: "",
    storeSlug: "",
    storePhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user already has a merchant
  useEffect(() => {
    const checkStatus = async () => {
      if (isLoaded && isSignedIn) {
        const hasMerchant = await checkMerchantStatus();
        if (hasMerchant) {
          router.replace("/dashboard");
        }
      }
    };
    checkStatus();
  }, [isLoaded, isSignedIn, router]);

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

  // If user is already signed in, skip the UserStep (step 4)
  // But we need to make sure the step logic handles this correctly
  // Let's adjust the steps:
  // 1. Welcome
  // 2. Business
  // 3. Store
  // 4. User (only if not signed in)
  // 5. Whatsapp

  const steps = isSignedIn
    ? ["Bem-vindo", "Negócio", "Loja", "WhatsApp"]
    : ["Bem-vindo", "Negócio", "Loja", "Conta", "WhatsApp"];

  const totalSteps = steps.length;

  return (
    <div className="container max-w-3xl mx-auto py-10 space-y-8">
      <OnboardingStepper currentStep={step} totalSteps={totalSteps} />

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

        {/* Logic for User Step vs Whatsapp Step */}
        {isSignedIn ? (
          <>
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
          </>
        ) : (
          <>
            {step === 4 && (
              <UserStep
                onBack={handleBack}
                onNext={handleNext}
                onUserCreated={() => {
                  // User created, move to next step (Whatsapp)
                  // The component handles onNext
                }}
              />
            )}
            {step === 5 && (
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
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
