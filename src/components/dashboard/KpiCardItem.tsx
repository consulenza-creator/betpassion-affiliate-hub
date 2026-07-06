import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { KpiCard } from "../../types";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

export function KpiCardItem({ kpi }: { kpi: KpiCard }) {
  const Icon = TREND_ICON[kpi.trend];
  const tone = kpi.trend === "up" ? "green" : kpi.trend === "down" ? "warning" : "neutral";

  return (
    <Card>
      <div className="text-xs text-text-muted mb-2">{kpi.label}</div>
      <div className="text-2xl font-semibold mb-2">{kpi.value}</div>
      <Badge tone={tone}>
        <Icon size={12} className="mr-1" />
        {kpi.deltaPct > 0 ? "+" : ""}
        {kpi.deltaPct}%
      </Badge>
    </Card>
  );
}
