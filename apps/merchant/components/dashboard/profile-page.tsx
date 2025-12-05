"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, MessageCircle, LogOut } from "lucide-react";
import Image from "next/image";

export const ProfilePage = () => {
  const [merchantName, setMerchantName] = useState("Sharma Foods");
  const [slug, setSlug] = useState("sharma-foods");
  const [brandColor, setBrandColor] = useState("#1298D5");
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConnect = () => {
    // Simulate WhatsApp connection
    setIsConnected(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações e marca da loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nome do Comerciante
            </label>
            <Input
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Nome da sua loja"
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Slug da Loja
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="sua-loja-slug"
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              URL da sua loja: https://plataforma.com/{slug}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Cor da Marca
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-16 h-10 rounded cursor-pointer border border-border"
              />
              <span className="text-sm text-muted-foreground">
                {brandColor}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Esta cor será usada na sua loja
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Integração WhatsApp
          </CardTitle>
          <CardDescription>
            Conecte sua Conta de Negócios WhatsApp via Gupshup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Conectado</p>
                  <p className="text-sm text-green-800">
                    Sua conta WhatsApp está ativa
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                    <Image
                      src="/placeholder.svg?height=64&width=64"
                      alt="Logo do Negócio"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Nome do Negócio
                    </p>
                    <p className="text-lg font-semibold text-foreground mb-3">
                      Sharma Foods Business
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Número de Telefone
                    </p>
                    <p className="text-base font-mono text-foreground">
                      +55 (11) 98765-4321
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    ID WABA
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    100123456789012
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    ID do Número de Telefone
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    103456789012345
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Nome WABA
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    Sharma Foods Business
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    Verificado
                  </Badge>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsConnected(false)}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar WhatsApp
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Não Conectado</p>
                  <p className="text-sm text-yellow-800">
                    Conecte sua conta WhatsApp para começar a vender
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Clique no botão abaixo para conectar sua Conta de Negócios
                WhatsApp. Você será redirecionado para o Gupshup para completar
                o fluxo OAuth.
              </p>

              <Button
                onClick={handleConnect}
                size="lg"
                className="w-full md:w-auto bg-primary"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conectar com WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da API</CardTitle>
          <CardDescription>
            Use essas credenciais para integração com API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Token de Acesso
              </p>
              <p className="font-mono text-xs text-foreground break-all">
                sk_test_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Mantenha este token seguro. Nunca o compartilhe publicamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
