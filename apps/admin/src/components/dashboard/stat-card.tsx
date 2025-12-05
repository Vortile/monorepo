import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatCard = ({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "muted";
}) => (
  <Card className="border-slate-200 bg-white">
    <CardHeader className="flex items-start justify-between pb-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
          {label}
        </p>
        <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
      </div>
      {hint ? <Badge variant={tone}>{hint}</Badge> : null}
    </CardHeader>
    <CardContent className="pt-0 text-sm text-slate-600">
      {tone === "success"
        ? "Healthy throughput"
        : tone === "muted"
          ? "Needs attention"
          : "Real-time snapshot"}
    </CardContent>
  </Card>
);
