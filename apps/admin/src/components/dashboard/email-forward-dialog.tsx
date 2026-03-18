"use client";

import * as React from "react";
import { IconChevronRight } from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Email = {
  id: number;
  subject: string;
  to: string;
  status: string;
  date: string;
  resendId?: string;
};

type EmailForwardDialogProps = {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EmailForwardDialog = ({
  email,
  open,
  onOpenChange,
}: EmailForwardDialogProps) => {
  const [forwardTo, setForwardTo] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setForwardTo("");
      setMessage("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !forwardTo.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const API_BASE = (
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
      ).replace(/\/$/, "");

      const res = await fetch(`${API_BASE}/api/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: forwardTo.trim(),
          subject: `Fwd: ${email.subject}`,
          message: message.trim() || `Forwarded email: ${email.subject}`,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to forward email");
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Forward Email</DialogTitle>
          <DialogDescription>
            Forward &quot;{email?.subject}&quot; to another recipient
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleForward} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forward-to">Recipient Email</Label>
            <Input
              id="forward-to"
              type="email"
              placeholder="recipient@example.com"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forward-message">
              Additional Message (Optional)
            </Label>
            <Textarea
              id="forward-message"
              placeholder="Add a message with the forwarded email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading || success}
              rows={4}
            />
          </div>

          {error && (
            <div className="border-destructive bg-destructive/10 rounded-lg border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                Email forwarded successfully!
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? "Sending..." : "Forward"}
              {!loading && <IconChevronRight className="ml-1" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
