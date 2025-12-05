"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@vortile/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vortile/ui/components/ui/form";
import { Input } from "@vortile/ui/components/ui/input";
import { Checkbox } from "@vortile/ui/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false).optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<
    z.infer<typeof signupSchema> | z.infer<typeof loginSchema>
  >({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" ? { name: "" } : { remember: false }),
    },
  });

  async function onSubmit(
    values: z.infer<typeof signupSchema> | z.infer<typeof loginSchema>,
  ) {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const signupValues = values as z.infer<typeof signupSchema>;
        await authClient.signUp.email({
          email: signupValues.email,
          password: signupValues.password,
          name: signupValues.name,
          callbackURL: "/",
        });
      } else {
        const loginValues = values as z.infer<typeof loginSchema>;
        await authClient.signIn.email({
          email: loginValues.email,
          password: loginValues.password,
          rememberMe: loginValues.remember,
          callbackURL: "/",
        });
      }
      router.push("/");
    } catch (error) {
      console.error("Auth error:", error);
      // TODO: Add toast notification
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            src="/vortile-icon.svg"
            alt="Vortile Logo"
            width={60}
            height={60}
            className="mb-2"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login"
              ? "Log in to your account to continue"
              : "Sign up to get started with Vortile"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "signup" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <Link
                  href="#"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </Form>

        <div className="text-muted-foreground text-center text-sm">
          {mode === "login" ? (
            <>
              Need to create an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
