"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconHeartbeat } from "@tabler/icons-react";

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

type HealthCheckResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  details?: string;
};

type PartnerAppsTableProps = {
  apps: PartnerApp[];
};

const getStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();

  if (statusLower === "active" || statusLower === "approved") {
    return <Badge className="bg-green-500">{status}</Badge>;
  }

  if (statusLower === "pending") {
    return <Badge variant="secondary">{status}</Badge>;
  }

  if (statusLower === "rejected" || statusLower === "suspended") {
    return <Badge variant="destructive">{status}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
};

export const PartnerAppsTable = ({ apps }: PartnerAppsTableProps) => {
  const router = useRouter();
  const [loadingHealth, setLoadingHealth] = React.useState<string | null>(null);
  const [healthResult, setHealthResult] =
    React.useState<HealthCheckResult | null>(null);
  const [showHealthDialog, setShowHealthDialog] = React.useState(false);

  const handleRowClick = (appId: string) => {
    router.push(`/waba/partner-apps/${appId}`);
  };

  const checkHealth = async (appId: string, e: React.MouseEvent) => {
    // Prevent row click when clicking health check button
    e.stopPropagation();

    setLoadingHealth(appId);
    setHealthResult(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/waba/partner-apps/${appId}/health`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      setHealthResult(data);
      setShowHealthDialog(true);
    } catch (error) {
      setHealthResult({
        success: false,
        error: "Failed to check health",
        details: error instanceof Error ? error.message : String(error),
      });
      setShowHealthDialog(true);
    } finally {
      setLoadingHealth(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App ID</TableHead>
            <TableHead>App Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <TableRow
              key={app.appId}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleRowClick(app.appId)}
            >
              <TableCell className="font-mono text-xs">{app.appId}</TableCell>
              <TableCell className="font-medium">
                {app.appName || "N/A"}
              </TableCell>
              <TableCell>{app.phoneNumber || "N/A"}</TableCell>
              <TableCell>{getStatusBadge(app.status)}</TableCell>
              <TableCell>
                {app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => checkHealth(app.appId, e)}
                  disabled={loadingHealth === app.appId}
                >
                  <IconHeartbeat className="mr-2 h-4 w-4" />
                  {loadingHealth === app.appId ? "Checking..." : "Check Health"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showHealthDialog} onOpenChange={setShowHealthDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Health Check Result</DialogTitle>
            <DialogDescription>
              Health status of the Gupshup app
            </DialogDescription>
          </DialogHeader>
          {healthResult && (
            <div className="space-y-4">
              {healthResult.success ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Healthy</Badge>
                  </div>
                  {healthResult.data && (
                    <div className="bg-muted rounded-md p-4">
                      <pre className="text-xs">
                        {JSON.stringify(healthResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Health Check Failed</Badge>
                  </div>
                  {healthResult.error && (
                    <p className="text-muted-foreground text-sm">
                      {healthResult.error}
                    </p>
                  )}
                  {healthResult.details && (
                    <div className="bg-muted rounded-md p-4">
                      <pre className="text-xs">{healthResult.details}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
