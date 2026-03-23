"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Mail,
  Reply,
  X,
  Paperclip,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  } catch {
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

type Attachment = {
  id?: string;
  filename: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  content_type: string;
  size: number;
  path?: string;
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
  attachments?: Attachment[];
};

const EmailsPage = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [limit, setLimit] = useState(10);
  const [direction, setDirection] = useState<"all" | "received" | "sent">(
    "all",
  );
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Reply state
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const downloadAttachment = (att: Attachment) => {
    if (att.path) {
      window.open(att.path, "_blank");
      return;
    }

    // If we have an ID, use the API download endpoint directly
    if (att.id && selectedEmail?.id) {
      const base = buildBase();
      if (base) {
        const url = `${base}/emails/${selectedEmail.id}/attachments/${att.id}`;
        window.open(url, "_blank");
        return;
      }
    }

    if (!att.content) {
      console.warn("Attachment has no content or path:", att);
      alert("Unable to download: Attachment content is missing.");
      return;
    }

    try {
      let content = att.content;

      // Handle Node.js Buffer JSON representation
      if (
        content &&
        typeof content === "object" &&
        content.type === "Buffer" &&
        Array.isArray(content.data)
      ) {
        content = new Uint8Array(content.data);
      } else if (Array.isArray(content)) {
        content = new Uint8Array(content);
      }

      const blob = new Blob([content], {
        type: att.content_type || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.filename || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download attachment", e);
      alert("Failed to download attachment. Check console for details.");
    }
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchEmails(limit, direction);
      const seen = new Map<string, Email>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // setIsLoadingDetail(true);
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
      // setIsLoadingDetail(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail) return;

    setIsSendingReply(true);
    setReplyError(null);

    try {
      const base = buildBase();
      if (!base) throw new Error("Invalid API URL");

      // Determine "to" address: if received, reply to sender. If sent, reply to recipient.
      const toAddress =
        selectedEmail.direction === "received"
          ? selectedEmail.from
          : selectedEmail.to[0];

      const response = await fetch(`${base}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toAddress,
          subject: selectedEmail.subject.startsWith("Re:")
            ? selectedEmail.subject
            : `Re: ${selectedEmail.subject}`,
          message: replyMessage,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send reply");
      }

      // Success
      setIsReplyOpen(false);
      setReplyMessage("");
      // Optionally reload to see the new sent email
      load();
    } catch (err) {
      setReplyError(
        err instanceof Error ? err.message : "Failed to send reply",
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8">
        <div className="space-y-3">
          <Badge variant="secondary" className="tracking-[0.25em] uppercase">
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

                  {selectedEmail.attachments &&
                  selectedEmail.attachments.length > 0 ? (
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <p className="text-xs font-medium text-slate-500">
                        Attachments
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.attachments.map((att, i) => {
                          const canDownload = !!(att.content || att.path);
                          return (
                            <button
                              type="button"
                              key={i}
                              disabled={!canDownload}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (canDownload) downloadAttachment(att);
                              }}
                              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                                canDownload
                                  ? "cursor-pointer border-slate-200 bg-slate-50 hover:bg-slate-100"
                                  : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                              }`}
                              title={
                                canDownload
                                  ? "Download"
                                  : "Content not available for this attachment"
                              }
                            >
                              <Paperclip className="h-4 w-4 text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {att.filename}
                              </span>
                              {att.size ? (
                                <span className="text-xs text-slate-500">
                                  ({Math.round(att.size / 1024)} KB)
                                </span>
                              ) : null}
                              {canDownload ? (
                                <Download className="ml-1 h-3 w-3 text-slate-400" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
                      variant="outline"
                      onClick={() => loadDetail(selectedEmail)}
                    >
                      Refresh
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setReplyMessage("");
                        setReplyError(null);
                        setIsReplyOpen(true);
                      }}
                    >
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reply Modal */}
        {isReplyOpen && selectedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <Card className="animate-in fade-in zoom-in-95 w-full max-w-lg shadow-xl duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Reply to Email</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsReplyOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    readOnly
                    disabled
                    value={
                      selectedEmail.direction === "received"
                        ? selectedEmail.from
                        : selectedEmail.to.join(", ")
                    }
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    readOnly
                    disabled
                    value={
                      selectedEmail.subject.startsWith("Re:")
                        ? selectedEmail.subject
                        : `Re: ${selectedEmail.subject}`
                    }
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {replyError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {replyError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsReplyOpen(false)}
                    disabled={isSendingReply}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isSendingReply}
                  >
                    {isSendingReply ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmailsPage;
