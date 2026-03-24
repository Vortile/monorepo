"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconDotsVertical,
  IconCircleCheckFilled,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WabaConnection = {
  id: string;
  name: string | null;
  merchantName: string | null;
  provider: string;
  providerAccountId: string | null;
  status: string;
  isPrimary: boolean;
  createdAt: Date;
};

type WabaTableWrapperProps = {
  data: WabaConnection[];
};

export const WabaTableWrapper = ({ data }: WabaTableWrapperProps) => {
  const router = useRouter();

  const handleSendMessage = React.useCallback((waba: WabaConnection) => {
    // TODO: Navigate to send message page
    console.log("Send message with WABA:", waba.id);
  }, []);

  const handleViewDetails = React.useCallback((waba: WabaConnection) => {
    // TODO: Open details dialog or navigate to details page
    console.log("View WABA details:", waba.id);
  }, []);

  const handleRefresh = React.useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">WABA Connections</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No WABA connections found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((waba) => (
                  <TableRow key={waba.id}>
                    <TableCell className="font-medium">
                      {waba.name || "Unnamed WABA"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {waba.merchantName || "Unknown Merchant"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {waba.provider}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {waba.providerAccountId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          waba.status === "active" ? "default" : "secondary"
                        }
                        className="gap-1"
                      >
                        {waba.status === "active" ? (
                          <IconCircleCheckFilled className="size-3" />
                        ) : (
                          <IconAlertCircle className="size-3" />
                        )}
                        {waba.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {waba.isPrimary && (
                        <Badge variant="outline" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(waba.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="text-muted-foreground data-[state=open]:bg-muted flex size-8"
                              size="icon"
                            />
                          }
                        >
                          <IconDotsVertical />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleSendMessage(waba)}
                          >
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(waba)}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
