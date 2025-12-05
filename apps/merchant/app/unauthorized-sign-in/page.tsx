import { SignIn } from "@clerk/nextjs";

const UnauthorizedSignInPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold text-foreground">Acesso Necessário</h1>
      <p className="mt-2 text-muted-foreground">
        Você precisa estar logado para acessar esta página.
      </p>
    </div>
    <SignIn signUpUrl="/onboarding" />
  </div>
);

export default UnauthorizedSignInPage;
