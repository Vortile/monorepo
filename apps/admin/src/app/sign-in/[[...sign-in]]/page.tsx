"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/" />
  </div>
);

export default SignInPage;
