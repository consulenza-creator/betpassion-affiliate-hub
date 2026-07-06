import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card } from "../ui/Card";
import { PERFORMANCE_SERIES } from "../../data/mockDashboard";

const PERIODS = [
  { id: "6m", label: "6 mesi" },
  { id: "3m", label: "3 mesi" },
  { id: "1m", label: "1 mese" },
] as const;

export function PerformanceChart() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("6m");

  const slice =
    period === "6m" ? PERFORMANCE_SERIES : period === "3m" ? PERFORMANCE_SERIES.slice(-3) : PERFORMANCE_SERIES.slice(-1);

  return (
    <Card className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Andamento performance</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                period === p.id
                  ? "bg-bp-green-light text-bp-black font-medium"
                  : "text-text-muted hover:bg-surface-border"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={slice}>
            <CartesianGrid stroke="#262832" strokeDasharray="3 3" />
            <XAxis dataKey="period" stroke="#9aa0ac" fontSize={12} />
            <YAxis stroke="#9aa0ac" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#1b1d24", border: "1px solid #262832", borderRadius: 8 }}
              labelStyle={{ color: "#f3f4f6" }}
            />
            <Line type="monotone" dataKey="commission" stroke="#50AE3A" strokeWidth={2} dot={false} name="Commissioni (€)" />
            <Line type="monotone" dataKey="clicks" stroke="#989898" strokeWidth={2} dot={false} name="Click" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
