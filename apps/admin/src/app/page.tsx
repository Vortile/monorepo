"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";

type Email = {
  id: string;
  to: string[];
  subject: string;
  created_at: string;
};

const DEFAULT_LIMIT = 10;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

const Home = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestEmail = useMemo(() => emails[0], [emails]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/emails?limit=${DEFAULT_LIMIT}`,
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to load emails");
      }
      const list = Array.isArray(body?.data) ? body.data : [];
      setEmails(list as Email[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase">
            Vortile Admin
          </p>
          <h1 className="text-4xl font-black sm:text-5xl">
            Operations Console
          </h1>
          <p className="text-slate-600">
            Choose where to go: send flows or inspect recent Resend emails.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/send"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Send & Templates
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Trigger WhatsApp Cloud messages and manage template submissions.
            </p>
          </Link>

          <Link
            href="/emails"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Latest Resend Emails
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Review recent deliveries with adjustable batch size.
            </p>
          </Link>

          <Link
            href="/email-send"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              Send Email
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Compose and send an email via the API (Resend backend).
            </p>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Snapshot of the latest {DEFAULT_LIMIT} Resend emails.
          </p>
          <div className="flex items-center gap-2">
            {error ? (
              <span className="text-sm text-red-600">{error}</span>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={load}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Recent Emails"
            value={`${emails.length}/${DEFAULT_LIMIT}`}
            hint={emails.length > 0 ? "Fetched" : "No data"}
            tone={emails.length > 0 ? "success" : "muted"}
          />
          <StatCard
            label="Latest Subject"
            value={latestEmail?.subject ? latestEmail.subject : "—"}
            hint={latestEmail?.to ? latestEmail.to.join(", ") : "Awaiting"}
          />
          <StatCard
            label="Latest Timestamp"
            value={
              latestEmail?.created_at
                ? new Date(latestEmail.created_at).toLocaleString()
                : "—"
            }
            hint="Resend feed"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
