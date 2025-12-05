import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, merchant, eq } from "@vortile/database";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const user = await currentUser();
  if (!user) return null;

  const userMerchant = await db.query.merchant.findFirst({
    where: eq(merchant.clerkId, user.id),
  });

  if (!userMerchant) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
