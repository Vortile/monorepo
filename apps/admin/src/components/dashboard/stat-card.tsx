import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export const StatCard = ({
  label,
  value,
  hint,
  content,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  content?: ReactNode;
  tone?: "default" | "success" | "muted";
}) => (
  <Card className="h-fit border-slate-200 bg-white">
    <CardHeader className="relative flex w-full items-start justify-between overflow-hidden pb-4">
      <div className="w-full">
        <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
          {label}
        </p>
        <CardTitle className="mt-2 w-full text-3xl">{value}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <p className="text-sm text-slate-600">
        {tone === "success"
          ? "Healthy throughput"
          : tone === "muted"
            ? "Needs attention"
            : "Real-time snapshot"}
      </p>

      {hint ? (
        <Badge variant={tone} className="mt-4 truncate">
          {hint}
        </Badge>
      ) : null}
    </CardContent>
  </Card>
);
