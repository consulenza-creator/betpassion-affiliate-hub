import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardSummary } from "../lib/dashboard";
import type { DashboardSummary } from "../types";
import { KpiCardItem } from "../components/dashboard/KpiCardItem";
import { PerformanceChart } from "../components/dashboard/PerformanceChart";
import { TopLinksWidget, LatestCommissionsWidget, QuickAccessWidget } from "../components/dashboard/SideWidgets";

export function Dashboard() {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchDashboardSummary(currentUser.name)
      .then(setSummary)
      .catch(() => setError("Impossibile caricare i dati della dashboard."));
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h1 className="text-xl font-semibold">Bentornato, {currentUser?.name.split(" ")[0]}</h1>
        <p className="text-sm text-text-muted mt-1">Ecco il riepilogo della tua rete affiliati oggi.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {summary && (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-3 gap-4">
            {summary.kpis.map((kpi) => (
              <KpiCardItem key={kpi.id} kpi={kpi} />
            ))}
          </div>

          {/* Chart + side widgets */}
          <div className="grid grid-cols-3 gap-4">
            <PerformanceChart data={summary.performanceSeries} />
            <div className="space-y-4">
              <TopLinksWidget links={summary.topLinks} />
              <QuickAccessWidget />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <LatestCommissionsWidget commissions={summary.latestCommissions} />
          </div>
        </>
      )}
    </div>
  );
}
