"use client";

import { useMemo, useState } from "react";

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

const Home = () => {
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl">
          <header className="mb-8">
            <p className="text-sm font-semibold tracking-[0.25em] text-indigo-300/80">
              VORTILE SOLUTIONS
            </p>
            <h1 className="mt-2 text-4xl font-black text-white">
              Live Chat Debugger
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Send a message through the WhatsApp Cloud API and capture both the
              trigger and delivery in a single take for Meta review.
            </p>
          </header>

          <div className="grid gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-300 uppercase">
                Destination Phone Number
              </span>
              <input
                type="tel"
                placeholder="55XXXXXXXXXX"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-base text-white transition outline-none focus:border-indigo-400"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-300 uppercase">
                Message Content
              </span>
              <textarea
                placeholder="Type the exact copy you will show in the video"
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                rows={6}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-base text-white transition outline-none focus:border-indigo-400"
              />
            </label>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!canSendMessage || isSending}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-lg font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isSending ? "Sending…" : "Send Message"}
            </button>

            {sendResult && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  sendResult.type === "success"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                    : "border-red-500/50 bg-red-500/10 text-red-100"
                }`}
                role="status"
                aria-live="polite"
              >
                {sendResult.message}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl">
          <header className="mb-8">
            <p className="text-sm font-semibold tracking-[0.25em] text-indigo-300/80">
              VORTILE SOLUTIONS
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Template Manager
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Register a brand-new message template, capture the API call, and
              showcase the template status returned by Meta.
            </p>
          </header>

          <div className="grid gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-300 uppercase">
                Template Name
              </span>
              <input
                type="text"
                placeholder="welcome_flow_01"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-base text-white transition outline-none focus:border-indigo-400"
              />
              {templateNameError && (
                <span className="text-xs font-medium text-red-300">
                  {templateNameError}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-300 uppercase">
                Category
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-base text-white transition outline-none focus:border-indigo-400"
              >
                <option value="UTILITY">UTILITY</option>
                <option value="MARKETING">MARKETING</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-300 uppercase">
                Body Text
              </span>
              <textarea
                placeholder="Oi {{1}}, aqui é a equipe Vortile!"
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                rows={5}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-base text-white transition outline-none focus:border-indigo-400"
              />
            </label>

            <button
              type="button"
              onClick={handleCreateTemplate}
              disabled={!canCreateTemplate || isCreatingTemplate}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-lg font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isCreatingTemplate ? "Submitting…" : "Create Template"}
            </button>

            {templateResult && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  templateResult.type === "success"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                    : "border-red-500/50 bg-red-500/10 text-red-100"
                }`}
                role="status"
                aria-live="polite"
              >
                {templateResult.message}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
