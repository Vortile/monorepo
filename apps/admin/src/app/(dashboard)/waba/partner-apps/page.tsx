import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerAppsTable } from "@/components/dashboard/partner-apps-table";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

type PartnerApp = {
  appId: string;
  appName: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
};

const fetchPartnerApps = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/waba/partner-apps`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `Failed to fetch partner apps: ${res.status} ${res.statusText}`,
      );
      return [];
    }

    const body = await res.json();

    if (!body?.success || !Array.isArray(body.data)) {
      console.error("Invalid response format:", body);
      return [];
    }

    return body.data as PartnerApp[];
  } catch (error) {
    console.error("Error fetching partner apps:", error);
    return [];
  }
};

const PartnerAppsPage = async () => {
  const partnerApps = await fetchPartnerApps();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {partnerApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-16 text-center">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">No Partner Apps Found</h3>
            <p className="text-muted-foreground text-sm">
              You don&apos;t have any apps linked to your partner account yet.
            </p>
            <p className="text-muted-foreground text-sm">
              Contact Gupshup support or create an app via the Partner Portal.
            </p>
          </div>
          <a
            href="https://partner.gupshup.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">Open Partner Portal</Button>
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Partner Apps</h1>
              <p className="text-muted-foreground text-sm">
                Apps linked to your Gupshup partner account
              </p>
            </div>
            <a
              href="https://partner.gupshup.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Open Partner Portal</Button>
            </a>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Apps ({partnerApps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <PartnerAppsTable apps={partnerApps} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PartnerAppsPage;
