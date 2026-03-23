"use client";

import { SignIn } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const UnauthorizedPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 dark:bg-slate-950">
    <div className="w-full max-w-md space-y-6">
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            <CardTitle className="text-xl text-amber-900 dark:text-amber-100">
              Unauthorized Device Detected
            </CardTitle>
          </div>
          <CardDescription className="text-amber-800 dark:text-amber-200">
            We noticed a sign-in attempt from an unrecognized device. Please
            verify your identity to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-slate-900">
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
              Security Check
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>This device is not recognized</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>Additional verification required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>Check your email for verification instructions</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-white shadow-sm dark:bg-slate-900">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none",
            },
          }}
        />
      </div>
    </div>
  </div>
);

export default UnauthorizedPage;
