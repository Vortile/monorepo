import { Building2, Store } from "lucide-react";
import { NavigationButtons } from "./navigation-buttons";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => (
  <div className="space-y-8">
    <div className="text-center space-y-3">
      <h2 className="text-3xl font-bold text-foreground">Vamos começar</h2>
      <p className="text-lg text-muted-foreground">
        Entenda como o Vortile organiza seu negócio
      </p>
    </div>

    {/* Visual Diagram */}
    <div className="flex items-center justify-center gap-8 py-8">
      {/* Business Box */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <p className="font-semibold text-foreground text-center">Seu Negócio</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          A identidade principal da sua empresa
        </p>
      </div>

      {/* Arrow */}
      <div className="text-3xl text-muted-foreground">→</div>

      {/* Store Box */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center">
          <Store className="w-12 h-12 text-primary" />
        </div>
        <p className="font-semibold text-foreground text-center">Sua Loja</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Um local onde seus clientes interagem
        </p>
      </div>
    </div>

    {/* Explanation */}
    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Como funciona:</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-3">
          <span className="text-primary font-bold mt-1">1.</span>
          <span>
            <strong>Configure seu Negócio:</strong> Defina o nome e logotipo da
            sua empresa
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-primary font-bold mt-1">2.</span>
          <span>
            <strong>Crie uma Loja:</strong> Cada local onde você vende é uma
            loja diferente
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-primary font-bold mt-1">3.</span>
          <span>
            <strong>Conecte WhatsApp:</strong> Seus clientes interagem através
            do WhatsApp Business
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-primary font-bold mt-1">4.</span>
          <span>
            <strong>Gerencie Tudo:</strong> Um painel para gerenciar todas as
            suas lojas
          </span>
        </li>
      </ul>
    </div>

    {/* Navigation Buttons */}
    <NavigationButtons onNext={onNext} showBack={false} />
  </div>
);
