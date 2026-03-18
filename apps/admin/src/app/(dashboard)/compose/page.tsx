"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { IconChevronRight, IconLoader } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ComposePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setFrom(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim() || !subject.trim() || !message.trim())
      return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const API_BASE = (
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
      ).replace(/\/$/, "");

      const res = await fetch(`${API_BASE}/api/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from.trim(),
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to send email");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compose Email</h1>
          <p className="text-muted-foreground text-sm">
            Send a new email using Resend
          </p>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>New Email</CardTitle>
          <CardDescription>
            Fill in the details below to send an email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                type="email"
                placeholder="sender@example.com"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your email message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading || success}
                rows={10}
              />
            </div>

            {error && (
              <div className="border-destructive bg-destructive/10 rounded-lg border p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-3">
                <p className="text-sm text-green-600 dark:text-green-400">
                  Email sent successfully! Redirecting to dashboard...
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || success}>
                {loading ? (
                  <>
                    <IconLoader className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Email
                    <IconChevronRight className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComposePage;
