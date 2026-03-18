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

  const handleRefresh = React.useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <>
      <DataTable
        data={data}
        onView={handleView}
        onForward={handleForward}
        onRowClick={handleView}
        onRefresh={handleRefresh}
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
