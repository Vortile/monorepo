"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
const buildBase = () => {
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
};

const fetchEmails = async (limit: number, direction: string) => {
  const base = buildBase();
  if (!base) throw new Error("Invalid NEXT_PUBLIC_API_BASE_URL");
  const response = await fetch(
    `${base}/emails?limit=${limit}&direction=${direction}`,
  );
  if (!response.ok) {
    throw new Error("Unable to fetch emails");
  }
  const body = await response.json();
  return Array.isArray(body.data) ? body.data : [];
};

const fetchEmailDetail = async (id: string) => {
  const base = buildBase();
  if (!base) throw new Error("Invalid NEXT_PUBLIC_API_BASE_URL");
  const response = await fetch(`${base}/emails/${id}`);
  if (!response.ok) {
    throw new Error("Unable to fetch email details");
  }
  const body = await response.json();
  return body.data;
};

type Email = {
  bcc: string[];
  cc: string[];
  created_at: string;
  from: string;
  id: string;
  last_event: string;
  reply_to: string[];
  scheduled_at: string;
  subject: string;
  to: string[];
  text: string;
  html: string;
  direction?: "sent" | "received";
};

const EmailsPage = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [limit, setLimit] = useState(10);
  const [direction, setDirection] = useState<"all" | "received" | "sent">(
    "all",
  );
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchEmails(limit, direction);
      const seen = new Map<string, Email>();
      list.forEach((item: any) => {
        if (!seen.has(item.id)) {
          seen.set(item.id, item);
        }
      });
      const unique = Array.from(seen.values()).sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      );
      setEmails(unique);
      const selectedId = selectedIdRef.current;
      if (selectedId) {
        const match = unique.find((item: any) => item.id === selectedId);
        setSelectedEmail(match ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  }, [limit, direction]);

  const loadDetail = async (email: Email) => {
    setDetailError(null);
    setIsLoadingDetail(true);
    try {
      const detail = await fetchEmailDetail(email.id);

      selectedIdRef.current = email.id;
      setSelectedEmail({ ...email, ...detail });
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Failed to load email detail",
      );
      selectedIdRef.current = email.id;
      setSelectedEmail(email);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div className="space-y-3">
          <Badge variant="muted" className="tracking-[0.25em] uppercase">
            Resend
          </Badge>
          <h1 className="text-4xl font-black sm:text-5xl">Inbox</h1>
          <p className="text-slate-600">
            View all inbound and outbound emails.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant={direction === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirection("all")}
                >
                  All
                </Button>
                <Button
                  variant={direction === "received" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirection("received")}
                >
                  Received
                </Button>
                <Button
                  variant={direction === "sent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirection("sent")}
                >
                  Sent
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">How many?</span>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(event) =>
                    setLimit(Number(event.target.value) || 10)
                  }
                  className="w-24"
                />
              </div>
              <Button type="button" onClick={load} disabled={isLoading}>
                {isLoading ? "Loading…" : `Load ${limit}`}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                  {error}
                </div>
              ) : null}

              {emails.length === 0 && !isLoading ? (
                <div className="text-sm text-slate-600">No emails found.</div>
              ) : null}

              <div className="flex max-h-[560px] flex-col gap-3 overflow-y-auto">
                {isLoading ? (
                  <div className="text-sm text-slate-600">Loading…</div>
                ) : (
                  emails.map((email) => {
                    const lastEvent = email.last_event || "unknown";
                    const toLine = Array.isArray(email.to)
                      ? email.to.join(", ")
                      : "";

                    return (
                      <button
                        key={email.id}
                        type="button"
                        onClick={() => loadDetail(email)}
                        className={`rounded-xl border p-4 text-left transition hover:border-slate-300 hover:shadow-sm ${
                          selectedEmail?.id === email.id
                            ? "border-slate-900 shadow-sm"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        {/* Email unit */}
                        <div className="flex items-start justify-between gap-4">
                          {/* Left side */}
                          <div className="space-y-1">
                            {/* Header */}
                            <div className="flex items-center gap-2">
                              {email.direction === "received" ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                              ) : email.direction === "sent" ? (
                                <ArrowUpRight className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Mail className="h-4 w-4 text-slate-400" />
                              )}
                              {/* Subject */}
                              <p className="text-base font-semibold text-slate-900">
                                {email.subject || "(No subject)"}
                              </p>

                              {/* Status badge */}
                              <Badge
                                variant="default"
                                className="text-[10px] uppercase"
                              >
                                {lastEvent}
                              </Badge>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col text-xs text-slate-600">
                              <span className="">
                                {email.from ? `From: ${email.from}` : null}
                              </span>
                              <span>{toLine ? `To: ${toLine}` : null}</span>
                            </div>
                          </div>

                          {/* Right side - Date */}
                          <p className="text-xs whitespace-nowrap text-slate-500">
                            {new Date(email.created_at).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {!selectedEmail ? (
                <p className="text-sm text-slate-600">
                  Select an email to see details.
                </p>
              ) : (
                <div className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedEmail.subject || "(No subject)"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {selectedEmail.from
                          ? `From: ${selectedEmail.from}`
                          : null}
                        {selectedEmail.from && selectedEmail.to?.length
                          ? " • "
                          : null}
                        {selectedEmail.to?.length
                          ? `To: ${selectedEmail.to.join(", ")}`
                          : null}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>
                        {new Date(selectedEmail.created_at).toLocaleString()}
                      </p>
                      <p className="mt-1 capitalize">
                        {selectedEmail.last_event || ""}
                      </p>
                    </div>
                  </div>

                  {detailError ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      {detailError}
                    </div>
                  ) : null}

                  {isLoadingDetail ? (
                    <p className="text-sm text-slate-600">Loading details…</p>
                  ) : null}

                  <div className="flex-1 overflow-hidden rounded-lg border border-slate-100 bg-white">
                    {selectedEmail.html ? (
                      <iframe
                        srcDoc={selectedEmail.html}
                        className="h-full w-full border-0"
                        title="Email Content"
                        sandbox="allow-same-origin"
                      />
                    ) : selectedEmail.text ? (
                      <div className="h-full overflow-y-auto p-4">
                        <pre className="font-mono text-sm whitespace-pre-wrap text-slate-800">
                          {selectedEmail.text}
                        </pre>
                      </div>
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-slate-600">
                          No content available.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        selectedIdRef.current = null;
                        setSelectedEmail(null);
                      }}
                    >
                      Back to list
                    </Button>
                    <Button
                      type="button"
                      onClick={() => loadDetail(selectedEmail)}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmailsPage;
