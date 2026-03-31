"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconPaperclip, IconX } from "@tabler/icons-react";
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

interface AttachmentFile {
  filename: string;
  content: string; // base64
  contentType: string;
  size: number;
}

interface EmailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    email: string;
    subject: string;
  };
}

export const EmailComposeDialog = ({
  open,
  onOpenChange,
  replyTo,
}: EmailComposeDialogProps) => {
  const [to, setTo] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachmentFile[]>([]);
  const [isSending, setIsSending] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && replyTo) {
      setTo(replyTo.email);
      setSubject(
        replyTo.subject.startsWith("Re:")
          ? replyTo.subject
          : `Re: ${replyTo.subject}`,
      );
    } else if (open && !replyTo) {
      setTo("");
      setSubject("");
      setMessage("");
      setAttachments([]);
    }
  }, [open, replyTo]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newAttachments = await Promise.all(
      files.map(
        (file) =>
          new Promise<AttachmentFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              // Strip "data:<type>;base64," prefix
              const base64 = dataUrl.split(",")[1];
              resolve({
                filename: file.name,
                content: base64,
                contentType: file.type || "application/octet-stream",
                size: file.size,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so the same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
          attachments: attachments.map(
            ({ filename, content, contentType }) => ({
              filename,
              content,
              contentType,
            }),
          ),
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
      setAttachments([]);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = to.trim() && subject.trim() && message.trim();

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
            <Label htmlFor="message" className="pt-2 text-right">
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

          {/* Attachments */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="pt-2 text-right">Attachments</Label>
            <div className="col-span-3 space-y-2">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {att.filename}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(att.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-7 w-7 shrink-0"
                    onClick={() => removeAttachment(i)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
              >
                <IconPaperclip className="mr-2 h-4 w-4" />
                Add attachment
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend || isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
