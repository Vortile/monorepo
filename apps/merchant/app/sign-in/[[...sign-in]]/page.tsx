import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <SignIn />
  </div>
);

export default SignInPage;
