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
      <DialogContent className="fixed! inset-40! h-auto! w-auto! max-w-none! translate-x-0! translate-y-0! overflow-auto p-0">
        <div className="flex h-full w-full flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              View the full details of this email
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
