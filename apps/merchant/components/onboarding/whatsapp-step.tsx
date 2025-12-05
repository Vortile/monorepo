"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { NavigationButtons } from "./navigation-buttons";

interface WhatsappStepProps {
  storeData: {
    name: string;
    slug: string;
    phone: string;
  };
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
}

export const WhatsappStep = ({
  storeData,
  onBack,
  onNext,
  isSubmitting = false,
}: WhatsappStepProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Conecte WhatsApp</h2>
        <p className="text-muted-foreground">
          Conecte a conta WhatsApp Business para sua loja{" "}
          <strong>{storeData.name}</strong>
        </p>
      </div>

      {!isConnected ? (
        <div className="space-y-6">
          {/* Info Card */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Como funciona
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Sua conta WhatsApp Business será conectada através da
                    Gupshup
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Seus clientes poderão enviar pedidos e mensagens diretamente
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Você gerencia tudo a partir de um único painel</span>
                </li>
              </ul>
            </div>
          </Card>

          <NavigationButtons
            onBack={onBack}
            onNext={handleConnect}
            nextLabel="Conectar WhatsApp Business"
            isNextLoading={isLoading}
          />

          <p className="text-xs text-muted-foreground text-center">
            Você será redirecionado para a Gupshup para autorizar a conexão
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connected State */}
          <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  WhatsApp Conectado com Sucesso
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Sua loja agora está pronta para receber pedidos no WhatsApp
                </p>
              </div>
            </div>
          </Card>

          {/* Store Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Detalhes da Loja</h3>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Nome da Loja</p>
                <p className="text-sm font-medium text-foreground">
                  {storeData.name}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Telefone de Suporte
                </p>
                <p className="text-sm font-medium text-foreground">
                  {storeData.phone}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">URL da Loja</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  vortile.com/loja/{storeData.slug}
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </p>
              </div>
            </div>
          </div>

          <NavigationButtons
            onBack={onBack}
            onNext={onNext}
            nextLabel="Concluir"
            isNextLoading={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};
