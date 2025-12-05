"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

const fetchEmails = async (limit: number) => {
  const response = await fetch(`${API_BASE_URL}/emails?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Unable to fetch emails");
  }
  const body = await response.json();
  return Array.isArray(body.data) ? body.data : [];
};

type Email = {
  id: string;
  to: string[];
  subject: string;
  created_at: string;
};

const EmailsPage = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchEmails(limit);
      setEmails(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setIsLoading(false);
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
              <CardTitle className="text-2xl">Recent Emails</CardTitle>
              <p className="text-sm text-slate-600">
                Powered by the /api/emails endpoint.
              </p>
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
          <CardContent className="space-y-3">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {error}
              </div>
            ) : null}

            {emails.length === 0 && !isLoading ? (
              <div className="text-sm text-slate-600">No emails found.</div>
            ) : null}

            <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto">
              {isLoading ? (
                <div className="text-sm text-slate-600">Loading…</div>
              ) : (
                emails.map((email) => (
                  <article
                    key={email.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-900">
                          {email.subject || "(No subject)"}
                        </p>
                        <p className="text-xs text-slate-600">
                          To: {email.to.join(", ")}
                        </p>
                      </div>
                      <p className="text-xs whitespace-nowrap text-slate-500">
                        {new Date(email.created_at).toLocaleString()}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmailsPage;
