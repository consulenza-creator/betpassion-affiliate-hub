import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardSummary } from "../lib/dashboard";
import type { DashboardPeriodId, DashboardSummary } from "../types";
import { KpiCardItem } from "../components/dashboard/KpiCardItem";
import { PerformanceChart } from "../components/dashboard/PerformanceChart";
import { QuickAccessWidget } from "../components/dashboard/SideWidgets";

const PERIODS: { id: DashboardPeriodId; label: string }[] = [
  { id: "yesterday", label: "Ieri" },
  { id: "last3", label: "Ultimi 3 giorni" },
  { id: "last7", label: "Ultimi 7 giorni" },
  { id: "currentMonth", label: "Mese corrente" },
  { id: "previousMonth", label: "Mese scorso" },
  { id: "last12m", label: "12 mesi" },
];

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("it-IT", { timeZone: "UTC" });
}

export function Dashboard() {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriodId>("last7");

  useEffect(() => {
    if (!currentUser) return;
    fetchDashboardSummary(currentUser.name, period)
      .then((s) => {
        setSummary(s);
        setError(null);
      })
      .catch(() => setError("Impossibile caricare i dati della dashboard."));
  }, [currentUser, period]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div>
        <h1 className="text-xl font-semibold">Bentornato, {currentUser?.name.split(" ")[0]}</h1>
        <p className="text-sm text-text-muted mt-1">Ecco il riepilogo della tua rete affiliati.</p>
      </div>

      {/* Filtro periodo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                period === p.id ? "bg-bp-green-light text-bp-black font-medium" : "text-text-muted hover:bg-surface-border"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {summary && (
          <span className="text-xs text-text-muted">
            {summary.period.start === summary.period.end
              ? formatDay(summary.period.start)
              : `${formatDay(summary.period.start)} – ${formatDay(summary.period.end)}`}
            {" · dati aggiornati al "}
            {formatDay(summary.period.anchor)}
          </span>
        )}
      </div>

      {summary?.playersUpTo && summary.playersUpTo < summary.period.anchor && (
        <p className="text-xs text-amber-400">
          Anagrafica giocatori aggiornata al {formatDay(summary.playersUpTo)}: "Nuovi giocatori" e FTD non includono le
          registrazioni successive. Depositi, giocato e GGR arrivano fino al {formatDay(summary.period.anchor)}.
        </p>
      )}

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
              <QuickAccessWidget />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
