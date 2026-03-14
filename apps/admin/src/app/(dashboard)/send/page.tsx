"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (body: Record<string, unknown>, key: string) => {
  const value = body[key];
  return typeof value === "string" ? value : undefined;
};

type ResultState = { type: "success" | "error"; message: string } | null;

const postJson = async (
  path: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response
    .json()
    .then((body) => (isRecord(body) ? body : {}))
    .catch(() => ({}) as Record<string, unknown>);

  if (!response.ok) {
    const message = readString(data, "error") ?? "Request failed";
    throw new Error(message);
  }

  return data;
};

const SendPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendResult, setSendResult] = useState<ResultState>(null);
  const [isSending, setIsSending] = useState(false);

  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [bodyText, setBodyText] = useState("");
  const [templateResult, setTemplateResult] = useState<ResultState>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const templateNameError = useMemo(() => {
    if (!templateName.trim()) {
      return "Template name is required";
    }
    return /^[a-z0-9_]+$/.test(templateName.trim())
      ? ""
      : "Use lowercase letters, numbers, and underscores only";
  }, [templateName]);

  const canSendMessage =
    phoneNumber.trim().length > 0 && messageBody.trim().length > 0;
  const canCreateTemplate =
    !templateNameError && bodyText.trim().length > 0 && category.length > 0;

  const handleSendMessage = async () => {
    setSendResult(null);
    setIsSending(true);
    try {
      await postJson("/waba/send-message", {
        phoneNumber: phoneNumber.trim(),
        messageBody: messageBody.trim(),
      });
      setSendResult({
        type: "success",
        message: "Message Sent via WhatsApp Cloud API",
      });
    } catch (error) {
      setSendResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to send message",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    setTemplateResult(null);
    setIsCreatingTemplate(true);
    try {
      const data = await postJson("/waba/create-template", {
        templateName: templateName.trim(),
        category,
        bodyText: bodyText.trim(),
      });

      const templateId =
        readString(data, "id") ??
        readString(data, "message_template_id") ??
        templateName.trim();

      const status =
        readString(data, "status") ??
        readString(data, "review_status") ??
        "PENDING";

      setTemplateResult({
        type: "success",
        message: `Template ${templateId} submitted. Status: ${status}`,
      });
    } catch (error) {
      setTemplateResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to create template",
      });
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-8">
        <div className="space-y-3">
          <Badge variant="secondary" className="tracking-[0.25em] uppercase">
            Send
          </Badge>
          <h1 className="text-4xl font-black sm:text-5xl">
            Live Chat & Templates
          </h1>
          <p className="max-w-3xl text-slate-600">
            Trigger WhatsApp Cloud API messages and submit templates for review.
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <Badge variant="secondary" className="tracking-[0.2em] uppercase">
              WhatsApp Cloud +{" "}
            </Badge>
            <CardTitle className="text-3xl">Live Chat Debugger</CardTitle>
            <CardDescription>
              Send a message through the WhatsApp Cloud API and capture both the
              trigger and delivery for Meta review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Destination Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="55XXXXXXXXXX"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea
                  placeholder="Type the exact copy you will show in the video"
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  rows={6}
                />
              </div>

              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={!canSendMessage || isSending}
                variant="default"
                size="lg"
                className="w-fit"
              >
                {isSending ? "Sending…" : "Send Message"}
              </Button>

              {sendResult && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                    sendResult.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {sendResult.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="space-y-2">
            <Badge variant="secondary" className="tracking-[0.2em] uppercase">
              Templates
            </Badge>
            <CardTitle className="text-3xl">Template Manager</CardTitle>
            <CardDescription>
              Register a brand-new message template, capture the API call, and
              showcase the status returned by Meta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  type="text"
                  placeholder="welcome_flow_01"
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                />
                {templateNameError && (
                  <span className="text-xs font-medium text-red-600">
                    {templateNameError}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus-visible:border-indigo-400 focus-visible:outline-none"
                >
                  <option value="UTILITY">UTILITY</option>
                  <option value="MARKETING">MARKETING</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Body Text</Label>
                <Textarea
                  placeholder="Oi {{1}}, aqui é a equipe Vortile!"
                  value={bodyText}
                  onChange={(event) => setBodyText(event.target.value)}
                  rows={5}
                />
              </div>

              <Button
                type="button"
                onClick={handleCreateTemplate}
                disabled={!canCreateTemplate || isCreatingTemplate}
                variant="secondary"
                size="lg"
                className="w-fit"
              >
                {isCreatingTemplate ? "Submitting…" : "Create Template"}
              </Button>

              {templateResult && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                    templateResult.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {templateResult.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SendPage;
