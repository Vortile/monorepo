import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
    <SignUp />
  </div>
);

export default SignUpPage;
