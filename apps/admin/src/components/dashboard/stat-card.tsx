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
}) => {
  const badgeVariant = tone === "success" ? "default" : tone === "muted" ? "secondary" : "default";

  return (
    <Card className="h-fit border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
      <CardHeader className="relative flex w-full items-start justify-between overflow-hidden pb-4">
        <div className="w-full">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase dark:text-indigo-400">
            {label}
          </p>
          <CardTitle className="mt-2 w-full text-3xl">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {tone === "success"
            ? "Healthy throughput"
            : tone === "muted"
              ? "Needs attention"
              : "Real-time snapshot"}
        </p>
        {hint ? (
          <Badge variant={badgeVariant as "default" | "secondary" | "destructive" | "outline"} className="mt-4 truncate">
            {hint}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
};
