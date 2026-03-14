"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

interface EmailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    email: string;
    subject: string;
  };
}

export const EmailComposeDialog = ({ open, onOpenChange, replyTo }: EmailComposeDialogProps) => {
  const [to, setTo] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  React.useEffect(() => {
    if (open && replyTo) {
      setTo(replyTo.email);
      setSubject(replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`);
    } else if (open && !replyTo) {
      setTo("");
      setSubject("");
      setMessage("");
    }
  }, [open, replyTo]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from.trim() || undefined,
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.error || "Failed to send email");
      }

      toast.success("Email sent successfully!");
      onOpenChange(false);
      setTo("");
      setSubject("");
      setMessage("");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = to.trim() && subject.trim() && message.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{replyTo ? "Reply" : "New Message"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">
              From
            </Label>
            <Input
              id="from"
              placeholder="contact@vortile.com"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Input
              id="to"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="message" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="message"
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSend} disabled={!canSend || isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}