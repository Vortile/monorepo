"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Email = {
  id: number;
  subject: string;
  to: string;
  status: string;
  date: string;
  resendId?: string;
};

type EmailDetails = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  created_at: string;
  last_event: string;
  attachments?: Array<{
    id: string;
    filename: string;
    content_type?: string;
    size?: number;
  }>;
};

type EmailViewDialogProps = {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EmailViewDialog = ({
  email,
  open,
  onOpenChange,
}: EmailViewDialogProps) => {
  const [details, setDetails] = React.useState<EmailDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!email?.resendId || !open) {
      setDetails(null);
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE = (
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
        ).replace(/\/$/, "");

        const res = await fetch(`${API_BASE}/api/emails/${email.resendId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch email details");
        }
        const json = await res.json();
        setDetails(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [email?.resendId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed! inset-3! h-auto! w-auto! max-w-none! translate-x-0! translate-y-0! overflow-auto p-0">
        <div className="flex h-full w-full flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              View the full details of this email.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 px-6 py-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            )}

            {error && (
              <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {details && !loading && !error && (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">From</p>
                      <p className="text-muted-foreground text-sm">
                        {details.from}
                      </p>
                    </div>
                    <Badge variant="outline">{details.last_event}</Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">To</p>
                    <p className="text-muted-foreground text-sm">
                      {details.to.join(", ")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Subject</p>
                    <p className="text-muted-foreground text-sm">
                      {details.subject}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(details.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Content</p>
                  <div className="bg-muted/30 rounded-lg border p-6">
                    {details.html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: details.html }}
                        className="prose prose-sm dark:prose-invert max-w-none"
                      />
                    ) : (
                      <pre className="text-sm whitespace-pre-wrap">
                        {details.text || "No content available"}
                      </pre>
                    )}
                  </div>
                </div>

                {details.attachments && details.attachments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      Attachments ({details.attachments.length})
                    </p>
                    <div className="space-y-2">
                      {(() => {
                        const API_BASE = (
                          process.env.NEXT_PUBLIC_API_BASE_URL ??
                          "http://localhost:3000"
                        ).replace(/\/$/, "");

                        return details.attachments?.map((attachment) => {
                          const downloadUrl = `${API_BASE}/api/emails/${details.id}/attachments/${attachment.id}`;
                          const fileSize = attachment.size
                            ? `${(attachment.size / 1024).toFixed(1)} KB`
                            : "";

                          return (
                            <a
                              key={attachment.id}
                              href={downloadUrl}
                              download={attachment.filename}
                              className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-muted-foreground"
                                >
                                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">
                                    {attachment.filename}
                                  </p>
                                  {fileSize && (
                                    <p className="text-muted-foreground text-xs">
                                      {fileSize}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </a>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!email?.resendId && !loading && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                Email ID not available
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
