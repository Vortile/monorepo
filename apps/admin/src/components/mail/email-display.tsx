"use client";

import * as React from "react";
import { format } from "date-fns";
import { Paperclip, Reply } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EmailComposeDialog } from "./email-compose-dialog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

type Email = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  created_at: string;
  direction?: "sent" | "received";
  attachments?: Record<string, unknown>[];
};

export const EmailDisplay = ({
  mailId,
  initialMail,
}: {
  mailId: string;
  initialMail: Email;
}) => {
  const [mail, setMail] = React.useState<Email>(initialMail);
  const [loading, setLoading] = React.useState(false);
  const [replyOpen, setReplyOpen] = React.useState(false);

  React.useEffect(() => {
    // If the selected email changes, reset logic and load detailed version.
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/emails/${mailId}`);
        const body = await res.json();
        if (res.ok && body.data && isMounted) {
          setMail(body.data);
        }
      } catch {
        toast.error("Failed to load email detail.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [mailId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReplyOpen(true)}
          >
            <Reply className="h-4 w-4" />
            <span className="sr-only">Reply</span>
          </Button>
        </div>
      </div>
      <Separator />

      {loading && !mail.html && !mail.text ? (
        <div className="text-muted-foreground flex-1 animate-pulse p-8 text-center">
          Loading content...
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-8">
            <div className="mb-6 flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {mail.from?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-semibold">{mail.from}</div>
                  <div className="text-muted-foreground text-xs">
                    {format(new Date(mail.created_at || new Date()), "PPP p")}
                  </div>
                </div>
                <div className="text-sm font-medium">{mail.subject}</div>
                <div className="text-muted-foreground text-xs">
                  To: {mail.to?.join(", ")}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {mail.html ? (
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: mail.html }}
              />
            ) : mail.text ? (
              <div className="text-sm whitespace-pre-wrap">{mail.text}</div>
            ) : (
              <div className="text-muted-foreground text-sm italic">
                Empty message.
              </div>
            )}

            {mail.attachments && mail.attachments.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Paperclip className="h-4 w-4" /> Attachments
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {mail.attachments.map(
                      (att: Record<string, unknown>, i: number) => (
                        <div
                          key={i}
                          className="bg-muted/20 relative flex w-40 max-w-full flex-col items-center gap-2 overflow-hidden rounded-lg border p-4 text-center"
                        >
                          <div className="bg-primary/10 rounded-full p-3">
                            <Paperclip className="text-primary h-6 w-6" />
                          </div>
                          <span
                            className="w-full truncate text-xs"
                            title={att.filename as string}
                          >
                            {att.filename as string}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {((att.size as number) / 1024).toFixed(1)} KB
                          </span>
                          <a
                            href={`${API_BASE_URL}/emails/${mailId}/attachments/${String(att.id || i)}`}
                            target="_blank"
                            download={att.filename as string}
                            className="absolute inset-0 z-10"
                            rel="noreferrer"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      )}
      <EmailComposeDialog
        open={replyOpen}
        onOpenChange={setReplyOpen}
        replyTo={{ email: mail.from, subject: mail.subject }}
      />
    </div>
  );
};
