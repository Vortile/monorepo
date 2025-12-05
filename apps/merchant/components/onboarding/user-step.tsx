"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { StepLayout } from "./step-layout";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface UserStepProps {
  onBack: () => void;
  onNext: () => void;
  onUserCreated: (userId: string) => void;
}

export const UserStep = ({ onBack, onNext, onUserCreated }: UserStepProps) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError("Não foi possível verificar o código");
      }

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        if (completeSignUp.createdUserId) {
          onUserCreated(completeSignUp.createdUserId);
        }
        // Do not call onNext() here. The parent component will handle the transition
        // when the auth state changes (isSignedIn becomes true).
        // Calling onNext() would increment the step counter, but switching to the
        // authenticated flow (which has fewer steps) would cause a mismatch.
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Código inválido");
      setIsLoading(false); // Only stop loading on error
    }
  };

  if (verifying) {
    return (
      <StepLayout
        title="Verifique seu email"
        description={
          <>
            Enviamos um código de verificação para{" "}
            <span className="font-medium">{email}</span>
          </>
        }
        centerHeader
        showNext={false}
        showBack={false}
      >
        <div className="flex justify-center py-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => {
              setCode(value);
              setError("");
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
            <div className="w-4" />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading || code.length < 6}
            size="lg"
          >
            {isLoading ? "Verificando..." : "Verificar Email"}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setVerifying(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
        </div>
      </StepLayout>
    );
  }
  return (
    <StepLayout
      title="Crie sua conta"
      description="Seus dados de acesso ao painel administrativo"
      onBack={onBack}
      onNext={handleSubmit}
      nextLabel="Criar Conta"
      isNextLoading={isLoading}
      isNextDisabled={!email || !password || !firstName || !lastName}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Seu sobrenome"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </StepLayout>
  );
};
