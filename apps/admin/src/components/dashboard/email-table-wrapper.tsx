"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DataTable, schema } from "@/components/data-table";
import { EmailViewDialog } from "@/components/dashboard/email-view-dialog";
import { EmailForwardDialog } from "@/components/dashboard/email-forward-dialog";
import { z } from "zod";

type EmailData = z.infer<typeof schema>;

type EmailTableWrapperProps = {
  data: EmailData[];
};

export const EmailTableWrapper = ({ data }: EmailTableWrapperProps) => {
  const router = useRouter();
  const [selectedEmail, setSelectedEmail] = React.useState<EmailData | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = React.useState(false);

  const handleView = React.useCallback((email: EmailData) => {
    setSelectedEmail(email);
    setViewDialogOpen(true);
  }, []);

  const handleForward = React.useCallback((email: EmailData) => {
    setSelectedEmail(email);
    setForwardDialogOpen(true);
  }, []);

  const handleDelete = React.useCallback(
    async (email: EmailData) => {
      if (!email.resendId) {
        alert("Cannot delete: Email ID not available");
        return;
      }

      if (
        !confirm(
          `Are you sure you want to cancel/delete the email "${email.subject}"?`,
        )
      ) {
        return;
      }

      try {
        const API_BASE = (
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
        ).replace(/\/$/, "");

        const res = await fetch(`${API_BASE}/api/emails/${email.resendId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to delete email");
        }

        alert("Email canceled successfully");
        router.refresh();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Failed to delete email. Only scheduled emails can be canceled.",
        );
      }
    },
    [router],
  );

  return (
    <>
      <DataTable
        data={data}
        onView={handleView}
        onForward={handleForward}
        onDelete={handleDelete}
        onRowClick={handleView}
      />
      <EmailViewDialog
        email={selectedEmail}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      <EmailForwardDialog
        email={selectedEmail}
        open={forwardDialogOpen}
        onOpenChange={setForwardDialogOpen}
      />
    </>
  );
};
