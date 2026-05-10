import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "ink"
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "ink" | "coral" | "ocean" | "leaf";
}) {
  const toneClass = {
    ink: "bg-ink text-white",
    coral: "bg-coral text-white",
    ocean: "bg-ocean text-white",
    leaf: "bg-leaf text-white"
  }[tone];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-3 text-3xl font-bold tracking-normal">{value}</div>
          <div className="mt-1 text-xs font-medium text-muted-foreground">{helper}</div>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
