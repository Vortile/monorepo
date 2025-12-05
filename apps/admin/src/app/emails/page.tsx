"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

const fetchEmails = async (limit: number) => {
  const response = await fetch(
    `${API_BASE_URL}/emails?limit=${limit}&direction=all`,
  );
  if (!response.ok) {
    throw new Error("Unable to fetch emails");
  }
  const body = await response.json();
  return Array.isArray(body.data) ? body.data : [];
};

const fetchEmailDetail = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/emails/${id}`);
  if (!response.ok) {
    throw new Error("Unable to fetch email details");
  }
  const body = await response.json();
  return body.data;
};

type Email = {
  id: string;
  to?: string[];
  from?: string;
  subject?: string;
  created_at: string;
  direction?: string;
  html?: string;
  text?: string;
};

const EmailsPage = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchEmails(limit);
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
      if (selectedEmail) {
        const match = unique.find((item: any) => item.id === selectedEmail.id);
        setSelectedEmail(match ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetail = async (email: Email) => {
    setDetailError(null);
    setIsLoadingDetail(true);
    try {
      const detail = await fetchEmailDetail(email.id);
      setSelectedEmail({ ...email, ...detail });
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Failed to load email detail",
      );
      setSelectedEmail(email);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div className="space-y-3">
          <Badge variant="muted" className="tracking-[0.25em] uppercase">
            Resend
          </Badge>
          <h1 className="text-4xl font-black sm:text-5xl">Latest Emails</h1>
          <p className="text-slate-600">
            Review recent deliveries and adjust how many to load.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Sent & Received</CardTitle>
              <p className="text-sm text-slate-600">Powered by /api/emails.</p>
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
                    const direction = email.direction || "unknown";
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
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">
                                {email.subject || "(No subject)"}
                              </p>
                              <Badge
                                variant="default"
                                className="text-[10px] uppercase"
                              >
                                {direction}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600">
                              {email.from ? `From: ${email.from}` : null}
                              {email.from && toLine ? " • " : null}
                              {toLine ? `To: ${toLine}` : null}
                            </p>
                          </div>
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
                        {selectedEmail.direction || ""}
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

                  <div className="flex-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-800">
                    {selectedEmail.html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                      />
                    ) : selectedEmail.text ? (
                      <pre className="text-sm whitespace-pre-wrap">
                        {selectedEmail.text}
                      </pre>
                    ) : (
                      <p className="text-sm text-slate-600">
                        No content available.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedEmail(null)}
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
