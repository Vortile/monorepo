"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

type ResultState = { type: "success" | "error"; message: string } | null;

const EmailSendPage = () => {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<ResultState>(null);
  const [isSending, setIsSending] = useState(false);

  const normalizedBaseUrl = useMemo(() => {
    const raw = (API_BASE_URL ?? "").trim();
    if (!raw) return null;
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const url = new URL(withProtocol);
      const pathname = url.pathname.replace(/\/$/, "");
      if (!pathname.endsWith("/api")) {
        url.pathname = `${pathname}/api`;
      }
      return url.toString().replace(/\/$/, "");
    } catch (_err) {
      return null;
    }
  }, []);

  const canSend = to.trim() && subject.trim() && message.trim();

  const handleSend = async () => {
    setStatus(null);
    setIsSending(true);
    try {
      if (!normalizedBaseUrl) {
        throw new Error(
          "Invalid NEXT_PUBLIC_API_BASE_URL; include protocol, e.g. https://api.example.com/api",
        );
      }
      const response = await fetch(`${normalizedBaseUrl}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from.trim() || undefined,
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          typeof body?.error === "string" ? body.error : "Failed to send email";
        throw new Error(errorMessage);
      }

      setStatus({ type: "success", message: "Email sent successfully" });
      setTo("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to send email",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-8">
        <div className="space-y-3">
          <Badge variant="muted" className="tracking-[0.25em] uppercase">
            Resend
          </Badge>
          <h1 className="text-4xl font-black sm:text-5xl">Send an Email</h1>
          <p className="text-slate-600">
            Send an email via the API; the API will forward through Resend.
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Compose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="email"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                placeholder="contact@vortile.com"
              />
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="email"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject line"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                placeholder="Write your message..."
              />
            </div>

            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending || !canSend}
              size="lg"
              className="w-fit"
            >
              {isSending ? "Sending…" : "Send Email"}
            </Button>

            {status && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmailSendPage;
