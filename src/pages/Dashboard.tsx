import { useAuth } from "../context/AuthContext";
import { KPI_CARDS } from "../data/mockDashboard";
import { KpiCardItem } from "../components/dashboard/KpiCardItem";
import { PerformanceChart } from "../components/dashboard/PerformanceChart";
import { TopLinksWidget, LatestCommissionsWidget, QuickAccessWidget } from "../components/dashboard/SideWidgets";

export function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h1 className="text-xl font-semibold">Bentornato, {currentUser.name.split(" ")[0]}</h1>
        <p className="text-sm text-text-muted mt-1">Ecco il riepilogo della tua rete affiliati oggi.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-4">
        {KPI_CARDS.map((kpi) => (
          <KpiCardItem key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Chart + side widgets */}
      <div className="grid grid-cols-3 gap-4">
        <PerformanceChart />
        <div className="space-y-4">
          <TopLinksWidget />
          <QuickAccessWidget />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <LatestCommissionsWidget />
      </div>
    </div>
  );
}
