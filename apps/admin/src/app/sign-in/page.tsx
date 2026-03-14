import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
    <SignIn />
  </div>
);

export default SignInPage;
