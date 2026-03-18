import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { EmailTableWrapper } from "@/components/dashboard/email-table-wrapper";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

type ResendEmail = {
  id: string;
  subject: string;
  to: string[];
  last_event: string;
  created_at: string;
};

const fetchEmails = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/emails?limit=50`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch emails: ${res.status} ${res.statusText}`);
      return [];
    }

    const body = await res.json();

    if (!body?.data || !Array.isArray(body.data)) {
      console.error("Invalid response format:", body);
      return [];
    }

    const list: ResendEmail[] = body.data;
    return list.map((email, i) => ({
      id: i + 1,
      resendId: email.id,
      subject: email.subject ?? "(no subject)",
      to: Array.isArray(email.to) ? email.to[0] : (email.to ?? ""),
      status: email.last_event === "bounced" ? "Bounced" : "Delivered",
      date: email.created_at ?? "",
    }));
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
};

const Page = async () => {
  const emails = await fetchEmails();

  // Calculate real metrics
  const totalEmails = emails.length;
  const deliveredCount = emails.filter((e) => e.status === "Delivered").length;
  const bouncedCount = emails.filter((e) => e.status === "Bounced").length;
  const deliveryRate =
    totalEmails > 0 ? (deliveredCount / totalEmails) * 100 : 0;
  const bounceRate = totalEmails > 0 ? (bouncedCount / totalEmails) * 100 : 0;
  const activeRecipients = new Set(emails.map((e) => e.to)).size;

  // Aggregate email data by date for chart
  const emailsByDate = emails.reduce(
    (acc, email) => {
      // Normalize date to YYYY-MM-DD format
      const dateObj = new Date(email.date);
      const date = dateObj.toISOString().split("T")[0]; // Get YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = { sent: 0, delivered: 0 };
      }
      acc[date].sent += 1;
      if (email.status === "Delivered") {
        acc[date].delivered += 1;
      }
      return acc;
    },
    {} as Record<string, { sent: number; delivered: number }>,
  );

  // Convert to chart data format and sort by date
  const chartData = Object.entries(emailsByDate)
    .map(([date, counts]) => ({
      date,
      sent: counts.sent,
      delivered: counts.delivered,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <SectionCards
        totalEmails={totalEmails}
        deliveryRate={deliveryRate}
        bounceRate={bounceRate}
        activeRecipients={activeRecipients}
      />
      <ChartAreaInteractive data={chartData} />
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No emails found. Make sure the server is running on{" "}
            <code className="text-foreground bg-muted rounded px-1 py-0.5 text-xs">
              http://localhost:3000
            </code>
          </p>
          <p className="text-muted-foreground text-xs">
            Run{" "}
            <code className="text-foreground bg-muted rounded px-1 py-0.5">
              pnpm dev:api
            </code>{" "}
            to start the server.
          </p>
        </div>
      ) : (
        <EmailTableWrapper data={emails} />
      )}
    </div>
  );
};

export default Page;
