"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const formSchema = z.object({
  brandName: z
    .string()
    .min(1, "Brand name is required")
    .max(200, "Brand name is too long"),
  gupshupAppName: z
    .string()
    .min(1, "Gupshup app name is required")
    .max(100, "App name is too long"),
  gupshupAppId: z
    .string()
    .min(1, "Gupshup app ID is required")
    .max(100, "App ID is too long"),
});

type FormData = z.infer<typeof formSchema>;

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const RegisterWabaForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: "",
      gupshupAppName: "",
      gupshupAppId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/waba/onboarding/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to register WABA");
      }

      setResult({
        type: "success",
        message: json.message || `Successfully registered ${data.brandName}!`,
      });

      form.reset();
    } catch (error) {
      setResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to register WABA",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="brandName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., McDonald's"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The business name that will be displayed to customers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gupshupAppName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gupshup App Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., mcdonalds_app"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The app name from Gupshup Partner Portal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gupshupAppId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gupshup App ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., abc123-def456"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The unique app ID from Gupshup (UUID format)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register WABA"
            )}
          </Button>
        </form>
      </Form>

      {result && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 ${
            result.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg border p-4">
        <h3 className="mb-2 text-sm font-medium">How to get these values:</h3>
        <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
          <li>Log in to Gupshup Partner Portal</li>
          <li>Navigate to your apps list</li>
          <li>Find the app you want to register</li>
          <li>Copy the App Name and App ID</li>
          <li>Enter the business brand name here</li>
        </ol>
      </div>
    </div>
  );
};
