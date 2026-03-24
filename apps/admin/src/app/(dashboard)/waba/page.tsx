import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WabaTableWrapper } from "@/components/dashboard/waba-table-wrapper";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

type WabaResponse = {
  id: string;
  merchantId: string;
  merchantName: string | null;
  provider: string;
  providerAccountId: string | null;
  providerAppId: string | null;
  businessPortfolioId: string | null;
  coexistEnabled: boolean;
  onboardingMethod: string | null;
  name: string | null;
  status: string;
  isPrimary: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

const fetchWabas = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/waba`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch WABAs: ${res.status} ${res.statusText}`);
      return [];
    }

    const body = await res.json();

    if (!body?.data || !Array.isArray(body.data)) {
      console.error("Invalid response format:", body);
      return [];
    }

    const list: WabaResponse[] = body.data;
    return list.map((waba) => ({
      id: waba.id,
      name: waba.name,
      merchantName: waba.merchantName,
      provider: waba.provider,
      providerAccountId: waba.providerAccountId,
      status: waba.status,
      isPrimary: waba.isPrimary,
      createdAt: new Date(waba.createdAt),
    }));
  } catch (error) {
    console.error("Error fetching WABAs:", error);
    return [];
  }
};

const WabaPage = async () => {
  const wabas = await fetchWabas();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {wabas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-16 text-center">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">No WABA Connections</h3>
            <p className="text-muted-foreground text-sm">
              You haven&apos;t registered any WhatsApp Business Accounts yet.
            </p>
            <p className="text-muted-foreground text-sm">
              Register your first WABA to start sending messages.
            </p>
          </div>
          <Link href="/waba/register">
            <Button>Register WABA</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">WABA Connections</h1>
              <p className="text-muted-foreground text-sm">
                Manage your WhatsApp Business Account connections
              </p>
            </div>
            <Link href="/waba/register">
              <Button>Register New WABA</Button>
            </Link>
          </div>
          <WabaTableWrapper data={wabas} />
        </div>
      )}
    </div>
  );
};

export default WabaPage;
