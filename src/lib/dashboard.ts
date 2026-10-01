import { api } from "./api";
import type { CommissionType, DashboardSummary, KpiCard, PerformancePoint, TopLink } from "../types";

// Forma cosi' come la restituisce il backend (src/dashboard/dashboard.service.ts):
// le commissioni sono scoped al singolo affiliato autenticato, quindi non portano
// un nome affiliato proprio.
interface BackendCommission {
  id: string;
  type: CommissionType;
  amount: string;
  currency: string;
  status: "pending" | "approved" | "paid" | "rejected";
  createdAt: string;
}

interface BackendSummary {
  kpis: KpiCard[];
  performanceSeries: PerformancePoint[];
  topLinks: TopLink[];
  latestCommissions: BackendCommission[];
}

export async function fetchDashboardSummary(currentUserName: string): Promise<DashboardSummary> {
  const data = await api.get<BackendSummary>("/dashboard/summary");
  return {
    kpis: data.kpis,
    performanceSeries: data.performanceSeries,
    topLinks: data.topLinks,
    latestCommissions: data.latestCommissions.map((c) => ({
      id: c.id,
      affiliateName: currentUserName,
      type: c.type,
      amount: Number(c.amount),
      currency: "EUR",
      date: c.createdAt,
      status: c.status,
    })),
  };
}
